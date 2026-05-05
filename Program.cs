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
using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using System.Text; // Needed for Encoding.ASCII in the handshake
using Tomlyn;
using Tomlyn.Model;
using System.Security.Cryptography;
using System.Data;
using Microsoft.Extensions.Primitives;
using Microsoft.AspNetCore.ResponseCompression;
using OtpNet;
using System.Web;

// ----------------------------------------------------------------
// Top-level statements (all types come after)
// ----------------------------------------------------------------

System.Threading.Lock SessionsDataLock = new();

const int KILL_WAIT = 150;
const string WEBRTC_PROCESS_NAME = "t-a-c";
const int ATTEMPT_TIMES = 30;
string defaultApp = "xpaint"; // why: default safe app
string[] approvedCommands = new string[] { "xeyes", "xclock", "scalc", "vkcube", "glxgears", "xgc", "oclock", "ico", "xcalc" }; // why: restrict allowed commands
List<ActiveSessions> sessions = new();
Logger.Debug = true; // why: enable logging
string[] PreservedParameters = new[] { "password", "scale" };

var builder = WebApplication.CreateBuilder(args);
// 1. Add response compression services
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;

    // Configure which MIME types to compress (includes common static file types)
    options.MimeTypes = new[] {
        "text/plain",
        "text/html",
        "application/javascript",
        "text/css",
        "application/json",
        "image/svg+xml",
        "text/xml",
        "application/xml"
    };

    // Add compression providers
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});


var vncserver = ""; //We don't have any, we use the compositor
                    // Retrieve the DEFAULT_PROGRAM_NAME environment variable.
                    // If it is not provided or is empty, default to "xeyes".
string? RESOLUTION_WIDTH = Environment.GetEnvironmentVariable("RESOLUTION_WIDTH");
string? RESOLUTION_HEIGHT = Environment.GetEnvironmentVariable("RESOLUTION_HEIGHT");
string? DEFAULT_PROGRAM_NAME = Environment.GetEnvironmentVariable("DEFAULT_PROGRAM_NAME");
bool RECORD_SCREEN = false;
string? PAGE = Environment.GetEnvironmentVariable("PAGE");
int W = int.Parse(RESOLUTION_WIDTH ?? "1024");
int H = int.Parse(RESOLUTION_HEIGHT ?? "768");
if (PAGE == null) PAGE = "vnc_lite.min.html";
approvedCommands = approvedCommands.ToList().Append(DEFAULT_PROGRAM_NAME).ToArray();
if (string.IsNullOrEmpty(DEFAULT_PROGRAM_NAME))
{
    DEFAULT_PROGRAM_NAME = "xeyes";
}
defaultApp = DEFAULT_PROGRAM_NAME;
if (Environment.GetEnvironmentVariable("RECORD_SCREEN")?.ToLowerInvariant() == "true") RECORD_SCREEN = true;

bool USE_AUTHENTICATION = false;
if (Environment.GetEnvironmentVariable("USE_AUTHENTICATION")?.ToLowerInvariant() == "true") USE_AUTHENTICATION = true;

string? AUTH_USERNAME = Environment.GetEnvironmentVariable("AUTH_USERNAME");
string? AUTH_PASSWORD = Environment.GetEnvironmentVariable("AUTH_PASSWORD");
if (USE_AUTHENTICATION)
{
    if (AUTH_USERNAME == null)
    {
        Console.WriteLine("AUTHORIZATION requested but AUTH_USERNAME not specified");
        AUTH_USERNAME = "";
    }
    if (AUTH_PASSWORD == null)
    {
        Console.WriteLine("AUTHORIZATION requested but AUTH_USERNAME not specified");
        AUTH_PASSWORD = "";
    }
}

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
bool ALWAYS_NEW_SESSION = false;
if (Environment.GetEnvironmentVariable("ALWAYS_NEW_SESSION")?.ToLowerInvariant() == "true") ALWAYS_NEW_SESSION = true;
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
Console.WriteLine($"connect_ep_tcp: {CONNECT_EP_TCP}");
Console.WriteLine($"always_new_session: {ALWAYS_NEW_SESSION}");


string MTLS_RAW = Environment.GetEnvironmentVariable("MTLS");
bool MTLS = false;
if (MTLS_RAW?.ToLowerInvariant() == "true") MTLS = true;

string MTLS_CERT_OURS = Environment.GetEnvironmentVariable("MTLS_CERT_OURS");
string MTLS_KEY_OURS = Environment.GetEnvironmentVariable("MTLS_KEY_OURS");
string MTLS_CERT_THEIRS = Environment.GetEnvironmentVariable("MTLS_CERT_THEIRS");

string MTLS_ALLOW_INT_RAW = Environment.GetEnvironmentVariable("MTLS_ALLOW_INTERMEDIATE_FINGERPRINTS");
bool MTLS_ALLOW_INTERMEDIATE = false;
if (MTLS_ALLOW_INT_RAW?.ToLowerInvariant() == "true") MTLS_ALLOW_INTERMEDIATE = true;
string MTLS_CERT_THEIRS_URL = Environment.GetEnvironmentVariable("MTLS_CERT_THEIRS_URL");

// Static set from Env Var (never changes)
HashSet<string> StaticFingerprints = new HashSet<string>();
// Runtime set (Static + Dynamic merged)
HashSet<string> AllowedFingerprints = new HashSet<string>();
object _fpLock = new object();

static string NormalizeFingerprint(string raw, string source = "unknown")
{
    if (string.IsNullOrWhiteSpace(raw)) return null;

    // 1. Uppercase and remove separators (:, -, space)
    string clean = raw.ToUpperInvariant().Replace(":", "").Replace("-", "").Replace(" ", "").Trim();

    // 2. Validate Length (SHA256 = 64 hex chars)
    if (clean.Length != 64)
    {
        Console.WriteLine($"[Auth] WARNING: Invalid length ({clean.Length} chars, expected 64) in {source}: {raw.Trim()}");
        return null;
    }

    // 3. Validate Hex
    foreach (char c in clean)
    {
        if (!Uri.IsHexDigit(c))
        {
            Console.WriteLine($"[Auth] WARNING: Invalid hex character in {source}: {raw.Trim()}");
            return null;
        }
    }

    return clean;
}

