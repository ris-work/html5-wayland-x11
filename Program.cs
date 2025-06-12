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

// ----------------------------------------------------------------
// Top-level statements start here.
// ----------------------------------------------------------------

const int KILL_WAIT = 60; // seconds idle allowed
const string defaultApp = "xclock"; // default target app if not specified
List<ActiveSessions> sessions = new();

// Enable conditional logging (true to log, false to disable).
Logger.Debug = true; 

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Log every incoming HTTP request.
app.Use(async (context, next) =>
{
    Logger.Log($"HTTP {context.Request.Method} {context.Request.Path}{context.Request.QueryString}");
    await next();
});

// Normalize request paths: replace duplicate slashes with a single slash.
app.Use(async (context, next) =>
{
    if (!string.IsNullOrWhiteSpace(context.Request.Path.Value))
    {
        string original = context.Request.Path.Value;
        string normalized = Regex.Replace(original, "/+", "/");
        if (normalized != original)
        {
            Logger.Log($"Normalized path from '{original}' to '{normalized}'");
            context.Request.Path = new PathString(normalized);
        }
    }
    await next();
});

// Serve static files. Explicitly map ".js" files to "application/javascript".
var contentProvider = new FileExtensionContentTypeProvider();
contentProvider.Mappings[".js"] = "application/javascript";
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "static")),
    RequestPath = "/static",
    ContentTypeProvider = contentProvider
});

app.UseWebSockets();

// ---------------- Helper Functions ----------------

// A simple stub that always returns true.
bool Authenticate(string cookie) => true;

// Returns a free TCP port.
int GetFreePort()
{
    using var listener = new TcpListener(IPAddress.Loopback, 0);
    listener.Start();
    int port = ((IPEndPoint)listener.LocalEndpoint).Port;
    listener.Stop();
    Logger.Log($"FreePort allocated: {port}");
    return port;
}

// Poll until the given port is open or timeout elapses.
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

