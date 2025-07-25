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
using System.Text.Json;
using Microsoft.Extensions.FileProviders;
using System.Text; // Needed for Encoding.ASCII in the handshake
using Tomlyn;
using Tomlyn.Model;
using System.Security.Cryptography;
using System.Data;

// ----------------------------------------------------------------
// Top-level statements (all types come after)
// ----------------------------------------------------------------

const int KILL_WAIT = 45;
const string WEBRTC_PROCESS_NAME = "t-a-c";
const int ATTEMPT_TIMES = 30;
string defaultApp = "xclock"; // why: default safe app
string[] approvedCommands = new string[] { "xeyes", "xclock", "scalc", "vkcube", "glxgears", "xgc", "oclock", "ico", "xcalc", "abuse", "a7xpg", "gunroar", "rrootage", "noiz2sa" }; // why: restrict allowed commands
List<ActiveSessions> sessions = new();
Logger.Debug = true; // why: enable logging

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var vncserver = "Xtigervnc";
// Retrieve the DEFAULT_PROGRAM_NAME environment variable.
// If it is not provided or is empty, default to "xeyes".
string? RESOLUTION_WIDTH = Environment.GetEnvironmentVariable("RESOLUTION_WIDTH");
string? RESOLUTION_HEIGHT = Environment.GetEnvironmentVariable("RESOLUTION_HEIGHT");
string? DEFAULT_PROGRAM_NAME = Environment.GetEnvironmentVariable("DEFAULT_PROGRAM_NAME");
bool RECORD_SCREEN = false;
string? PAGE = Environment.GetEnvironmentVariable("PAGE");
int W = int.Parse(RESOLUTION_WIDTH ?? "1024");
int H = int.Parse(RESOLUTION_HEIGHT ?? "768");
if (PAGE == null) PAGE = "vnc_lite.html";
approvedCommands = approvedCommands.ToList().Append(DEFAULT_PROGRAM_NAME).ToArray();
if (string.IsNullOrEmpty(DEFAULT_PROGRAM_NAME))
{
    DEFAULT_PROGRAM_NAME = "xeyes";
}
defaultApp = DEFAULT_PROGRAM_NAME;
if (Environment.GetEnvironmentVariable("RECORD_SCREEN")?.ToLowerInvariant() == "true") RECORD_SCREEN = true;

// Retrieve the WEBSOCKIFY environment variable.
// If it is not provided or is empty, default to "websockify".
string WEBSOCKIFY = Environment.GetEnvironmentVariable("WEBSOCKIFY");
if (string.IsNullOrEmpty(WEBSOCKIFY))
{
    WEBSOCKIFY = "websockify";
}
if (WEBSOCKIFY == "wscs")
{
    System.Diagnostics.Process.Start("wscs", "--unix-listen=dummy.listen --unix-target=dummy.target --source-type=ws --no-daemonize");
}
bool NO_KIOSK = false;
string? CONNECT_EP = null;
if (Environment.GetEnvironmentVariable("NO_KIOSK")?.ToLowerInvariant() == "true") NO_KIOSK = true;
bool CONNECT_EP_TCP = false;
if (Environment.GetEnvironmentVariable("CONNECT_ENDPOINT_TCP")?.ToLowerInvariant() == "true") CONNECT_EP_TCP = true;
if (NO_KIOSK)
{
    CONNECT_EP = Environment.GetEnvironmentVariable("CONNECT_ENDPOINT");
    if (CONNECT_EP == null)
    {
        System.Console.WriteLine("NO_KIOSK but CONNECT_ENDPOINT not specified.");
    }
    if (CONNECT_EP_TCP == false)
    {
        System.Console.WriteLine("NO_KIOSK but CONNECT_ENDPOINT_TCP is FALSE, other modes not supported, expect silent failures.");
    }
}
Console.WriteLine($"websockify: {WEBSOCKIFY}");
// parse “host:port” or “[host]:port”
(string host, int port) ParseEP(string s)
{
    if (s[0] == '[')
    {
        var i = s.IndexOf(']');
        return (s[1..i], int.Parse(s[(i + 2)..]));
    }
    var i2 = s.LastIndexOf(':');
    return (s[..i2], int.Parse(s[(i2 + 1)..]));
}

// format back as “addr:port” (v4) or “[addr]:port” (v6)
string FormatEP(string host, int port)
    => host.Contains(':')
      ? $"[{host}]:{port}"
      : $"{host}:{port}";