// --- Helper: Parse List (Handles "FP NOTE" and "FP,FP") ---
static HashSet<string> ParseFingerprintList(string content, string source)
{
    var set = new HashSet<string>();
    if (string.IsNullOrWhiteSpace(content)) return set;

    var lines = content.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

    foreach (var line in lines)
    {
        string trimmed = line.Trim();
        if (string.IsNullOrEmpty(trimmed)) continue;

        // Split by comma if present (old format support)
        if (trimmed.Contains(","))
        {
            foreach (var part in trimmed.Split(','))
            {
                var fp = NormalizeFingerprint(part, source);
                if (fp != null) set.Add(fp);
            }
        }
        else
        {
            // New Line Format: "FP NOTE"
            int spaceIdx = trimmed.IndexOfAny(new[] { ' ', '\t' });
            string fpPart = (spaceIdx > 0) ? trimmed.Substring(0, spaceIdx) : trimmed;

            var fp = NormalizeFingerprint(fpPart, source);
            if (fp != null) set.Add(fp);
        }
    }
    return set;
}

// --- Prepare Allowed Fingerprints (Static) ---
if (!string.IsNullOrEmpty(MTLS_CERT_THEIRS))
{
    StaticFingerprints = ParseFingerprintList(MTLS_CERT_THEIRS, "ENV_VAR");
    // Initially, Allowed = Static
    AllowedFingerprints = new HashSet<string>(StaticFingerprints);
    Console.WriteLine($"[Startup] Loaded {AllowedFingerprints.Count} static fingerprints from Env.");
}

// --- Dynamic Fingerprint Refresh Setup ---
if (!string.IsNullOrEmpty(MTLS_CERT_THEIRS_URL))
{
    Console.WriteLine($"[Startup] Dynamic Fingerprint URL configured: {MTLS_CERT_THEIRS_URL}");

    // Logic to rebuild list: Static + Dynamic
    void RefreshFingerprints(object state)
    {
        try
        {
            string url = (string)state;
            string content = FetchContentString(url); // Reuse existing fetcher

            // Parse Dynamic List
            var dynamicFps = ParseFingerprintList(content, "URL");

            // Rebuild: Static + Dynamic
            var newSet = new HashSet<string>(StaticFingerprints);
            Console.WriteLine($"[Auth] Refreshing fingerprints... Static: {StaticFingerprints.Count}, Fetched: {dynamicFps.Count}");

            foreach (var fp in dynamicFps)
            {
                if (!newSet.Contains(fp))
                {
                    Console.WriteLine($"[Auth] + Adding dynamic FP: {fp.Substring(0, 8)}...");
                }
                newSet.Add(fp);
            }

            // Atomic Swap
            lock (_fpLock)
            {
                AllowedFingerprints = newSet;
            }

            Console.WriteLine($"[Auth] Fingerprint refresh complete. Total allowed: {AllowedFingerprints.Count}");
            // Optional: Print all keys if needed (can be noisy)
            // foreach(var fp in AllowedFingerprints) Console.WriteLine($"   - {fp}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Auth] ERROR during fingerprint refresh: {ex.Message}");
        }
    }

    // Run immediately
    RefreshFingerprints(MTLS_CERT_THEIRS_URL);

    // Setup Timer (Every 60 mins)
    var _fpTimer = new System.Threading.Timer(RefreshFingerprints, MTLS_CERT_THEIRS_URL,
        TimeSpan.FromMinutes(60), TimeSpan.FromMinutes(60));
}

// We need these accessible to the background timer and the Kestrel callback
System.Security.Cryptography.X509Certificates.X509Certificate2 _currentServerCert = null;
DateTime _lastCertLoadTime = DateTime.MinValue;
object _certLock = new object(); // Thread safety for swapping

// --- Static Helper for HTTP Certificate Fetching ---
// We use this for both PFX bytes and PEM string content


// --- Helper: Fetch Content (String) from HTTP, File, or Process ---
static string FetchContentString(string source)
{
    try
    {
        // 1. Handle HTTP/HTTPS
        if (source.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            source.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            var uri = new Uri(source);
            using (var handler = new HttpClientHandler())
            {
                // Allow self-signed origins for internal fetching
                handler.ServerCertificateCustomValidationCallback = (msg, cert, chain, errs) => true;
                using (var client = new HttpClient(handler))
                {
                    // Handle Basic Auth if embedded in URL
                    if (!string.IsNullOrEmpty(uri.UserInfo))
                    {
                        string basicAuth = Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes(uri.UserInfo));
                        client.DefaultRequestHeaders.Add("Authorization", $"Basic {basicAuth}");
                    }
                    // Sync download
                    return client.GetStringAsync(uri.GetLeftPart(UriPartial.Path)).Result;
                }
            }
        }

        // 2. Handle Local File (file://)
        if (source.StartsWith("file://", StringComparison.OrdinalIgnoreCase))
        {
            var uri = new Uri(source);
            string path = uri.LocalPath;
            Console.WriteLine($"[Auth] Reading local file: {path}");
            return System.IO.File.ReadAllText(path);
        }

        // 3. Handle Process Execution (process://)
        if (source.StartsWith("process://", StringComparison.OrdinalIgnoreCase))
        {
            // Format: process:///path/to/executable
            var uri = new Uri(source);
            string path = uri.LocalPath;

            Console.WriteLine($"[Auth] Executing process: {path}");

            var psi = new System.Diagnostics.ProcessStartInfo
            {
                FileName = path,
                // Pass query string as arguments? e.g. ?key=1 -> "key=1"
                Arguments = string.IsNullOrEmpty(uri.Query) ? "" : uri.Query.TrimStart('?'),
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using (var proc = System.Diagnostics.Process.Start(psi))
            {
                string stdout = proc.StandardOutput.ReadToEnd();
                string stderr = proc.StandardError.ReadToEnd();

                // Wait with timeout (10 seconds)
                if (!proc.WaitForExit(10000))
                {
                    proc.Kill();
                    throw new TimeoutException($"Process '{path}' timed out after 10 seconds.");
                }

                if (proc.ExitCode != 0)
                {
                    throw new Exception($"Process '{path}' failed with code {proc.ExitCode}. Error: {stderr}");
                }

                return stdout;
            }
        }

        // 4. Fallback (Try as raw file path)
        Console.WriteLine($"[Auth] Warning: Unknown scheme in '{source}'. Attempting to read as file.");
        return System.IO.File.ReadAllText(source);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[CRITICAL] Failed to fetch content from '{source}': {ex.Message}");
        throw;
    }
}


