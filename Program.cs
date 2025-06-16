using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using System.Text; // Needed for Encoding.ASCII in the handshake

// ----------------------------------------------------------------
// Top-level statements (all types come after)
// ----------------------------------------------------------------

const int KILL_WAIT = 45;
string defaultApp = "xclock"; // why: default safe app
string[] approvedCommands = new string[] { "xeyes", "xclock", "scalc", "vkcube", "glxgears", "xgc", "oclock", "ico", "xcalc", "abuse", "a7xpg", "gunroar", "rrootage", "noiz2sa" }; // why: restrict allowed commands
List<ActiveSessions> sessions = new();
Logger.Debug = false; // why: enable logging

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var vncserver = "Xtigervnc";
// Retrieve the DEFAULT_PROGRAM_NAME environment variable.
// If it is not provided or is empty, default to "xeyes".
string RESOLUTION_WIDTH = Environment.GetEnvironmentVariable("RESOLUTION_WIDTH");
string RESOLUTION_HEIGHT = Environment.GetEnvironmentVariable("RESOLUTION_HEIGHT");
string DEFAULT_PROGRAM_NAME = Environment.GetEnvironmentVariable("DEFAULT_PROGRAM_NAME");
int W = int.Parse(RESOLUTION_WIDTH ?? "1024");
int H = int.Parse(RESOLUTION_HEIGHT ?? "768");
approvedCommands = approvedCommands.ToList().Append(DEFAULT_PROGRAM_NAME).ToArray();
if (string.IsNullOrEmpty(DEFAULT_PROGRAM_NAME))
    {
        DEFAULT_PROGRAM_NAME = "xeyes";
    }
defaultApp = DEFAULT_PROGRAM_NAME;

// Retrieve the WEBSOCKIFY environment variable.
// If it is not provided or is empty, default to "websockify".
string WEBSOCKIFY = Environment.GetEnvironmentVariable("WEBSOCKIFY");
if (string.IsNullOrEmpty(WEBSOCKIFY))
    {
        WEBSOCKIFY = "websockify";
    }
string BASE_PATH = Environment.GetEnvironmentVariable("BASE_PATH");
if (string.IsNullOrEmpty(BASE_PATH))
    {
        BASE_PATH = "/";
    }
if (BASE_PATH != "/")
{
    if (!BASE_PATH.StartsWith("/") || !BASE_PATH.EndsWith("/"))
    {
        Console.Error.WriteLine("Error: BASE_PATH must start and end with a slash (e.g., '/demo/' or '/').");
        Environment.Exit(1);
    }

    // Check for double consecutive slashes.
    if (BASE_PATH.Contains("//"))
    {
        Console.Error.WriteLine("Error: BASE_PATH must not contain double consecutive slashes.");
        Environment.Exit(1);
    }
}
app.UsePathBase(BASE_PATH);
File.WriteAllText("empty_x_startup", "#!/bin/sh\nexec tail -f /dev/null");
File.SetUnixFileMode("empty_x_startup", File.GetUnixFileMode("empty_x_startup") | UnixFileMode.UserExecute | UnixFileMode.GroupExecute | UnixFileMode.OtherExecute);

static void ExtractAllStaticResources(string destFolder)
{
    Directory.CreateDirectory(destFolder);
    Assembly asm = Assembly.GetExecutingAssembly();
    const string prefix = "static/"; // Must match the LogicalName prefix

    foreach (string resource in asm.GetManifestResourceNames())
    {
        if (!resource.StartsWith(prefix)) continue;

        // Compute relative path by stripping the prefix.
        string relativePath = resource.Substring(prefix.Length);
        string outPath = Path.Combine(destFolder, relativePath);

        // Skip if the file already exists.
        if (File.Exists(outPath)) continue;

        Directory.CreateDirectory(Path.GetDirectoryName(outPath)!);
        using Stream resStream = asm.GetManifestResourceStream(resource)
            ?? throw new Exception($"Resource '{resource}' not found.");
        using FileStream fileStream = File.Create(outPath);
        resStream.CopyTo(fileStream);
    }
}

// Create or get the shared folder.
var sharedFolder = Path.Combine(Path.GetTempPath(), "MyAppStatic");
if (!Directory.Exists(sharedFolder))
{
    Directory.CreateDirectory(sharedFolder);
}