(string host, int port) ConnectEP = ("", 0);
string? TCP_CONNECT_STRING = null;
if (CONNECT_EP != null && CONNECT_EP_TCP)
{
    ConnectEP = ParseEP(CONNECT_EP);
    Logger.Log($"Connect to Endpoint: {FormatEP(ConnectEP.host, ConnectEP.port)}");
    TCP_CONNECT_STRING = FormatEP(ConnectEP.host, ConnectEP.port);
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
Console.WriteLine($"BASE_PATH: {BASE_PATH}");
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
try
{
    var mode = UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute |
               UnixFileMode.GroupRead | UnixFileMode.GroupWrite | UnixFileMode.GroupExecute |
               UnixFileMode.OtherRead | UnixFileMode.OtherWrite | UnixFileMode.OtherExecute;
    File.SetUnixFileMode(sharedFolder, mode);
}
catch { }
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
    if (!Directory.Exists(staticDir))
    {
        baseDir = tempDir;
        staticDir = baseDir;
    }
    System.Console.WriteLine($"Base directory: {staticDir}");
}

// why: serve static files with correct MIME for .js files
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".js"] = "application/javascript";
app.UseStaticFiles(new StaticFileOptions
{
    //FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "static")),
    FileProvider = new PhysicalFileProvider(staticDir),
    RequestPath = "/static",
    ContentTypeProvider = provider
});
//app.UseWebSockets();