static byte[] FetchHttpContentBytes(string url)
{
    // Reuse logic or implement byte fetch (for PFX)
    Console.WriteLine($"[SSL] Fetching binary content from URL: {url}");
    var uri = new Uri(url);
    using (var handler = new HttpClientHandler())
    {
        handler.ServerCertificateCustomValidationCallback = (msg, cert, chain, errs) => true;
        using (var client = new HttpClient(handler))
        {
            if (!string.IsNullOrEmpty(uri.UserInfo))
            {
                string basicAuth = Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes(uri.UserInfo));
                client.DefaultRequestHeaders.Add("Authorization", $"Basic {basicAuth}");
            }
            return client.GetByteArrayAsync(uri.GetLeftPart(UriPartial.Path)).Result;
        }
    }
}


bool ReloadServerCert()
{
    try
    {
        System.Security.Cryptography.X509Certificates.X509Certificate2 newCert = null;

        // CASE 1: PEM Mode (Cert + Key)
        if (!string.IsNullOrEmpty(MTLS_KEY_OURS))
        {
            string certPem;
            string keyPem;

            certPem = FetchContentString(MTLS_CERT_OURS);
            keyPem = FetchContentString(MTLS_KEY_OURS);


            using (var tempCert = System.Security.Cryptography.X509Certificates.X509Certificate2.CreateFromPem(certPem, keyPem))
            {
                newCert = new System.Security.Cryptography.X509Certificates.X509Certificate2(tempCert.Export(System.Security.Cryptography.X509Certificates.X509ContentType.Pfx));
            }
        }
        // CASE 2: PFX Mode
        else
        {
            byte[] pfxBytes;
            if (MTLS_CERT_OURS.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                pfxBytes = FetchHttpContentBytes(MTLS_CERT_OURS);
            else
                pfxBytes = System.IO.File.ReadAllBytes(MTLS_CERT_OURS);

            newCert = new System.Security.Cryptography.X509Certificates.X509Certificate2(pfxBytes, "",
                System.Security.Cryptography.X509Certificates.X509KeyStorageFlags.MachineKeySet |
                System.Security.Cryptography.X509Certificates.X509KeyStorageFlags.PersistKeySet);
        }

        // Check if cert is actually different (optional optimization)
        // For simplicity, we swap it if loaded successfully.

        lock (_certLock)
        {
            var oldCert = _currentServerCert;
            _currentServerCert = newCert;
            oldCert?.Dispose(); // Clean up old cert
            _lastCertLoadTime = DateTime.UtcNow;
        }

        Console.WriteLine($"[SSL] Server certificate reloaded. Thumbprint: {newCert.Thumbprint}");
        return true;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[SSL] ERROR reloading certificate: {ex.Message}");
        return false;
    }
}


// --- Main Configuration Logic ---
if (MTLS)
{
    // 1. Initial Load (Blocking startup if it fails)
    Console.WriteLine("[Startup] Performing initial certificate load...");
    if (!ReloadServerCert())
    {
        Console.WriteLine("[CRITICAL] Initial certificate load failed. Exiting.");
        Environment.Exit(1);
    }

    // 2. Setup Background Timer (Reload every 1 hour)
    // Timer callback runs in ThreadPool
    var _reloadTimer = new System.Threading.Timer((state) =>
    {
        // Optional: Check time to avoid redundant reloads if logic expands
        // if ((DateTime.UtcNow - _lastCertLoadTime).TotalMinutes < 60) return;

        Console.WriteLine("[SSL] Background check: Attempting certificate reload...");
        ReloadServerCert();
    }, null, TimeSpan.FromMinutes(60), TimeSpan.FromMinutes(60)); // DueTime, Period

    // 2. Configure Kestrel
    builder.WebHost.ConfigureKestrel(options =>
    {
        // Configure defaults to apply mTLS to whatever endpoint ASPNETCORE_URLS defines
        options.ConfigureEndpointDefaults(listenOptions =>
        {
            listenOptions.UseHttps(httpsOptions =>
            {
                // USE SELECTOR: Allows dynamic swapping of the cert
                httpsOptions.ServerCertificateSelector = (context, name) =>
                {
                    // Return the thread-safe current reference
                    return _currentServerCert;
                };
                httpsOptions.ClientCertificateMode = Microsoft.AspNetCore.Server.Kestrel.Https.ClientCertificateMode.RequireCertificate;

                // Fingerprint Validation Logic
                httpsOptions.ClientCertificateValidation = (cert, chain, policy) =>
                {
                    if (cert == null) return false;

                    // Helper to get clean SHA256 hash
                    string GetCleanHash(System.Security.Cryptography.X509Certificates.X509Certificate2 c)
                    {
                        return c.GetCertHashString(System.Security.Cryptography.HashAlgorithmName.SHA256).ToUpperInvariant();
                    }

                    string leafHash = GetCleanHash(cert);

                    // Check A: Leaf Certificate Match
                    if (AllowedFingerprints.Contains(leafHash))
                    {
                        Console.WriteLine($"[Auth] SUCCESS: Client FP matched leaf: {leafHash.Substring(0, 8)}...");
                        return true;
                    }

                    // Check B: Intermediate Chain Match (if enabled)
                    if (MTLS_ALLOW_INTERMEDIATE && chain != null)
                    {
                        foreach (var element in chain.ChainElements)
                        {
                            string chainHash = GetCleanHash(element.Certificate);
                            if (AllowedFingerprints.Contains(chainHash))
                            {
                                Console.WriteLine($"[Auth] SUCCESS: Client FP matched intermediate: {chainHash.Substring(0, 8)}...");
                                return true;
                            }
                        }
                    }

                    // Failure
                    Console.WriteLine($"[Auth] FAILED: Client FP {leafHash.Substring(0, 8)}... not in whitelist.");
                    return false;
                };
            });
        });
    });
}
else
{
    Console.WriteLine("[Startup] MTLS Disabled. Using default configuration.");
}

var app = builder.Build();
app.UseResponseCompression();


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
string TOTP_SECRET = Environment.GetEnvironmentVariable("TOTP_SECRET") ?? "";
bool VERIFY_OTP = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("VERIFY_OTP"));
Console.WriteLine($"verify_otp: {VERIFY_OTP}");
(string currentOtp, bool isValid) GetOtpStatus(string userOtp)
{
    var totp = new Totp(Base32Encoding.ToBytes(TOTP_SECRET));
    var currentOtp = totp.ComputeTotp();
    var isValid = totp.VerifyTotp(userOtp, out _, new VerificationWindow(previous: 2, future: 1));
    Console.WriteLine($"verify_otp: {VERIFY_OTP}, supplied_otp: {userOtp}, computed_otp: {currentOtp}");
    return (currentOtp, isValid);
}
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
app.UsePathBase(BASE_PATH.TrimEnd('/'));
app.Use(async (context, next) =>
{
    Logger.Log($"Request: PathBase: {context.Request.PathBase}, Path: {context.Request.Path}");
    await next();
});
Console.WriteLine($"BASE_PATH: {BASE_PATH.TrimEnd('/')}");
// Windows 2000–style Sway config as one C# string: right-click on the titlebar (border) only
string _2kSwayConfig =
    "set $bg      #C0C0C0\n" +
    "set $focus   #000080\n" +
    "set $normal  #808080\n" +
    //"bar hidden\n" +
    "for_window [app_id=\".*\"] floating enable\n" +
    "for_window [app_id=\".*\"] border pixel 2\n" +
    "for_window [app_id=\".*\"] move position center\n" +
    "for_window [class=\".*\"] floating enable\n" +
    "for_window [class=\".*\"] border pixel 2\n" +
    "for_window [class=\".*\"] move position center\n" +
    "focus_follows_mouse no\n" +
    "client.focused   $focus $focus #C0C0C0 $focus\n" +
    "client.unfocused $normal $normal #C0C0C0 $normal\n" +
    //"unbind_all\n" +
    "bindsym Alt+F4 kill\n" +
    "bindsym button3 kill\n" // right-click on the border (titlebar) to close
    + "floating_modifier ctrl\n"
    + "bindsym button1 move\n"
    + "bindsym button2 [floating_modifier] scratchpad show\n";


