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

// Log every incoming HTTP request.
app.Use(async (context, next) =>
{
    Logger.Log($"HTTP {context.Request.Method} {context.Request.Path}{context.Request.QueryString}");
    await next();
});

// Normalize request paths: replace multiple slashes with a single slash.
app.Use(async (context, next) =>
{
    if (!string.IsNullOrWhiteSpace(context.Request.Path.Value))
    {
        string original = context.Request.Path.Value;
        string normalized = Regex.Replace(original, "/+", "/");
        if (normalized != original)
        {
            Logger.Log($"Normalized path from {original} to {normalized}");
            context.Request.Path = new PathString(normalized);
        }
    }
    await next();
});

// Static files: explicitly serve .js files with "application/javascript".
var contentProvider = new FileExtensionContentTypeProvider();
contentProvider.Mappings[".js"] = "application/javascript";
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "static")),
    RequestPath = "/static",
    ContentTypeProvider = contentProvider
});

app.UseWebSockets();

// -------------------- Helper Functions --------------------

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

// Poll until the given port is open, up to timeoutMs.
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

// Starts the session: launches vncserver, waits for it, then starts the app and websockify.
ActiveSessions StartSession(string cookie)
{
    int vncPort = GetFreePort(), wsPort = GetFreePort(), display = new Random().Next(1, 100);
    // Launch passwordless, localhost-bound vncserver.
    var vnc = Process.Start(new ProcessStartInfo("vncserver", $":{display} -rfbport {vncPort} -localhost -SecurityTypes None")
    {
        UseShellExecute = false
    })!;
    if (!WaitForPortOpen(vncPort))
        Logger.Log($"Warning: vnc server on port {vncPort} did not open within timeout.");
    // Start the app (xeyes) using the DISPLAY variable.
    var appProc = Process.Start(new ProcessStartInfo("xeyes")
    {
        UseShellExecute = false,
        Environment = { ["DISPLAY"] = $":{display}" }
    })!;
    // Start websockify bound to localhost only.
    var wsProc = Process.Start(new ProcessStartInfo("websockify", $"{wsPort} localhost:{vncPort}")
    {
        UseShellExecute = false
    })!;
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

// Bidirectional pump: relays bytes between the two WebSocket endpoints.
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
        await dst.SendAsync(new ArraySegment<byte>(buffer, 0, result.Count),
            result.MessageType, result.EndOfMessage, CancellationToken.None);
    }
    Logger.Log($"Pump ended for cookie={cookie}");
}

// Periodic cleanup: every 5 seconds, remove sessions idle longer than KILL_WAIT.
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

// -------------------- Routes --------------------

// GET "/"  check the session cookie ("session_xeyes"), then start or reuse the session.
// Redirects to vnc_lite.html with query parameters: session and path (the public WebSocket endpoint).
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

// WebSocket endpoint at "/xeyes/ws"  the forwarder.
// It accepts an upgrade, logs the upgrade process separately, and then forwards data to the internal websockify instance.
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
    WebSocket ws = null;
    try
    {
        ws = await context.WebSockets.AcceptWebSocketAsync();
        Logger.Log($"WebSocket upgrade accepted for cookie={cookie}");
    }
    catch (Exception ex)
    {
        Logger.Log($"WebSocket upgrade failed for cookie={cookie}: {ex.Message}");
        return;
    }
    using (ws)
    {
        using var client = new ClientWebSocket();
        try
        {
            await client.ConnectAsync(new Uri($"ws://127.0.0.1:{userSession.WebsockifyPort}"), CancellationToken.None);
            Logger.Log($"Internal WebSocket connected for cookie={cookie}");
        }
        catch (Exception ex)
        {
            Logger.Log($"Internal WebSocket connection failed for cookie={cookie}: {ex.Message}");
            return;
        }
        var t1 = Pump(ws, client, cookie);
        var t2 = Pump(client, ws, cookie);
        await Task.WhenAny(t1, t2);
        try
        {
            await client.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
            await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
        }
        catch (Exception ex)
        {
            Logger.Log($"Error closing WebSockets for cookie={cookie}: {ex.Message}");
        }
        Logger.Log($"WebSocket closed for cookie={cookie}");
    }
});

app.Run();

// -------------------- Type Declarations --------------------

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