// why: on shutdown, force all sessions to quit
app.Lifetime.ApplicationStopping.Register(() =>
{
    Logger.Log("Application stopping; terminating sessions");
    foreach (var s in sessions)
    {
        try { if (s.WebsockifyProcess != null && !s.WebsockifyProcess.HasExited) s.WebsockifyProcess.Kill(); } catch { }
        try { if (!s.VncProcess.HasExited) s.VncProcess.Kill(); } catch { }
        try { if (!s.AppProcess.HasExited) s.AppProcess.Kill(); } catch { }
        try { if (s.Duplicator != null && !s.Duplicator.HasExited) s.Duplicator.Kill(); } catch { }
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
        try { using (var client = new TcpClient("127.0.0.1", port)) return true; }
        catch { Thread.Sleep(100); }
    }
    return false;
}
async Task<bool> WaitForUnixSocketOpenAsync(string socketPath, int timeoutMs = 5000)
{
    var sw = Stopwatch.StartNew();
    while (sw.ElapsedMilliseconds < timeoutMs)
    {
        try
        {
            using var socket = new Socket(AddressFamily.Unix, SocketType.Stream, ProtocolType.Unspecified);
            await socket.ConnectAsync(new UnixDomainSocketEndPoint(socketPath));
            return true;
        }
        catch
        {
            await Task.Delay(100);
        }
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
Action<ActiveSessions> cleanup = (ActiveSessions A) =>
{
};
var GenerateConfig = (int s) => { return s.ToString(); };
async Task SpawnWebRTCChildProcess(ActiveSessions s,
                                   string config,
                                   Action<ActiveSessions> cleanup)
{
    for (int i = 1; i <= ATTEMPT_TIMES; i++)
    {
        Logger.Log($"[WebRTC {i + 1}/{ATTEMPT_TIMES}] launch cookie={s.Cookie} config={config}");
        var p = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = WEBRTC_PROCESS_NAME,
                Arguments = config,
                RedirectStandardOutput = false,
                RedirectStandardError = false,
                UseShellExecute = true,
                CreateNoWindow = true
            },
            EnableRaisingEvents = true
        };
        s.AppProcess = p;
        var tcs = new TaskCompletionSource<bool>();
        p.Exited += (_, __) =>
        {
            s.LastActive = DateTime.UtcNow;
            Logger.Log($"WebRTC fwd exited code={p.ExitCode}");
            tcs.TrySetResult(true);
        };
        p.Start();
        await tcs.Task;
        s.AttemptCount = i + i;
    }
    cleanup(s);
}


//var cleanup = (_) => {};
async Task<ActiveSessions> StartWebRTCSession(string cookie,
                                  string procName,
                                  Action<ActiveSessions> cleanup)
{
    int vncPort = GetFreePort();
    int display = new Random().Next(1, 100);
    Process? vnc = null, appProc = null;
    string USock;
    if (!NO_KIOSK)
    {
        USock = $"{Path.Combine(Directory.GetCurrentDirectory(), "unix-")}{vncPort}";
        USock = $"unix-{vncPort}";
    }
    else
    {
        USock = $"{Path.Combine(Directory.GetCurrentDirectory(), CONNECT_EP)}";
    }
    var ShouldConnectToUSock = USock;
    if (RECORD_SCREEN) USock = $"{USock}.orig";
    if (!NO_KIOSK)
    {
        vnc = Process.Start(new ProcessStartInfo(
            $"{vncserver}",
            $":{display} -rfbunixpath {USock} -SecurityTypes None -geometry {W}x{H}"
        )
        { UseShellExecute = true })!;
    }
    Console.WriteLine($"RECORD_SCREEN: {RECORD_SCREEN}");
    if (!await WaitForUnixSocketOpenAsync($"{USock}"))
        Logger.Log($"Warning: vnc @ {USock} did not open");

    if (!NO_KIOSK)
    {
        appProc = Process.Start(new ProcessStartInfo(procName)
        {
            UseShellExecute = false,
            Environment = { ["DISPLAY"] = $":{display}" }
        })!;
    }

    byte[] peerPSK = new byte[40];
    byte[] randomUsernameBytes = new byte[20];
    byte[] randomPasswordBytes = new byte[20];
    byte[] randomSessionNameBytes = new byte[40];
    var RNG = RandomNumberGenerator.Create();
    RNG.GetBytes(peerPSK);
    RNG.GetBytes(randomUsernameBytes);
    RNG.GetBytes(randomPasswordBytes);
    RNG.GetBytes(randomSessionNameBytes);
    var configOurs = GenerateConfig(vncPort);

    string randomPeerPSK = Wiry.Base32.Base32Encoding.Standard.GetString(peerPSK);
    string randomUsername = Wiry.Base32.Base32Encoding.Standard.GetString(randomUsernameBytes);
    string randomPassword = Wiry.Base32.Base32Encoding.Standard.GetString(randomPasswordBytes);
    string randomSessionName = Wiry.Base32.Base32Encoding.Standard.GetString(randomSessionNameBytes);




    /* Generate WebRTC Forwarder TOML configuration */
    var OffererToml = Toml.FromModel((new ForwarderConfigOut()
    {
        Address = CONNECT_EP_TCP ? ConnectEP.host : $"{ShouldConnectToUSock}",
        PublishAuthUser = randomUsername,
        PublishAuthPass = randomPassword,
        PeerPSK = randomPeerPSK,
        PublishEndpoint = $"wss://vz.al/anonwsmul/{randomSessionName}/wso",
        Port = CONNECT_EP_TCP ? $"{ConnectEP.port}" : $"{ShouldConnectToUSock}",
        PublishAuthType = "Basic",
        Type = CONNECT_EP_TCP ? "TCP" : "UDS",
        WebRTCMode = "Offer",
    }).ToTomlTable());
    // build base table
    var atbl = new ForwarderConfigOut
    {
        Address = CONNECT_EP_TCP ? ConnectEP.host : $"{ShouldConnectToUSock}",
        PublishAuthUser = randomUsername,
        PublishAuthPass = randomPassword,
        PeerPSK = randomPeerPSK,
        PublishEndpoint = $"wss://vz.al/anonwsmul/{randomSessionName}/wsa",
        Port = CONNECT_EP_TCP ? $"{ConnectEP.port}" : $"{ShouldConnectToUSock}",
        PublishAuthType = "Basic",
        Type = CONNECT_EP_TCP ? "TCP" : "UDS",
        WebRTCMode = "Accept",
    }.ToTomlTable();

    // inject TURN if set
    if (Environment.GetEnvironmentVariable("ANSWERER_TURN_SERVER") is string turn && turn != "")
        atbl["ICEServers"] = new TomlArray {
        new TomlTable {
            ["URLs"]       = new TomlArray { turn },
            ["Username"]   = Environment.GetEnvironmentVariable("ANSWERER_TURN_USERNAME"),
            ["Credential"] = Environment.GetEnvironmentVariable("ANSWERER_TURN_CREDENTIAL")
        }
    };

    // serialize
    var AnswererToml = Toml.FromModel(atbl);
    var ourForwarderToml = AnswererToml;
    var theirForwarderToml = OffererToml;
    configOurs = AnswererToml;
    string configTheirs = OffererToml;
    Logger.Log($"Session started WebRTC: cookie={cookie}, display={display}, vnc(pid={vnc?.Id}), app(pid={appProc?.Id}), config={configOurs}, configTheirs={configTheirs}, ShouldConnectToSock={ShouldConnectToUSock}, USock={USock}");

    var s = new ActiveSessions
    {
        Cookie = cookie,
        LastActive = DateTime.UtcNow,
        VncProcess = vnc,
        WebsockifyProcess = null,
        AppProcess = appProc,
        VncPort = vncPort,
        WebsockifyPort = 0,
        IsWebRTCSession = true,
        WebRTCConfigOurs = configOurs,
        WebRTCConfigTheirs = configTheirs,
        AttemptCount = 0
    };
    File.WriteAllText($"webrtc-config-{vncPort}.toml", configOurs);
    Process? Duplicator = null;
    if (RECORD_SCREEN)
    {
        Duplicator = Process.Start(new ProcessStartInfo("duplicator", $"{ShouldConnectToUSock} {USock} screendump") { UseShellExecute = true });
        Console.WriteLine($"Duplicator: listen: {ShouldConnectToUSock} to: {USock}");
        if (!await WaitForUnixSocketOpenAsync($"{USock}"))
            Logger.Log($"Warning: vnc server on port {ShouldConnectToUSock} did not open");
        //Duplicator = Process.Start("duplicator", $"{ShouldConnectToUSock} {USock} screendump");
    }

    _ = SpawnWebRTCChildProcess(s, $"webrtc-config-{vncPort}.toml", cleanup);
    s.Duplicator = Duplicator;
    return s;
}


async Task<ActiveSessions> StartSession(string cookie, string procName)
{
    int vncPort = GetFreePort(), wsPort = GetFreePort(), display = new Random().Next(1, 100);
    string USock;
    if (!NO_KIOSK)
    {
        USock = $"{Path.Combine(Directory.GetCurrentDirectory(), "unix-")}{vncPort}";
    }
    else
    {
        USock = $"{Path.Combine(Directory.GetCurrentDirectory(), CONNECT_EP)}";
    }
    var ShouldConnectToUSock = USock;
    if (RECORD_SCREEN) USock = $"{USock}.orig";
    try { File.Delete(USock); } catch { }
    Process? vnc = null, appProc = null;
    if (!NO_KIOSK)
    {
        vnc = Process.Start(new ProcessStartInfo($"{vncserver}", $" :{display} -rfbunixpath {USock} -SecurityTypes None -geometry {W}x{H}") { UseShellExecute = false })!;
        if (!await WaitForUnixSocketOpenAsync($"{USock}"))
            Logger.Log($"Warning: vnc server on port {USock} did not open");
        appProc = Process.Start(new ProcessStartInfo(procName)
        {
            UseShellExecute = false,
            Environment = { ["DISPLAY"] = $":{display}" }
        })!;
    }
    Process? Duplicator = null;
    if (RECORD_SCREEN)
    {
        Duplicator = Process.Start(new ProcessStartInfo("duplicator", $"{ShouldConnectToUSock} {USock} screendump") { UseShellExecute = true });
        if (!await WaitForUnixSocketOpenAsync($"{ShouldConnectToUSock}"))
            Logger.Log($"Warning: vnc server on port {ShouldConnectToUSock} did not open");
    }
    Process wsProc;
    if (!CONNECT_EP_TCP)
    {
        if (WEBSOCKIFY == "websockify-rs")
        {
            wsProc = Process.Start(new ProcessStartInfo("websockify-rs", $"{ShouldConnectToUSock} ws-{wsPort} --listen-unix --upstream-unix") { UseShellExecute = false })!;
        }
        else if (WEBSOCKIFY == "wscs")
        {
            wsProc = Process.Start(new ProcessStartInfo("wscs", $"--unix-listen=ws-{wsPort} --unix-target={ShouldConnectToUSock} --source-type=ws") { UseShellExecute = false })!;
            Logger.Log($"WSCS instance: {wsProc.StartInfo.FileName} {wsProc.StartInfo.Arguments}");
        }
        else
        {
            wsProc = Process.Start(new ProcessStartInfo("websockify", $"--unix-listen=ws-{wsPort} --unix-target={ShouldConnectToUSock}") { UseShellExecute = false })!;
        }
    }
    else
    {
        if (WEBSOCKIFY == "websockify-rs")
        {
            wsProc = Process.Start(new ProcessStartInfo("websockify-rs", $"{TCP_CONNECT_STRING} ws-{wsPort} --listen-unix") { UseShellExecute = false })!;
        }
        else if (WEBSOCKIFY == "wscs")
        {
            wsProc = Process.Start(new ProcessStartInfo("wscs", $"--unix-listen=ws-{wsPort} --unix-target=tcp://{TCP_CONNECT_STRING} --source-type=ws") { UseShellExecute = false })!;
            Logger.Log($"WSCS instance: {wsProc.StartInfo.FileName} {wsProc.StartInfo.Arguments}");
        }
        else
        {
            wsProc = Process.Start(new ProcessStartInfo("websockify", $"--unix-listen=ws-{wsPort} {TCP_CONNECT_STRING}") { UseShellExecute = false })!;
        }
    }
    Logger.Log($"Session started: cookie={cookie}, d:{display}, vnc(pid={vnc?.Id}@unix-{vncPort}), {procName}(pid={appProc?.Id}), ws(pid={wsProc?.Id}@{wsPort})");
    return new ActiveSessions
    {
        Cookie = cookie,
        LastActive = DateTime.UtcNow,
        VncProcess = vnc,
        WebsockifyProcess = wsProc,
        AppProcess = appProc,
        VncPort = vncPort,
        WebsockifyPort = wsPort,

        Duplicator = Duplicator,
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
        if (result.MessageType == WebSocketMessageType.Close) break;
        UpdateSession(cookie);
        Logger.Log($"Pump {cookie}: forwarded {result.Count} bytes");
        await dst.SendAsync(new ArraySegment<byte>(buffer, 0, result.Count), result.MessageType, result.EndOfMessage, CancellationToken.None);
    }
    Logger.Log($"Pump ended for cookie={cookie}");
}
_ = Task.Run(async () =>
{
    while (true)
    {
        await Task.Delay(5000);
        sessions.RemoveAll(s =>
        {
            if (s.IsWebRTCSession)
            {
                Logger.Log($"WebRTC iterating: cookie={s.Cookie} attempts={s.AttemptCount} Attempt times max: {ATTEMPT_TIMES}; let's see if we should kill them...");
                if (s.AttemptCount > ATTEMPT_TIMES)
                {
                    Logger.Log($"Cleaning up idle WebRTC session: cookie {s.Cookie} Attempt count {s.AttemptCount}");
                    Logger.Log($"WebRTC done: cookie={s.Cookie} attempts={s.AttemptCount}; killing");
                    try { if (!s.AppProcess.HasExited) s.AppProcess.Kill(); } catch { }
                    try { if (s.WebsockifyProcess != null && !s.WebsockifyProcess.HasExited) s.WebsockifyProcess.Kill(); } catch { }
                    try { if (!s.VncProcess.HasExited) s.VncProcess.Kill(true); Logger.Log("Killed the main VNCd"); } catch { }
                    try { if (s.Duplicator != null && !s.Duplicator.HasExited) s.Duplicator.Kill(); } catch { }
                    return true;
                }
            }
            else
            {
                var idleSec = (DateTime.UtcNow - s.LastActive).TotalSeconds;
                if (idleSec > KILL_WAIT)
                {
                    Logger.Log($"WS idle: cookie={s.Cookie} idle for {idleSec}s; killing");
                    try { if (!s.AppProcess.HasExited) s.AppProcess.Kill(); } catch { }
                    try { if (!s.WebsockifyProcess.HasExited) s.WebsockifyProcess.Kill(); } catch { }
                    try { if (!s.VncProcess.HasExited) s.VncProcess.Kill(true); } catch { }
                    return true;
                }
            }
            return false;
        });
    }
});


app.MapGet("/WebRTCInfo", (string session) =>
{
    var idx = sessions.FindIndex(x => x.Cookie == session && x.IsWebRTCSession);
    if (idx < 0)
    {
        Logger.Log($"WebRTCInfo: NOT FOUND: {session}");
        return Results.NotFound();
    }
    Logger.Log($"WebRTCInfo: FOUND: {session}");
    var s = sessions[idx];
    return Results.Text(s.WebRTCConfigTheirs, "text/plain");
});


// GET "/" route: redirect user only to vnc_lite.html (WS endpoint is passed as querystring without leading slash)
app.MapGet("/", async (HttpContext context) =>
{
    string targetApp = context.Request.Query["app"];
    string QIsWebRTCSession = context.Request.Query["WebRTC"];
    Logger.Log($"QIsWebRTCSession: {QIsWebRTCSession}");
    if (string.IsNullOrEmpty(QIsWebRTCSession))
        QIsWebRTCSession = "false";
    bool IsWebRTCSession = QIsWebRTCSession.ToLowerInvariant() == "true";
    if (string.IsNullOrEmpty(targetApp))
        targetApp = defaultApp;
    if (!approvedCommands.Contains(targetApp))
    { // why: restrict allowed commands
        Logger.Log($"Disallowed app '{targetApp}' requested, defaulting to {defaultApp}");
        targetApp = defaultApp;
    }
    string sessionCookieName = $"session_{targetApp}";
    string cookie = context.Request.Cookies[sessionCookieName] ?? Guid.NewGuid().ToString();
    context.Response.Cookies.Append(sessionCookieName, cookie);
    ActiveSessions session;
    if (!sessions.Any(s => s.Cookie == cookie))
    {
        if (!IsWebRTCSession)
        {
            session = await StartSession(cookie, targetApp);
            sessions.Add(session);
            Logger.Log($"New session for cookie={cookie} app={targetApp}");
        }
        else
        {
            session = await StartWebRTCSession(cookie, targetApp, cleanup);
            Logger.Log("WebRTC Session Requested");
            sessions.Add(session);
        }
    }
    else
    {
        session = sessions.First(s => s.Cookie == cookie);
        Logger.Log($"Existing session for cookie={cookie} app={targetApp}");
    }
    await Task.Delay(1500);
    if (!session.IsWebRTCSession)
    {
        context.Response.Redirect($"{BASE_PATH}static/{PAGE}?session={cookie}&path={(BASE_PATH == "/" ? "/" : BASE_PATH)}{targetApp}/ws&autoconnect=true");
    }
    else
    {
        context.Response.Redirect($"{BASE_PATH}static/vncrtc.html?baseurl={BASE_PATH}&session={cookie}&path={(BASE_PATH == "/" ? "/" : BASE_PATH)}{targetApp}/ws&autoconnect=true");
    }
});

// WS forwarder endpoint: not directly seen by the user, only by vnc_lite.html.
RequestDelegate WsHandler = async (HttpContext context) =>
{
    string targetApp = (string?)context.Request.RouteValues["targetApp"] ?? defaultApp;
    if (!approvedCommands.Contains(targetApp))
    {
        Logger.Log($"Disallowed app in WS: '{targetApp}', defaulting to {defaultApp}");
        targetApp = defaultApp;
    }
    string sessionCookieName = $"session_{targetApp}";
    string cookie = context.Request.Cookies[sessionCookieName] ?? Guid.NewGuid().ToString();
    if (context.Request.Cookies[sessionCookieName] is null)
        context.Response.Cookies.Append(sessionCookieName, cookie);
    if (!context.WebSockets.IsWebSocketRequest)
    {
        context.Response.StatusCode = 400;
        Logger.Log($"{targetApp} ws rejected: not WS request");
        return;
    }
    if (!Authenticate(cookie))
    {
        context.Response.StatusCode = 401;
        Logger.Log($"{targetApp} ws rejected: auth failed");
        return;
    }
    int idx = sessions.FindIndex(s => s.Cookie == cookie);
    if (idx == -1)
    {
        var session = await StartSession(cookie, targetApp);
        sessions.Add(session);
        idx = sessions.Count - 1;
        Logger.Log($"Session restarted for cookie={cookie} app={targetApp}");
    }
    var userSession = sessions[idx];
    WebSocket ws = null;
    try
    {
        ws = await context.WebSockets.AcceptWebSocketAsync();
        Logger.Log($"WS upgrade accepted for cookie={cookie} in app={targetApp}");
    }
    catch (Exception ex)
    {
        Logger.Log($"WS upgrade failed for cookie={cookie} in app={targetApp}: {ex.Message}");
        return;
    }
    using (ws)
    {
        //using var client = new ClientWebSocket();
        using var client = await UnixWS.ConnectAsync($"ws-{userSession.WebsockifyPort}", "localhost", "/");
        try
        {
            //await client.ConnectAsync(new Uri($"ws://127.0.0.1:{userSession.WebsockifyPort}"), CancellationToken.None);
            Logger.Log($"Internal WS connected for cookie={cookie} in app={targetApp}");
        }
        catch (Exception ex)
        {
            Logger.Log($"Internal WS conn failed for cookie={cookie} in app={targetApp}: {ex.Message}");
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
            Logger.Log($"Error closing WS for cookie={cookie} in app={targetApp}: {ex.Message}");
        }
        Logger.Log($"WS closed for cookie={cookie} in app={targetApp}");
    }
};
app.Map("/{targetApp}/ws", WsHandler);
// Now, register the fallback so that requests not handled by earlier endpoints are processed here.
app.MapFallback(async context =>
{
    // Although static file requests should have been handled already, you can add an extra check.
    if (context.Request.Path.StartsWithSegments("/static", StringComparison.OrdinalIgnoreCase))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        await context.Response.WriteAsync("Static file not found");
        return;
    }

    // Retrieve the original raw target.
    var requestFeature = context.Features.Get<Microsoft.AspNetCore.Http.Features.IHttpRequestFeature>();
    string rawTarget = requestFeature?.RawTarget ?? context.Request.Path.Value ?? string.Empty;

    // Split the raw target to inspect the segments.
    var segments = rawTarget.Split('/', StringSplitOptions.RemoveEmptyEntries);

    // Check if the URL is for a WebSocket, e.g. "/targetApp/ws".
    if (segments.Length >= 2 && segments[1].Equals("ws", StringComparison.OrdinalIgnoreCase))
    {
        // Normalize path accordingly.
        string normalizedPath = $"/{segments[0]}/ws";
        context.Request.Path = normalizedPath;
        context.Request.RouteValues["targetApp"] = segments[0];

        // Delegate to your WebSocket handler.
        await WsHandler(context);
        return;
    }

    // Fallback response if nothing matches.
    Console.WriteLine($"Fallback: Not Found {rawTarget}");
    context.Response.StatusCode = StatusCodes.Status404NotFound;
    await context.Response.WriteAsync("Not Found");
});
app.UseRouting();
app.Run();