// Explicitly set permissions to 0777 (rwx for user, group, and others).
try{
var mode = UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute |
           UnixFileMode.GroupRead | UnixFileMode.GroupWrite | UnixFileMode.GroupExecute |
           UnixFileMode.OtherRead | UnixFileMode.OtherWrite | UnixFileMode.OtherExecute;
File.SetUnixFileMode(sharedFolder, mode);
}catch {}
// Create a secure canonical temporary folder.
//var tempDir = Path.Combine(Path.GetTempPath(), "MyAppStatic", Guid.NewGuid().ToString("N"));
var tempDir = Path.Combine(sharedFolder, Environment.UserName, Guid.NewGuid().ToString("N"));

// Extract all static resources.
ExtractAllStaticResources(tempDir);
Console.WriteLine($"Static resources extracted to: {tempDir}");

app.Use(async (context, next) =>
{
    Logger.Log($"HTTP {context.Request.Method} {context.Request.Path}{context.Request.QueryString}");
    await next();
});

// Determine the base directory
var baseDir = Directory.GetCurrentDirectory();
var staticDir = Path.Combine(baseDir, "static");

if (!Directory.Exists(staticDir))
{
    // Fallback to the extraction directory (typically AppContext.BaseDirectory)
    baseDir = AppContext.BaseDirectory;
    staticDir = Path.Combine(baseDir, "static");
    if(!Directory.Exists(staticDir)){
        baseDir = tempDir;
        staticDir = baseDir;
    }
    System.Console.WriteLine($"Base directory: {staticDir}");
}

// why: serve static files with correct MIME for .js files
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".js"] = "application/javascript";
app.UseStaticFiles(new StaticFileOptions {
    //FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "static")),
    FileProvider = new PhysicalFileProvider(staticDir),
    RequestPath = "/static",
    ContentTypeProvider = provider
});
//app.UseWebSockets();

// why: on shutdown, force all sessions to quit
app.Lifetime.ApplicationStopping.Register(() => {
    Logger.Log("Application stopping; terminating sessions");
    foreach (var s in sessions) {
        try { if (!s.WebsockifyProcess.HasExited) s.WebsockifyProcess.Kill(); } catch { }
        try { if (!s.VncProcess.HasExited) s.VncProcess.Kill(); } catch { }
        try { if (!s.AppProcess.HasExited) s.AppProcess.Kill(); } catch { }
    }
});
// Custom middleware to normalize multiple slashes to a single slash and log changes.
app.Use(async (context, next) =>
{
    //System.Console.WriteLine($"Request path: {context.Request.Path.Value} {context.Request.Path.Value.GetType()}");
    if (context.Request.Path.Value is string path && path.Contains("//"))
    {
        System.Console.WriteLine($"Normalized request path from {path}");
        var newPath = Regex.Replace(path, @"[/]+", "/");
        if (newPath != path)
        {
            // Log the normalization event
            app.Logger.LogInformation($"Normalized request path from {path} to {newPath}");
            //System.Console.WriteLine($"Normalized request path from {path} to {newPath}");
            context.Request.Path = newPath;
        }
    }
    await next();
});
app.UseWebSockets();

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
bool WaitForUnixSocketOpen(string socketPath, int timeoutMs = 5000)
{
    var sw = Stopwatch.StartNew();
    while (sw.ElapsedMilliseconds < timeoutMs)
    {
        try
        {
            using (var socket = new Socket(AddressFamily.Unix, SocketType.Stream, ProtocolType.Unspecified))
            {
                // Attempt to connect to the Unix socket.
                var endpoint = new UnixDomainSocketEndPoint(socketPath);
                socket.Connect(endpoint);
                return true;
            }
        }
        catch
        {
            // Socket not yet available; wait briefly.
            Thread.Sleep(100);
        }
    }
    return false;
}

