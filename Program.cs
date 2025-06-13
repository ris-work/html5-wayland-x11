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
// Top-level statements (all types come after)
// ----------------------------------------------------------------

const int KILL_WAIT = 15;
const string defaultApp = "xclock"; // why: default safe app
string[] approvedCommands = new string[] { "xeyes", "xclock" }; // why: restrict allowed commands
List<ActiveSessions> sessions = new();
Logger.Debug = true; // why: enable logging

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var vncserver = "Xtigervnc";
File.WriteAllText("empty_x_startup", "#!/bin/sh\nexec tail -f /dev/null");
File.SetUnixFileMode("empty_x_startup", File.GetUnixFileMode("empty_x_startup") | UnixFileMode.UserExecute | UnixFileMode.GroupExecute | UnixFileMode.OtherExecute);


app.Use(async (context, next) =>
{
    Logger.Log($"HTTP {context.Request.Method} {context.Request.Path}{context.Request.QueryString}");
    await next();
});

// why: normalize duplicate slashes
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

// why: serve static files with correct MIME for .js files
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".js"] = "application/javascript";
app.UseStaticFiles(new StaticFileOptions {
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "static")),
    RequestPath = "/static",
    ContentTypeProvider = provider
});
app.UseWebSockets();

// why: on shutdown, force all sessions to quit
app.Lifetime.ApplicationStopping.Register(() => {
    Logger.Log("Application stopping; terminating sessions");
    foreach (var s in sessions) {
        try { if (!s.WebsockifyProcess.HasExited) s.WebsockifyProcess.Kill(); } catch { }
        try { if (!s.VncProcess.HasExited) s.VncProcess.Kill(); } catch { }
        try { if (!s.AppProcess.HasExited) s.AppProcess.Kill(); } catch { }
    }
});

bool Authenticate(string cookie) => true;
int GetFreePort() {
    using var listener = new TcpListener(IPAddress.Loopback, 0);
    listener.Start();
    int port = ((IPEndPoint)listener.LocalEndpoint).Port;
    listener.Stop();
    Logger.Log($"FreePort allocated: {port}");
    return port;
}
bool WaitForPortOpen(int port, int timeoutMs = 5000) {
    var sw = Stopwatch.StartNew();
    while (sw.ElapsedMilliseconds < timeoutMs) {
        try { using (var client = new TcpClient("127.0.0.1", port)) return true; }
        catch { Thread.Sleep(100); }
    }
    return false;
}
ActiveSessions StartSession(string cookie, string procName) {
    int vncPort = GetFreePort(), wsPort = GetFreePort(), display = new Random().Next(1, 100);
    var vnc = Process.Start(new ProcessStartInfo("setsid", $"{vncserver} :{display} -rfbport {vncPort} -localhost -SecurityTypes None") { UseShellExecute = false })!;
    if (!WaitForPortOpen(vncPort))
        Logger.Log($"Warning: vnc server on port {vncPort} did not open");
    var appProc = Process.Start(new ProcessStartInfo(procName) {
        UseShellExecute = false,
        Environment = { ["DISPLAY"] = $":{display}" }
    })!;
    var wsProc = Process.Start(new ProcessStartInfo("websockify", $"{wsPort} localhost:{vncPort}") { UseShellExecute = false })!;
    Logger.Log($"Session started: cookie={cookie}, d:{display}, vnc(pid={vnc.Id}@{vncPort}), {procName}(pid={appProc.Id}), ws(pid={wsProc.Id}@{wsPort})");
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
        var result = await src.ReceiveAsync(buffer, CancellationToken.None);
        if (result.MessageType == WebSocketMessageType.Close) break;
        UpdateSession(cookie);
        Logger.Log($"Pump {cookie}: forwarded {result.Count} bytes");
        await dst.SendAsync(new ArraySegment<byte>(buffer, 0, result.Count), result.MessageType, result.EndOfMessage, CancellationToken.None);
    }
    Logger.Log($"Pump ended for cookie={cookie}");
}
_ = Task.Run(async () => {
    while (true) {
        await Task.Delay(5000);
        sessions.RemoveAll(s => {
            if ((DateTime.UtcNow - s.LastActive).TotalSeconds > KILL_WAIT) {
                Logger.Log($"Session idle: cookie={s.Cookie} idle for {(DateTime.UtcNow - s.LastActive).TotalSeconds}s; killing processes");
		try { Console.Error.WriteLine($"Killing {s.VncProcess.Id}"); Process.Start(new ProcessStartInfo("kill", $"-KILL -- -{s.VncProcess.Id}"){UseShellExecute = false}); } catch (Exception E) {Console.Error.WriteLine(E);}
		try { Process.Start(new ProcessStartInfo("kill", $"{s.VncProcess.Id}"){UseShellExecute=false}); } catch (Exception E) {Console.Error.WriteLine(E);}
                try { if (!s.WebsockifyProcess.HasExited) s.WebsockifyProcess.Kill(); } catch { }
                try { if (!s.VncProcess.HasExited) s.VncProcess.Kill(); } catch { }
                try { if (!s.AppProcess.HasExited) s.AppProcess.Kill(); } catch { }
                return true;
            }
            return false;
        });
    }
});

