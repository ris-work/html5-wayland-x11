using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;

const int KILL_WAIT = 60; // seconds idle allowed
const string appName = "xeyes";
List<ActiveSessions> sessions = new();

// Helper functions

bool Authenticate(string cookie) => true;

int GetFreePort() {
    using var listener = new TcpListener(IPAddress.Loopback, 0);
    listener.Start();
    int port = ((IPEndPoint)listener.LocalEndpoint).Port;
    listener.Stop();
    Logger.Log($"FreePort allocated: {port}");
    return port;
}

ActiveSessions StartSession(string cookie) {
    int vncPort = GetFreePort(), wsPort = GetFreePort(), display = new Random().Next(1, 100);
    var vnc = Process.Start(new ProcessStartInfo("vncserver", $":{display} -rfbport {vncPort}") { UseShellExecute = false })!;
    var appProc = Process.Start(new ProcessStartInfo("xeyes") { UseShellExecute = false, Environment = { ["DISPLAY"] = $":{display}" } })!;
    var wsProc = Process.Start(new ProcessStartInfo("websockify", $"{wsPort} localhost:{vncPort}") { UseShellExecute = false })!;
    Logger.Log($"Session started: cookie={cookie}, display=:{display}, vnc(pid={vnc.Id}@{vncPort}), xeyes(pid={appProc.Id}), ws(pid={wsProc.Id}@{wsPort})");
    return new ActiveSessions {
        Cookie = cookie,
        LastActive = DateTime.UtcNow,
        VncProcess = vnc,
        WebsockifyProcess = wsProc,
        AppProcess = appProc,
        VncPort = vncPort,
        WebsockifyPort = wsPort
    };
}

void UpdateSession(string cookie) {
    int idx = sessions.FindIndex(s => s.Cookie == cookie);
    if (idx != -1) {
        var s = sessions[idx];
        s.LastActive = DateTime.UtcNow;
        sessions[idx] = s;
        Logger.Log($"Session updated: cookie={cookie}, LastActive={s.LastActive:O}");
    }
}

async Task Pump(WebSocket src, WebSocket dst, string cookie) {
    var buffer = new byte[4096];
    Logger.Log($"Pump started for cookie={cookie}");
    while (src.State == WebSocketState.Open) {
        var res = await src.ReceiveAsync(buffer, CancellationToken.None);
        if (res.MessageType == WebSocketMessageType.Close) break;
        UpdateSession(cookie);
        Logger.Log($"Pump {cookie}: forwarded {res.Count} bytes");
        await dst.SendAsync(new ArraySegment<byte>(buffer, 0, res.Count), res.MessageType, res.EndOfMessage, CancellationToken.None);
    }
    Logger.Log($"Pump ended for cookie={cookie}");
}

// Periodic cleanup: every 5 seconds, remove sessions idle longer than KILL_WAIT.
_ = Task.Run(async () => {
    while (true) {
        await Task.Delay(5000);
        sessions.RemoveAll(s => {
            if ((DateTime.UtcNow - s.LastActive).TotalSeconds > KILL_WAIT) {
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

// Minimal API configuration

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseWebSockets();
app.UseStaticFiles(new StaticFileOptions {
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "static")),
    RequestPath = "/static"
});

// Check for a session cookie named "session_xeyes", then redirect to static/vnc.html with query parameters.
app.MapGet("/", (HttpContext context) => {
    string sessionCookieName = $"session_{appName}";
    string cookie = context.Request.Cookies[sessionCookieName] ?? Guid.NewGuid().ToString();
    context.Response.Cookies.Append(sessionCookieName, cookie);
    ActiveSessions session;
    if (!sessions.Any(s => s.Cookie == cookie)) {
        session = StartSession(cookie);
        sessions.Add(session);
        Logger.Log($"New session created for cookie={cookie}");
    } else {
        session = sessions.First(s => s.Cookie == cookie);
        Logger.Log($"Existing session accessed for cookie={cookie}");
    }
    // Pass the session cookie and websocket port to the client.
    context.Response.Redirect($"/static/vnc.html?session={cookie}&wsport={session.WebsockifyPort}");
});

// WebSocket endpoint at /xeyes/ws that uses the "session_xeyes" cookie.
app.Map($"/{appName}/ws", async (HttpContext context) => {
    string sessionCookieName = $"session_{appName}";
    string cookie = context.Request.Cookies[sessionCookieName] ?? Guid.NewGuid().ToString();
    if (context.Request.Cookies[sessionCookieName] is null)
        context.Response.Cookies.Append(sessionCookieName, cookie);
    if (!context.WebSockets.IsWebSocketRequest) {
        context.Response.StatusCode = 400;
        Logger.Log($"{appName} ws rejected: Not a websocket request");
        return;
    }
    if (!Authenticate(cookie)) {
        context.Response.StatusCode = 401;
        Logger.Log($"{appName} ws rejected: Authentication failed");
        return;
    }
    int idx = sessions.FindIndex(s => s.Cookie == cookie);
    if (idx == -1) {
        var session = StartSession(cookie);
        sessions.Add(session);
        idx = sessions.Count - 1;
        Logger.Log($"Session restarted for cookie={cookie}");
    }
    var userSession = sessions[idx];
    using var ws = await context.WebSockets.AcceptWebSocketAsync();
    Logger.Log($"WebSocket accepted for cookie={cookie}");
    using var client = new ClientWebSocket();
    await client.ConnectAsync(new Uri($"ws://127.0.0.1:{userSession.WebsockifyPort}"), CancellationToken.None);
    Logger.Log($"WebSocket connected to local ws: cookie={cookie}, wsPort={userSession.WebsockifyPort}");
    var t1 = Pump(ws, client, cookie);
    var t2 = Pump(client, ws, cookie);
    await Task.WhenAny(t1, t2);
    await client.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
    await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
    Logger.Log($"WebSocket closed for cookie={cookie}");
});
app.Run();

// ----- Type declarations must come after all top-level statements -----

static class Logger {
    public static void Log(string msg) => Console.WriteLine($"[{DateTime.UtcNow:O}] {msg}");
}

struct ActiveSessions {
    public string Cookie;
    public DateTime LastActive;
    public Process VncProcess;
    public Process WebsockifyProcess;
    public Process AppProcess;
    public int VncPort;
    public int WebsockifyPort;
}