ActiveSessions StartSession(string cookie, string procName) {
    int vncPort = GetFreePort(), wsPort = GetFreePort(), display = new Random().Next(1, 100);
    var vnc = Process.Start(new ProcessStartInfo("setsid", $"{vncserver} :{display} -rfbunixpath unix-{vncPort} -SecurityTypes None -geometry {W}x{H}") { UseShellExecute = false })!;
    if (!WaitForUnixSocketOpen($"unix-{vncPort}"))
        Logger.Log($"Warning: vnc server on port unix-{vncPort} did not open");
    var appProc = Process.Start(new ProcessStartInfo(procName) {
        UseShellExecute = false,
        Environment = { ["DISPLAY"] = $":{display}" }
    })!;
    Process wsProc;
    if(WEBSOCKIFY=="websockify-rs") {
    wsProc = Process.Start(new ProcessStartInfo("websockify-rs", $"unix-{vncPort} ws-{wsPort} --listen-unix --upstream-unix") { UseShellExecute = false })!;
    }
    else{
    wsProc = Process.Start(new ProcessStartInfo("websockify", $"--unix-listen=ws-{wsPort} --unix-target=unix-{vncPort}") { UseShellExecute = false })!;
    }
    Logger.Log($"Session started: cookie={cookie}, d:{display}, vnc(pid={vnc.Id}@unix-{vncPort}), {procName}(pid={appProc.Id}), ws(pid={wsProc.Id}@{wsPort})");
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
    await Task.Delay(1500);
    context.Response.Redirect($"{BASE_PATH}static/vnc_lite.html?session={cookie}&path={(BASE_PATH == "/" ? "" : BASE_PATH)}{targetApp}/ws&autoconnect=true");
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
        //using var client = new ClientWebSocket();
	using var client = await UnixWS.ConnectAsync($"ws-{userSession.WebsockifyPort}", "localhost", "/");
        try {
            //await client.ConnectAsync(new Uri($"ws://127.0.0.1:{userSession.WebsockifyPort}"), CancellationToken.None);
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

public static class UnixWS
{
    // Establish a WebSocket connection over a Unix Domain Socket.
    public static async Task<WebSocket> ConnectAsync(
        string socketPath,
        string host,
        string resource,
        string subProtocol = null,
        CancellationToken cancellationToken = default)
    {
        Logger.Log($"Attempting to connect to Unix Domain Socket at '{socketPath}'");
        var endpoint = new UnixDomainSocketEndPoint(socketPath);
        var socket = new Socket(AddressFamily.Unix, SocketType.Stream, ProtocolType.Unspecified);
        await socket.ConnectAsync(endpoint, cancellationToken);
        Logger.Log($"Connected to Unix Domain Socket at '{socketPath}'");

        var stream = new NetworkStream(socket, ownsSocket: true);

        // Generate a key for the WebSocket handshake.
        string key = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        Logger.Log($"Generated WebSocket handshake key: {key}");

        // Build the handshake request.
        var requestLines = new[]
        {
            $"GET {resource} HTTP/1.1",
            $"Host: {host}",
            "Upgrade: websocket",
            "Connection: Upgrade",
            $"Sec-WebSocket-Key: {key}",
            "Sec-WebSocket-Version: 13",
            subProtocol != null ? $"Sec-WebSocket-Protocol: {subProtocol}" : null,
            "", // End of headers.
            ""
        };
        string request = string.Join("\r\n", requestLines.Where(line => line != null));
        byte[] requestBytes = Encoding.ASCII.GetBytes(request);
        Logger.Log($"Sending handshake request:\n{request}");

        await stream.WriteAsync(requestBytes, 0, requestBytes.Length, cancellationToken);

        // Read and validate the handshake response.
        byte[] buffer = new byte[1024];
        int bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length, cancellationToken);
        string response = Encoding.ASCII.GetString(buffer, 0, bytesRead);
        Logger.Log($"Received handshake response ({bytesRead} bytes):\n{response}");

        if (!response.Contains("101 Switching Protocols"))
        {
            Logger.Log($"Handshake failed: [Response: {response}]");
            throw new Exception("WebSocket handshake failed: " + response);
        }
        Logger.Log("Handshake succeeded, upgrading connection to WebSocket.");

        // Wrap the stream as a client WebSocket.
        var webSocket = WebSocket.CreateFromStream(stream, isServer: false, subProtocol: subProtocol,
                                                     keepAliveInterval: TimeSpan.FromMinutes(2));
        Logger.Log("WebSocket instance created from stream.");
        return webSocket;
    }
}
