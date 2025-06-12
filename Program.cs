using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;

const int KILL_WAIT = 60; // seconds idle allowed
const string appName = "xeyes";
List<ActiveSessions> sessions = new();

// Build the web app.
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Logging middleware: log every HTTP request.
app.Use(async (context, next) =>
{
    Logger.Log($"HTTP {context.Request.Method} {context.Request.Path}{context.Request.QueryString}");
    await next();
});

// Middleware to normalize paths: replace multiple slashes with a single slash.
app.Use(async (context, next) =>
{
    if (!string.IsNullOrEmpty(context.Request.Path.Value))
    {
        string normalized = Regex.Replace(context.Request.Path.Value, @"\/{2,}", "/");
        if (normalized != context.Request.Path.Value)
        {
            Logger.Log($"Normalized path from {context.Request.Path.Value} to {normalized}");
            context.Request.Path = new PathString(normalized);
        }
    }
    await next();
});

// Set up static file middleware with explicit MIME types.
var contentProvider = new FileExtensionContentTypeProvider();
contentProvider.Mappings[".js"] = "application/javascript";
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "static")),
    RequestPath = "/static",
    ContentTypeProvider = contentProvider
});

app.UseWebSockets();

// Helper functions

bool Authenticate(string cookie) => true;

int GetFreePort()
{
    using var listener = new TcpListener(IPAddress.Loopback, 0);
    listener.Start();
    int port = ((IPEndPoint)listener.LocalEndpoint).Port;
    listener.Stop();
    Logger.Log($"FreePort allocated: {port}");
    return port;
}

bool WaitForPortOpen(int port, int timeoutMs = 5000)
{
    var sw = Stopwatch.StartNew();
    while (sw.ElapsedMilliseconds < timeoutMs)
    {
        try
        {
            using (var client = new TcpClient("127.0.0.1", port))
                return true;
        }
        catch { Thread.Sleep(100); }
    }
    return false;
}

ActiveSessions StartSession(string cookie)
{
    int vncPort = GetFreePort(), wsPort = GetFreePort(), display = new Random().Next(1, 100);
    // Launch vncserver configured for a passwordless, localhost-bound session.
    var vnc = Process.Start(new ProcessStartInfo("vncserver", $":{display} -rfbport {vncPort} -localhost -SecurityTypes None") { UseShellExecute = false })!;
    if (!WaitForPortOpen(vncPort))
        Logger.Log($"Warning: vnc server on port {vncPort} did not open within timeout.");
    // Start the app (xeyes) only after vncserver is confirmed to be listening.
    var appProc = Process.Start(new ProcessStartInfo("xeyes")
    {
        UseShellExecute = false,
        Environment = { ["DISPLAY"] = $":{display}" }
    })!;
    // Start websockify on a private, localhost-only port.
    var wsProc = Process.Start(new ProcessStartInfo("websockify", $"{wsPort} localhost:{vncPort}") { UseShellExecute = false })!;
    Logger.Log($"Session started: cookie={cookie}, display=:{display}, vnc(pid={vnc.Id}@{vncPort}), xeyes(pid={appProc.Id}), ws(pid={wsProc.Id}@{wsPort})");
    return new ActiveSessions
    {
        Cookie = cookie,
        LastActive = DateTime.UtcNow,
        VncProcess = vnc,
        WebsockifyProcess = wsProc,
        AppProcess = appProc,
        VncPort = vncPort,
        WebsockifyPort = wsPort
    };
}

void UpdateSession(string cookie)
{
    int idx = sessions.FindIndex(s => s.Cookie == cookie);
    if (idx != -1)
    {
        var s = sessions[idx];
        s.LastActive = DateTime.UtcNow;
        sessions[idx] = s;
        Logger.Log($"Session updated: cookie={cookie}, LastActive={s.LastActive:O}");
    }
}

async Task Pump(WebSocket src, WebSocket dst, string cookie)
{
    var buffer = new byte[4096];
    Logger.Log($"Pump started for cookie={cookie}");
    while (src.State == WebSocketState.Open)
    {
        var result = await src.ReceiveAsync(buffer, CancellationToken.None);
        if (result.MessageType == WebSocketMessageType.Close)
            break;
        UpdateSession(cookie);
        Logger.Log($"Pump {cookie}: forwarded {result.Count} bytes");
        await dst.SendAsync(new ArraySegment<byte>(buffer, 0, result.Count), result.MessageType, result.EndOfMessage, CancellationToken.None);
    }
    Logger.Log($"Pump ended for cookie={cookie}");
}