try
{
    File.WriteAllText("empty_x_startup", "#!/bin/sh\nexec tail -f /dev/null");
    File.WriteAllText("empty_sway_startup", $"output * resolution {W}x{H} bg #008080 solid_color\n{_2kSwayConfig}");
    File.SetUnixFileMode("empty_x_startup", File.GetUnixFileMode("empty_x_startup") | UnixFileMode.UserExecute | UnixFileMode.GroupExecute | UnixFileMode.OtherExecute);
}
catch (Exception E) { }

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
static async Task<bool> WaitForFileCreationAsync(
    string filePath,
    int timeoutMs = 5000,
    CancellationToken cancellationToken = default)
{
    var sw = Stopwatch.StartNew();

    while (sw.ElapsedMilliseconds < timeoutMs)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (File.Exists(filePath))
            return true;

        // frees up the thread instead of blocking it
        await Task.Delay(100, cancellationToken);
    }

    return false;
}
bool WaitForFileCreation(string filePath, int timeoutMs = 5000)
{
    var sw = Stopwatch.StartNew();
    while (sw.ElapsedMilliseconds < timeoutMs)
    {
        if (File.Exists(filePath))
        {
            return true;
        }
        Thread.Sleep(100);
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
        //s.AttemptCount++;
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
        s.AttemptCount = i + 1;
    }
    cleanup(s);
}
async Task SpawnVNCChildProcess(ActiveSessions s,
                                   string command,
                   string args,
                                   Action<ActiveSessions> cleanup)
{
    for (int i = 0; i < 1; i++) // WE ONLY LAUNCH ONCE ATTEMPT_TIMES; i++)
    {
        s.AttemptCount++;
        Logger.Log($"[VNC {i + 1}/{ATTEMPT_TIMES}] launch cookie={s.Cookie} config={command} {args}");
        var p = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = command,
                Arguments = args,
                RedirectStandardOutput = false,
                RedirectStandardError = false,
                UseShellExecute = true,
                CreateNoWindow = true
            },
            EnableRaisingEvents = true
        };
        p.StartInfo.Environment["WLR_BACKENDS"] = "headless";
        p.StartInfo.Environment["LIBGL_ALWAYS_SOFTWARE"] = "1";
        s.AppProcess = p;
        var tcs = new TaskCompletionSource<bool>();
        p.Exited += (_, __) =>
        {
            s.LastActive = DateTime.UtcNow;
            Logger.Log($"swaymsg exec VNCd exited code={p.ExitCode}");
            tcs.TrySetResult(true);
        };
        p.Start();
        await tcs.Task;
    }
}