// GET "/" route: redirect user only to vnc_lite.html (WS endpoint is passed as querystring without leading slash)
app.MapGet("/", async (HttpContext context) => {
    string targetApp = context.Request.Query["app"];
    if (string.IsNullOrEmpty(targetApp))
        targetApp = defaultApp;
    if (!approvedCommands.Contains(targetApp)) { // why: restrict allowed commands
        Logger.Log($"Disallowed app '{targetApp}' requested, defaulting to {defaultApp}");
        targetApp = defaultApp;
    }
    string sessionCookieName = $"session_{targetApp}";
    string cookie = context.Request.Cookies[sessionCookieName] ?? Guid.NewGuid().ToString();
    context.Response.Cookies.Append(sessionCookieName, cookie);
    ActiveSessions session;
    if (!sessions.Any(s => s.Cookie == cookie)) {
        session = StartSession(cookie, targetApp);
        sessions.Add(session);
        Logger.Log($"New session for cookie={cookie} app={targetApp}");
    } else {
        session = sessions.First(s => s.Cookie == cookie);
        Logger.Log($"Existing session for cookie={cookie} app={targetApp}");
    }
    await Task.Delay(2500);
    context.Response.Redirect($"/static/vnc_lite.html?session={cookie}&path={targetApp}/ws&autoconnect=true");
});

// WS forwarder endpoint: not directly seen by the user, only by vnc_lite.html.
app.Map("/{targetApp}/ws", async (HttpContext context) => {
    string targetApp = (string?)context.Request.RouteValues["targetApp"] ?? defaultApp;
    if (!approvedCommands.Contains(targetApp)) {
        Logger.Log($"Disallowed app in WS: '{targetApp}', defaulting to {defaultApp}");
        targetApp = defaultApp;
    }
    string sessionCookieName = $"session_{targetApp}";
    string cookie = context.Request.Cookies[sessionCookieName] ?? Guid.NewGuid().ToString();
    if (context.Request.Cookies[sessionCookieName] is null)
        context.Response.Cookies.Append(sessionCookieName, cookie);
    if (!context.WebSockets.IsWebSocketRequest) {
        context.Response.StatusCode = 400;
        Logger.Log($"{targetApp} ws rejected: not WS request");
        return;
    }
    if (!Authenticate(cookie)) {
        context.Response.StatusCode = 401;
        Logger.Log($"{targetApp} ws rejected: auth failed");
        return;
    }
    int idx = sessions.FindIndex(s => s.Cookie == cookie);
    if (idx == -1) {
        var session = StartSession(cookie, targetApp);
        sessions.Add(session);
        idx = sessions.Count - 1;
        Logger.Log($"Session restarted for cookie={cookie} app={targetApp}");
    }
    var userSession = sessions[idx];
    WebSocket ws = null;
    try {
        ws = await context.WebSockets.AcceptWebSocketAsync();
        Logger.Log($"WS upgrade accepted for cookie={cookie} in app={targetApp}");
    } catch (Exception ex) {
        Logger.Log($"WS upgrade failed for cookie={cookie} in app={targetApp}: {ex.Message}");
        return;
    }
    using (ws) {
        using var client = new ClientWebSocket();
        try {
            await client.ConnectAsync(new Uri($"ws://127.0.0.1:{userSession.WebsockifyPort}"), CancellationToken.None);
            Logger.Log($"Internal WS connected for cookie={cookie} in app={targetApp}");
        } catch (Exception ex) {
            Logger.Log($"Internal WS conn failed for cookie={cookie} in app={targetApp}: {ex.Message}");
            return;
        }
        var t1 = Pump(ws, client, cookie);
        var t2 = Pump(client, ws, cookie);
        await Task.WhenAny(t1, t2);
        try {
            await client.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
            await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
        } catch (Exception ex) {
            Logger.Log($"Error closing WS for cookie={cookie} in app={targetApp}: {ex.Message}");
        }
        Logger.Log($"WS closed for cookie={cookie} in app={targetApp}");
    }
});
app.Run();

// ----------------------------------------------------------------
// Type declarations must come after top-level statements.
// ----------------------------------------------------------------

struct ActiveSessions {
    public string Cookie;
    public DateTime LastActive;
    public Process VncProcess;
    public Process WebsockifyProcess;
    public Process AppProcess;
    public int VncPort;
    public int WebsockifyPort;
}

static class Logger {
    public static bool Debug { get; set; }
    public static void Log(string msg) {
        if (Debug)
            Console.WriteLine($"[{DateTime.UtcNow:O}] {msg}");
    }
}