// Starts a new session by launching the VNC server (passwordless and localhost-bound),
// waiting for it to open, then launching the target GUI app (procName, e.g. "xeyes" or "xclock")
// and finally starting websockify.
ActiveSessions StartSession(string cookie, string procName)
{
    int vncPort = GetFreePort(), wsPort = GetFreePort(), display = new Random().Next(1, 100);
    // Launch vncserver with -localhost and -SecurityTypes None.
    var vnc = Process.Start(new ProcessStartInfo("vncserver", $":{display} -rfbport {vncPort} -localhost -SecurityTypes None")
    {
        UseShellExecute = false
    })!;
    if (!WaitForPortOpen(vncPort))
        Logger.Log($"Warning: vnc server on port {vncPort} did not open within timeout.");
    // Launch the target GUI process.
    var appProc = Process.Start(new ProcessStartInfo(procName)
    {
        UseShellExecute = false,
        Environment = { ["DISPLAY"] = $":{display}" }
    })!;
    // Launch websockify on a private port forwarding to vncPort.
    var wsProc = Process.Start(new ProcessStartInfo("websockify", $"{wsPort} localhost:{vncPort}")
    {
        UseShellExecute = false
    })!;
    Logger.Log($"Session started: cookie={cookie}, display=:{display}, vnc(pid={vnc.Id}@{vncPort}), {procName}(pid={appProc.Id}), ws(pid={wsProc.Id}@{wsPort})");
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

// Update a session's last active timestamp.
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

// Bidirectional pump to relay data between two WebSocket endpoints.
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

// Periodic cleanup: remove sessions idle longer than KILL_WAIT.
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

// ---------------- Routes ----------------

// GET "/" route:
// Reads an optional query parameter "app" (defaulting to "xclock"), sets a session cookie,
// starts (or reuses) a session, and then redirects the user to "/static/vnc_lite.html"
// with query parameters "session" (the session cookie) and "path" (the public WS endpoint).
app.MapGet("/", (HttpContext context) =>
{
    string targetApp = context.Request.Query["app"];
    if (string.IsNullOrEmpty(targetApp))
        targetApp = defaultApp;
    string sessionCookieName = $"session_{targetApp}";
    string cookie = context.Request.Cookies[sessionCookieName] ?? Guid.NewGuid().ToString();
    context.Response.Cookies.Append(sessionCookieName, cookie);
    ActiveSessions session;
    if (!sessions.Any(s => s.Cookie == cookie))
    {
        session = StartSession(cookie, targetApp);
        sessions.Add(session);
        Logger.Log($"New session created for cookie={cookie} with app={targetApp}");
    }
    else
    {
        session = sessions.First(s => s.Cookie == cookie);
        Logger.Log($"Existing session accessed for cookie={cookie} with app={targetApp}");
    }
    // Redirect the browser to the VNC web client (vnc_lite.html). The WS endpoint is passed as a
    // query parameter so that the client connects internally. Notice we never expose /{targetApp}/ws.
    context.Response.Redirect($"/static/vnc_lite.html?session={cookie}&path=/{targetApp}/ws");
});

// WebSocket forwarder endpoint for "/{targetApp}/ws":
// This route is not directly exposed to the user but is referenced by vnc_lite.html.
app.Map("/{targetApp}/ws", async (HttpContext context) =>
{
    string targetApp = (string?)context.Request.RouteValues["targetApp"] ?? defaultApp;
    string sessionCookieName = $"session_{targetApp}";
    string cookie = context.Request.Cookies[sessionCookieName] ?? Guid.NewGuid().ToString();
    if (context.Request.Cookies[sessionCookieName] is null)
        context.Response.Cookies.Append(sessionCookieName, cookie);
    if (!context.WebSockets.IsWebSocketRequest)
    {
        context.Response.StatusCode = 400;
        Logger.Log($"{targetApp} ws rejected: Not a WebSocket request");
        return;
    }
    if (!Authenticate(cookie))
    {
        context.Response.StatusCode = 401;
        Logger.Log($"{targetApp} ws rejected: Authentication failed");
        return;
    }
    int idx = sessions.FindIndex(s => s.Cookie == cookie);
    if (idx == -1)
    {
        var session = StartSession(cookie, targetApp);
        sessions.Add(session);
        idx = sessions.Count - 1;
        Logger.Log($"Session restarted for cookie={cookie} with app={targetApp}");
    }
    var userSession = sessions[idx];
    WebSocket ws = null;
    try
    {
        ws = await context.WebSockets.AcceptWebSocketAsync();
        Logger.Log($"WebSocket upgrade accepted for cookie={cookie} in app={targetApp}");
    }
    catch (Exception ex)
    {
        Logger.Log($"WebSocket upgrade failed for cookie={cookie} in app={targetApp}: {ex.Message}");
        return;
    }
    using (ws)
    {
        using var client = new ClientWebSocket();
        try
        {
            // Connect internally to the private websockify instance.
            await client.ConnectAsync(new Uri($"ws://127.0.0.1:{userSession.WebsockifyPort}"), CancellationToken.None);
            Logger.Log($"Internal WebSocket connected for cookie={cookie} in app={targetApp}");
        }
        catch (Exception ex)
        {
            Logger.Log($"Internal WebSocket connection failed for cookie={cookie} in app={targetApp}: {ex.Message}");
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
            Logger.Log($"Error closing WebSockets for cookie={cookie} in app={targetApp}: {ex.Message}");
        }
        Logger.Log($"WebSocket closed for cookie={cookie} in app={targetApp}");
    }
});

app.Run();

// ----------------------------------------------------------------
// All type declarations must come after top-level statements.
// ----------------------------------------------------------------

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

static class Logger
{
    // Global debug flag; logging occurs only if Debug is true.
    public static bool Debug { get; set; }
    public static void Log(string msg)
    {
        if (Debug)
            Console.WriteLine($"[{DateTime.UtcNow:O}] {msg}");
    }
}