async Task<ActiveSessions> StartWebRTCSession(string cookie,
                                  string procName,
                                  Action<ActiveSessions> cleanup)
{
    int vncPort = GetFreePort(), display = new Random().Next(1, 100);
    Process? vnc = null, appProc = null;
    //var USock = $"{Path.Combine(Directory.GetCurrentDirectory(), "unix-")}{vncPort}";
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
    string RTDir = $"{Path.Combine(Directory.GetCurrentDirectory(), "wl-")}{display}";
    string RTSock = $"{RTDir}.swaysock";
    string WLSock = $"{RTDir}.wlsock";
    try { File.Delete(USock); } catch { }
    try { File.Delete(ShouldConnectToUSock); } catch { }
    try { File.Delete(RTSock); } catch { }
    try { Directory.Delete(RTDir, true); } catch { }
    if (RECORD_SCREEN) USock = $"{USock}.orig";
    string wayVncLauncherCommand = "";
    string wayVncLauncherArgs = "";
    if (!NO_KIOSK)
    {
        var swayPsi = new ProcessStartInfo("sway", $"-c empty_sway_startup")
        {
            UseShellExecute = false,
        };
        swayPsi.Environment["SWAYSOCK"] = $"{RTSock}";
        Console.WriteLine($"{swayPsi.Environment["SWAYSOCK"]}");
        swayPsi.Environment["XDG_RUNTIME_DIR"] = $"{RTDir}";
        swayPsi.Environment["WLR_BACKENDS"] = "headless";
        swayPsi.Environment["WLR_RENDERER"] = "pixman";
        swayPsi.Environment["LIBGL_ALWAYS_SOFTWARE"] = "1";
        swayPsi.Environment["MESA_LOADER_DEIVER_OVERRIDE"] = "llvmpipe";
        try { Directory.CreateDirectory($"{RTDir}"); } catch { }
    ;
        vnc = Process.Start(swayPsi)!;
        // One-liner swaymsg commands:
        // Launch wayvnc with its UNIX socket set to "unix-{vncPort}.vncsock".
        if (!WaitForUnixSocketOpen($"{RTSock}"))
            Logger.Log($"Warning: Wayland server on port {RTSock} did not open");
        await Task.Delay(1000);
        wayVncLauncherCommand = "swaymsg";
        wayVncLauncherArgs = $"-s {RTSock} exec \"sh -c 'count=0; while [ $count -lt 20 ]; do rm -f {USock}; wayvnc -v -C /dev/null --unix-socket {USock} >>{RTSock}.log 2>&1; echo Restarting: wayvnc {RTSock}@{USock} attempt $((count+1))/20; rm {USock}; [ -S \"$XDG_RUNTIME_DIR/$WAYLAND_DISPLAY\" ] && echo Sway still alive || break; count=$((count+1)); sleep 1; done'\"";
        Console.WriteLine($"wayvnc: {wayVncLauncherCommand} {wayVncLauncherArgs}");
    }
    Console.WriteLine($"RECORD_SCREEN: {RECORD_SCREEN}");
    await Task.Delay(100);
    if (!await WaitForFileCreationAsync($"{USock}"))
        Logger.Log($"Warning: vnc server on port {USock} did not open");
    if (!NO_KIOSK)
    {
        appProc = Process.Start(new ProcessStartInfo("swaymsg", $"-s {RTSock} exec \"{procName}\"")
        {
            UseShellExecute = false,
        })!;
    }
    await Task.Delay(50);
    Logger.Log($"Session started: cookie={cookie}, d:{display}, vnc(pid={vnc?.Id}@unix-{vncPort}), {procName}(pid={appProc?.Id})");

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


    var otbl = new ForwarderConfigOut()
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
    }.ToTomlTable();


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
    // inject TURN/STUN if set for the offerer
    if (Environment.GetEnvironmentVariable("OFFERER_TURN_SERVER") is string turno && turno != "")
    {
        if (Environment.GetEnvironmentVariable("OFFERER_TURN_USERNAME") is string turnou && turnou != "")
        {
            otbl["ICEServers"] = new TomlArray {
                new TomlTable {
                    ["URLs"]       = new TomlArray { turno },
                    ["Username"]   = Environment.GetEnvironmentVariable("OFFERER_TURN_USERNAME"),
                    ["Credential"] = Environment.GetEnvironmentVariable("OFFERER_TURN_CREDENTIAL")
                }
            };
        }
        else
        {
            otbl["ICEServers"] = new TomlArray {
                new TomlTable { ["URLs"] = new TomlArray { turno }, }
            };
        }
    }
    ;

    /* Generate WebRTC Forwarder TOML configuration */
    var OffererToml = Toml.FromModel(otbl);

    // serialize
    var AnswererToml = Toml.FromModel(atbl);

    var ourForwarderToml = AnswererToml;
    var theirForwarderToml = OffererToml;
    configOurs = AnswererToml;
    string configTheirs = OffererToml;
    Logger.Log($"Session started WebRTC: cookie={cookie}, display={display}, vnc(pid={vnc?.Id}), app(pid={appProc?.Id}), config={configOurs}, configTheirs={configTheirs}");

    var s = new ActiveSessions
    {
        Display = display,
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
        AttemptCount = 0,
        //Duplicator = Duplicator,
    };
    File.WriteAllText($"webrtc-config-{vncPort}.toml", configOurs);

    if (!NO_KIOSK)
    {
        _ = SpawnVNCChildProcess(s, wayVncLauncherCommand, wayVncLauncherArgs, cleanup);
        Logger.Log("Spawned VNC child");
        if (!await WaitForFileCreationAsync($"{USock}"))
            Logger.Log($"Warning: vnc server on port {USock} did not open");
    }
    Process? Duplicator = null;
    if (RECORD_SCREEN)
    {
        Duplicator = Process.Start(new ProcessStartInfo("duplicator", $"{ShouldConnectToUSock} {USock} screendump") { UseShellExecute = true });
        Console.WriteLine($"Duplicator: listen: {ShouldConnectToUSock} to: {USock}");
        if (!await WaitForFileCreationAsync($"{USock}"))
            Logger.Log($"Warning: vnc server on port {ShouldConnectToUSock} did not open");
    }
    _ = SpawnWebRTCChildProcess(s, $"webrtc-config-{vncPort}.toml", cleanup);
    s.Duplicator = Duplicator;
    Logger.Log("Spawned RTC child");
    return s;
}