// Periodic cleanup: remove sessions idle longer than KILL_WAIT seconds.
_ = Task.Run(async () =>
{
    while (true)
    {
        await Task.Delay(5000);
        sessions.RemoveAll(s =>
        {
            if ((DateTime.UtcNow - s.LastActive).TotalSeconds > KILL_WAIT)
            {
                Logger.Log($"Session idle: cookie={s.Cookie} idle for {(DateTime.UtcNow - s.LastActive).TotalSeconds}s; killing vnc(pid={s.VncProcess?.Id}), ws(pid={s.WebsockifyProcess?.Id}), app(pid={s.AppProcess?.Id})");
                try { if (!s.WebsockifyProcess.HasExited) s.WebsockifyProcess.Kill(); } catch { }
                try { if (!s.VncProcess.HasExited) s.VncProcess.Kill(); } catch { }
                try { if (!s.AppProcess.HasExited) s.AppProcess.Kill(); } catch { }
                return true;
            }
            return false;
        });
    }
});

// Define application routes

// GET "/" checks for the session cookie and either creates a new session or reuses it.
// Redirects to vnc_lite.html with query parameters that include the session and the public WS endpoint path.
app.MapGet("/", (HttpContext context) =>
{
    string sessionCookieName = $"session_{appName}";
    string cookie = context.Request.Cookies[sessionCookieName] ?? Guid.NewGuid().ToString();
    context.Response.Cookies.Append(sessionCookieName, cookie);
    ActiveSessions session;
    if (!sessions.Any(s => s.Cookie == cookie))
    {
        session = StartSession(cookie);
        sessions.Add(session);
        Logger.Log($"New session created for cookie={cookie}");
    }
    else
    {
        session = sessions.First(s => s.Cookie == cookie);
        Logger.Log($"Existing session accessed for cookie={cookie}");
    }
    context.Response.Redirect($"/static/vnc_lite.html?session={cookie}&path=/{appName}/ws");
});

// Public WebSocket endpoint at "/xeyes/ws".
// It uses the "session_xeyes" cookie to authenticate and then connects internally to the websockify instance.
app.Map($"/{appName}/ws", async (HttpContext context) =>
{
    string sessionCookieName = $"session_{appName}";
    string cookie = context.Request.Cookies[sessionCookieName] ?? Guid.NewGuid().ToString();
    if (context.Request.Cookies[sessionCookieName] is null)
        context.Response.Cookies.Append(sessionCookieName, cookie);
    if (!context.WebSockets.IsWebSocketRequest)
    {
        context.Response.StatusCode = 400;
        Logger.Log($"{appName} ws rejected: Not a WebSocket request");
        return;
    }
    if (!Authenticate(cookie))
    {
        context.Response.StatusCode = 401;
        Logger.Log($"{appName} ws rejected: Authentication failed");
        return;
    }
    int idx = sessions.FindIndex(s => s.Cookie == cookie);
    if (idx == -1)
    {
        var session = StartSession(cookie);
        sessions.Add(session);
        idx = sessions.Count - 1;
        Logger.Log($"Session restarted for cookie={cookie}");
    }
    var userSession = sessions[idx];
    using var ws = await context.WebSockets.AcceptWebSocketAsync();
    Logger.Log($"WebSocket accepted for cookie={cookie}");
    using var client = new ClientWebSocket();
    // Connect internally to the private websockify instance.
    await client.ConnectAsync(new Uri($"ws://127.0.0.1:{userSession.WebsockifyPort}"), CancellationToken.None);
    Logger.Log($"WebSocket connected to internal ws: cookie={cookie}");
    var t1 = Pump(ws, client, cookie);
    var t2 = Pump(client, ws, cookie);
    await Task.WhenAny(t1, t2);
    await client.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
    await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
    Logger.Log($"WebSocket closed for cookie={cookie}");
});

app.Run();

static class Logger
{
    public static void Log(string msg) => Console.WriteLine($"[{DateTime.UtcNow:O}] {msg}");
}

struct ActiveSessions
{
    public string Cookie;
    public DateTime LastActive;
    public Process VncProcess;
    public Process WebsockifyProcess;
    public Process AppProcess;
    public int VncPort;
    public int WebsockifyPort;
}