// ----------------------------------------------------------------
// Type declarations must come after top-level statements.
// ----------------------------------------------------------------

class ActiveSessions
{
    public string Cookie;
    public DateTime LastActive;
    public Process VncProcess;
    public Process? WebsockifyProcess;
    public Process AppProcess;
    public int VncPort;
    public int WebsockifyPort;
    public bool IsWebRTCSession;        // true=WebRTC, false=WebSocket
    public DateTime WebRTCFirstSpawnTime;
    public int AttemptCount;
    public string WebRTCConfigOurs;
    public string WebRTCConfigTheirs;
    public Process? Duplicator;

}

static class Logger
{
    public static bool Debug { get; set; }
    public static void Log(string msg)
    {
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

public class ForwarderConfigOut
{
    public string Type = "";
    public string WebRTCMode = "";
    public string Address = "127.0.0.1";
    public string Port = "";
    public TomlArray ICEServers = new TomlArray() {
            new TomlTable()
            {
                ["URLs"] = new TomlArray()
                {
                    "stun:vz.al"
                }
            },
            new TomlTable()
            {
                ["URLs"] = new TomlArray()
                {
                    "stun:stun.l.google.com:19302"
                }
            }
        };
    public string PublishType = "ws";
    public string PublishEndpoint = "";
    public string PublishAuthType = "";
    public string PublishAuthUser = "";
    public string PublishAuthPass = "";
    public string PeerAuthType = "PSK";
    public string PeerPSK = "";
    public bool Publish = true;
    public long TimeoutCountMax = 15;

    public TomlTable ToTomlTable()
    {
        return new TomlTable()
        {
            ["Type"] = Type,
            ["WebRTCMode"] = WebRTCMode,
            ["Address"] = Address,
            ["Port"] = Port,
            ["Publish"] = Publish,
            ["PublishType"] = PublishType,
            ["PublishEndpoint"] = PublishEndpoint,
            ["PublishAuthType"] = PublishAuthType,
            ["PublishAuthUser"] = PublishAuthUser,
            ["PublishAuthPass"] = PublishAuthPass,
            ["PeerAuthType"] = PeerAuthType,
            ["PeerPSK"] = PeerPSK,
            ["ICEServers"] = ICEServers,
            ["TimeoutCountMax"] = TimeoutCountMax

        };
    }
}