async Task<ActiveSessions> StartSession(string cookie, string procName)
{
    int vncPort = GetFreePort(), wsPort = GetFreePort(), display = new Random().Next(1, 100);
    Process? vnc = null;
    var USock = $"{Path.Combine(Directory.GetCurrentDirectory(), "unix-")}{vncPort}";
    var ShouldConnectToUSock = USock;
    if (RECORD_SCREEN) USock = $"{USock}.orig";
    string RTDir = $"{Path.Combine(Directory.GetCurrentDirectory(), "wl-")}{display}";
    string RTSock = $"{RTDir}.swaysock";
    string WLSock = $"{RTDir}.wlsock";
    string wayVncLauncherCommand = "";
    string wayVncLauncherArgs = "";
    try { File.Delete(USock); } catch { }
    try { File.Delete(ShouldConnectToUSock); } catch { }
    if (!NO_KIOSK)
    {
        try { File.Delete(RTSock); } catch { }
        try { Directory.Delete(RTDir, true); } catch { }
        var swayPsi = new ProcessStartInfo("sway", $"-c empty_sway_startup")
        {
            UseShellExecute = false,
        };
        swayPsi.Environment["SWAYSOCK"] = $"{RTSock}";
        Console.WriteLine($"{cookie}'s SWAYSOCK: {swayPsi.Environment["SWAYSOCK"]}");
        swayPsi.Environment["XDG_RUNTIME_DIR"] = $"{RTDir}";
        swayPsi.Environment["WLR_BACKENDS"] = "headless";
        swayPsi.Environment["WLR_RENDERER"] = "pixman";
        swayPsi.Environment["LIBGL_ALWAYS_SOFTWARE"] = "1";
        swayPsi.Environment["MESA_LOADER_DEIVER_OVERRIDE"] = "llvmpipe";
        try { Directory.CreateDirectory($"{RTDir}"); } catch { }
    ;
        vnc = Process.Start(swayPsi)!;
        // One-liner swaymsg commands:
        // Launch wayvnc with its UNIX socket set to "unix-{vncPort}.vncsock".
        if (!await WaitForFileCreationAsync($"{RTSock}"))
            Logger.Log($"Warning: Wayland server on port {RTSock} did not open");
        await Task.Delay(1000);
        wayVncLauncherCommand = "swaymsg";
        wayVncLauncherArgs = $"-s {RTSock} exec \"sh -c 'count=0; while [ $count -lt 20 ]; do rm -f {USock}; wayvnc -v -C /dev/null --unix-socket {USock} >>{RTSock}.log 2>&1; echo Restarting: wayvnc {RTSock}@{USock} attempt $((count+1))/20; rm {USock}; [ -S \"$XDG_RUNTIME_DIR/$WAYLAND_DISPLAY\" ] && echo Sway still alive || break; count=$((count+1)); sleep 1; done'\"";
        Console.WriteLine($"wayvnc: {wayVncLauncherCommand} {wayVncLauncherArgs}");
        Console.WriteLine($"RECORD_SCREEN: {RECORD_SCREEN}");
        Console.WriteLine("Started wayvnc");
    }
    Process? Duplicator = null;
    if (RECORD_SCREEN)
    {
        Duplicator = Process.Start(new ProcessStartInfo("duplicator", $"{ShouldConnectToUSock} {USock} screendump") { UseShellExecute = true });
    }
    await Task.Delay(100);
    if (!await WaitForFileCreationAsync($"{USock}"))
        Logger.Log($"Warning: vnc server on port unix-{vncPort} did not open");
    Process? appProc = null;
    if (!NO_KIOSK)
    {
        appProc = Process.Start(new ProcessStartInfo("swaymsg", $"-s {RTSock} exec \"{procName}\"")
        {
            UseShellExecute = false,
        })!;
    }
    await Task.Delay(50);
    var s = new ActiveSessions
    {
        Display = display,
        Cookie = cookie,
        LastActive = DateTime.UtcNow,
        VncProcess = vnc,
        AppProcess = appProc,
        VncPort = vncPort,
        WebsockifyPort = wsPort
    };
    if (!NO_KIOSK)
    {
        _ = SpawnVNCChildProcess(s, wayVncLauncherCommand, wayVncLauncherArgs, cleanup);
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
    s.WebsockifyProcess = wsProc;
    return s;
}
void UpdateSession(string cookie)
{
    lock (SessionsDataLock)
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
        lock (SessionsDataLock)
        {
            sessions.RemoveAll(s =>
            {
                if (s.IsWebRTCSession)
                {
                    if (s.AttemptCount > ATTEMPT_TIMES)
                    {
                        Console.WriteLine($"Cleaning up idle WebRTC session: cookie {s.Cookie} Attempt count {s.AttemptCount}");
                        string RTDir = $"{Path.Combine(Directory.GetCurrentDirectory(), "wl-")}{s.Display}";
                        string RTSock = $"{RTDir}.swaysock";
                        Logger.Log($"WebRTC done: cookie={s.Cookie} attempts={s.AttemptCount}; killing");
                        try { Directory.Delete($"{RTDir}", true); } catch { }
                        try { File.Delete($"{RTSock}"); } catch { }
                        try { if (!s.AppProcess.HasExited) s.AppProcess.Kill(); } catch { }
                        try { if (s.WebsockifyProcess != null && !s.WebsockifyProcess.HasExited) s.WebsockifyProcess.Kill(); } catch { }
                        try { if (!s.VncProcess.HasExited) s.VncProcess.Kill(); } catch { }
                        try { if (s.Duplicator != null && !s.Duplicator.HasExited) s.Duplicator.Kill(); } catch { }
                        return true;
                    }
                }
                else
                {
                    if ((DateTime.UtcNow - s.LastActive).TotalSeconds > KILL_WAIT)
                    {
                        Logger.Log($"Session idle: cookie={s.Cookie} idle for {(DateTime.UtcNow - s.LastActive).TotalSeconds}s; killing processes");
                        string RTDir = $"{Path.Combine(Directory.GetCurrentDirectory(), "wl-")}{s.Display}";
                        string RTSock = $"{RTDir}.swaysock";
                        try { Directory.Delete($"{RTDir}", true); } catch { }
                        try { File.Delete($"{RTSock}"); } catch { }
                        try { File.Delete($"unix-{s.VncPort}"); } catch { }
                        try { File.Delete($"ws-{s.WebsockifyPort}"); } catch { }
                        try { Console.Error.WriteLine($"Killing {s.VncProcess.Id}"); Process.Start(new ProcessStartInfo("kill", $"-KILL -- -{s.VncProcess.Id}") { UseShellExecute = false }); } catch (Exception E) { Console.Error.WriteLine(E); }
                        try { Process.Start(new ProcessStartInfo("kill", $"{s.VncProcess.Id}") { UseShellExecute = false }); } catch (Exception E) { Console.Error.WriteLine(E); }
                        try { Process.Start(new ProcessStartInfo("kill", $"{s.VncProcess.Id}") { UseShellExecute = false }); } catch (Exception E) { Console.Error.WriteLine(E); }
                        try { if (!s.WebsockifyProcess.HasExited) s.WebsockifyProcess.Kill(); } catch { }
                        try { if (!s.VncProcess.HasExited) s.VncProcess.Kill(); } catch { }
                        try { if (!s.AppProcess.HasExited) s.AppProcess.Kill(); } catch { }
                        return true;
                    }
                }
                return false;
            });
        }
    }
});


app.MapGet("/WebRTCInfo", (string session) =>
{
    lock (SessionsDataLock)
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
    }
});
app.MapGet("SignOut", (HttpContext context) =>
{
    lock (SessionsDataLock)
    {
        var potentialSessions = context.Request.Cookies;
        string[] cookieNames = potentialSessions.Keys.ToArray();
        for (int i = 0; i < cookieNames.Length; i++)
        {
            var idx = sessions.FindIndex(x => x.Cookie == potentialSessions[cookieNames[i]]);
            if (idx >= 0)
            {
                sessions.RemoveAt(idx);
            }
        }
    }
    return true;
}
);
app.UseWebSockets();

// GET "/" route: redirect user only to vnc_lite.html (WS endpoint is passed as querystring without leading slash)
app.MapGet("/", async Task<IResult> (HttpContext context) =>
{
    string targetApp = (string?)context.Request.Query["app"] ?? (string?)context.Request.Query["App"];
    string QIsWebRTCSession = (string?)context.Request.Query["WebRTC"] ?? (string?)context.Request.Query["webrtc"];
    Logger.Log($"QIsWebRTCSession: {QIsWebRTCSession}");
    if (string.IsNullOrEmpty(QIsWebRTCSession))
        QIsWebRTCSession = "false";
    bool IsWebRTCSession = QIsWebRTCSession.ToLowerInvariant() == "true";
    string QIsHeavy = (string?)context.Request.Query["heavy"] ?? (string?)context.Request.Query["HEAVY"]
        ?? (string?)context.Request.Query["Heavy"];
    Logger.Log($"QIsHeavy: {QIsHeavy}");
    if (string.IsNullOrEmpty(QIsHeavy))
        QIsHeavy = "false";
    bool IsHeavySessionRequested = QIsHeavy.ToLowerInvariant() == "true";
    if (string.IsNullOrEmpty(targetApp))
        targetApp = defaultApp;
    var extraQs = string.Concat(PreservedParameters.Select(p =>
    context.Request.Query.TryGetValue(p, out StringValues v) && !StringValues.IsNullOrEmpty(v)
      ? $"&{p}={Uri.EscapeDataString(v.First())}"
      : ""));
    if (!approvedCommands.Contains(targetApp))
    { // why: restrict allowed commands
        Logger.Log($"Disallowed app '{targetApp}' requested, defaulting to {defaultApp}");
        targetApp = defaultApp;
    }
    string sessionCookieName = $"session_{targetApp}";
    string cookie = ALWAYS_NEW_SESSION ? Guid.NewGuid().ToString() : (context.Request.Cookies[sessionCookieName] ?? Guid.NewGuid().ToString());
    string QTOTP = (string?)context.Request.Query["totp"] ?? (string?)context.Request.Query["TOTP"] ?? (string?)context.Request.Query["Totp"];
    Logger.Log($"QTOTP: {QTOTP}");
    if (VERIFY_OTP)
    {
        (string expectedOtp, bool IS_TOTP_OK) = GetOtpStatus(QTOTP);
        if (!IS_TOTP_OK)
        {
            Console.WriteLine($"OTP failed for: {QTOTP}, expected {expectedOtp}");
            return Results.Unauthorized();
        }
    }
    context.Response.Cookies.Append(sessionCookieName, cookie);
    ActiveSessions session;
    bool IS_AUTHORIZED = !USE_AUTHENTICATION || context.TryAuthenticate(AUTH_USERNAME, AUTH_PASSWORD);
    bool SessionsAny = false;
    lock (SessionsDataLock)
    {
        SessionsAny = sessions.Any(s => s.Cookie == cookie);
    }
    if (ALWAYS_NEW_SESSION || !SessionsAny)
    {
        if (IS_AUTHORIZED)
        {
            if (!IsWebRTCSession)
            {
                session = await StartSession(cookie, targetApp);
                lock (SessionsDataLock)
                {
                    sessions.Add(session);
                }
                Logger.Log($"New session for cookie={cookie} app={targetApp}");
            }
            else
            {
                session = await StartWebRTCSession(cookie, targetApp, cleanup);
                Logger.Log("WebRTC Session Requested");
                lock (SessionsDataLock)
                {
                    sessions.Add(session);
                }
            }
        }
        else
        {
            context.Response.Headers.Append(
  "WWW-Authenticate", $"Basic realm=\"\", charset=\"UTF-8\"");
            return Results.Unauthorized();
        }
    }
    else
    {
        session = sessions.First(s => s.Cookie == cookie);
        Logger.Log($"Existing session for cookie={cookie} app={targetApp}");

    }
    await Task.Delay(150);
    if (!session.IsWebRTCSession)
    {
        return IsHeavySessionRequested ? Results.Redirect($"{BASE_PATH}static/vnc.min.html?session={cookie}&path={(BASE_PATH == "/" ? "/" : BASE_PATH)}{targetApp}/ws&autoconnect=true{extraQs}") : Results.Redirect($"{BASE_PATH}static/{PAGE}?session={cookie}&path={(BASE_PATH == "/" ? "/" : BASE_PATH)}{targetApp}/ws&autoconnect=true{extraQs}");
    }
    else
    {
        return IsHeavySessionRequested ? Results.Redirect($"{BASE_PATH}static/vncrtcheavy.min.html?baseurl={BASE_PATH}&session={cookie}&path={(BASE_PATH == "/" ? "/" : BASE_PATH)}{targetApp}/ws&autoconnect=true{extraQs}") : Results.Redirect($"{BASE_PATH}static/vncrtckeepalive.min.html?baseurl={BASE_PATH}&session={cookie}&path={(BASE_PATH == "/" ? "/" : BASE_PATH)}{targetApp}/ws&autoconnect=true{extraQs}");
    }
    //context.Response.Redirect($"{BASE_PATH}static/{PAGE}?session={cookie}&path={(BASE_PATH == "/" ? "/" : BASE_PATH)}{targetApp}/ws&autoconnect=true");
});

// WS forwarder endpoint: not directly seen by the user, only by vnc_lite.html.
RequestDelegate WsHandler = async (HttpContext context) =>
{
    Console.WriteLine("Endpoint hit: targetApp/ws");
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
        lock (SessionsDataLock)
        {
            sessions.Add(session);
        }
        idx = sessions.Count - 1;
        Logger.Log($"Session restarted for cookie={cookie} app={targetApp}");
    }
    ActiveSessions userSession;
    lock (SessionsDataLock)
    {
        userSession = sessions[idx];
    }
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

app.MapGet("/launch", (HttpContext context) =>
{
    System.Console.WriteLine("[launch] Launch endpoint hit...");
    var query = context.Request.Query;

    // Helper to safely get query values for pre-filling
    string GetVal(string key) => query[key].FirstOrDefault() ?? "";

    // Handle bools for checkboxes
    string IsChecked(string key) =>
        (query[key].FirstOrDefault()?.Equals("true", StringComparison.OrdinalIgnoreCase) ?? false)
        ? "checked" : "";

    // Resolve aliases (u/user -> u, p/pass -> p) for pre-fill
    string userVal = string.IsNullOrEmpty(GetVal("u")) ? GetVal("user") : GetVal("u");
    string passVal = string.IsNullOrEmpty(GetVal("p")) ? GetVal("pass") : GetVal("p");

    string html = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Launch Configuration</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f4f4f9; color: #333; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }}
        .container {{ background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }}
        h3 {{ margin-top: 0; margin-bottom: 1.5rem; text-align: center; color: #444; }}
        .form-group {{ margin-bottom: 1rem; }}
        label {{ display: block; margin-bottom: 0.5rem; font-weight: 500; }}
        input[type='text'], input[type='password'] {{ width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }}
        .checkbox-group {{ display: flex; align-items: center; gap: 0.5rem; }}
        .checkbox-group input {{ margin: 0; }}
        button {{ width: 100%; padding: 0.75rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; margin-top: 1rem; }}
        button:hover {{ background-color: #0056b3; }}
        .section-title {{ font-size: 0.9rem; color: #666; margin-top: 1rem; margin-bottom: 0.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.25rem; }}
    </style>
</head>
<body>
    <div class='container'>
        <h3>Session Launch</h3>
        <form method='GET' action='/'>
            <!-- Connection Options -->
            <div class='section-title'>Connection</div>
            
            <div class='form-group checkbox-group'>
                <input type='checkbox' id='webrtc' name='WebRTC' value='true' {IsChecked("WebRTC")}>
                <label for='webrtc' style='margin-bottom:0'>Enable WebRTC</label>
            </div>
            
            <div class='form-group checkbox-group'>
                <input type='checkbox' id='heavy' name='heavy' value='true' {IsChecked("heavy")}>
                <label for='heavy' style='margin-bottom:0'>Heavy Mode (Advanced Features)</label>
            </div>

            <!-- Authentication -->
            <div class='section-title'>Authentication</div>
            
            <div class='form-group'>
                <label for='password'>VNC Password</label>
                <input type='password' id='password' name='password' placeholder='VNC Password' value='{GetVal("password")}'>
            </div>

            <div class='form-group'>
                <label for='u'>Basic Auth User</label>
                <input type='text' id='u' name='u' placeholder='Username' value='{userVal}'>
            </div>

            <div class='form-group'>
                <label for='p'>Basic Auth Pass</label>
                <input type='password' id='p' name='p' placeholder='Password' value='{passVal}'>
            </div>

            <div class='form-group'>
                <label for='totp'>TOTP Code</label>
                <input type='text' id='totp' name='totp' placeholder='One-time password' value='{GetVal("totp")}'>
            </div>

            <button type='submit'>Connect</button>
        </form>
    </div>
</body>
</html>";

    return Results.Content(html, "text/html");
});


app.Map("/{targetApp}/ws", WsHandler);
// Catch-All route to pick up malformed URLs like ////targetApp/ws.



// Use MapWhen to exclude /static requests from entering the catchall branch.
// Branch out requests that do not start with "/static".
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
    public int Display;
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




static class HttpContextExtensions
{
    public static bool TryAuthenticate(this HttpContext context, string expectedUser, string expectedPass)
    {
        var req = context.Request;
        Logger.Log($"[Auth] Starting authentication check for path {req.Path}");

        // 1) Basic auth header
        if (req.Headers.TryGetValue("Authorization", out StringValues authHeader))
        {
            var header = authHeader.FirstOrDefault();
            Logger.Log($"[Auth] Authorization header: {header ?? "<empty>"}");

            if (!string.IsNullOrEmpty(header) &&
                header.StartsWith("Basic ", StringComparison.OrdinalIgnoreCase))
            {
                Logger.Log("[Auth] Detected Basic scheme");
                var payload = header["Basic ".Length..].Trim();

                try
                {
                    var raw = Convert.FromBase64String(payload);
                    var decoded = Encoding.UTF8.GetString(raw);
                    var parts = decoded.Split(':', 2);

                    if (parts.Length == 2)
                    {
                        var u = parts[0];
                        var p = parts[1];
                        Logger.Log($"[Auth] Decoded creds: user={u}; pass length={p.Length}");

                        if (u == expectedUser && p == expectedPass)
                        {
                            Logger.Log($"[Auth] Basic auth succeeded for user {u}");
                            return true;
                        }

                        Logger.Log($"[Auth] Basic auth mismatch (got {u}/****)");
                    }
                    else
                    {
                        Logger.Log($"[Auth] Payload split into {parts.Length} parts, expected 2");
                    }
                }
                catch (FormatException ex)
                {
                    Logger.Log($"[Auth] Invalid Base64: {ex.Message}");
                }
            }
            else
            {
                Logger.Log("[Auth] Header did not start with 'Basic '");
            }
        }
        else
        {
            Logger.Log("[Auth] No Authorization header found");
        }

        // 2) Query-string fallback
        Logger.Log("[Auth] Falling back to query-string");
        var userQuery = GetQueryValue(req, "user", "u");
        var passQuery = GetQueryValue(req, "pass", "p");
        Logger.Log($"[Auth] Query values: user={userQuery ?? "<null>"}; pass length={passQuery?.Length ?? 0}");

        if (userQuery == expectedUser && passQuery == expectedPass)
        {
            Logger.Log($"[Auth] Query-string auth succeeded for user {userQuery}");
            return true;
        }

        Logger.Log($"[Auth] Query-string auth failed (got {userQuery ?? "<null>"}/****)");
        return false;
    }

    private static string GetQueryValue(HttpRequest req, params string[] keys)
    {
        foreach (var key in keys)
        {
            if (req.Query.TryGetValue(key, out var value) &&
                !StringValues.IsNullOrEmpty(value))
            {
                return value.ToString();
            }
        }
        return null;
    }
}
