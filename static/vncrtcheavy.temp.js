




        import UI from "./app/ui.js";
        import * as Log from './core/util/logging.js';
        import RFB from './core/rfb.js';

	const F23 = 0xFFD4;  // Add this line

        let response;
        let rfb;
        let desktopName;

        let defaults = {};
        let mandatory = {};

        // Default settings will be loaded from defaults.json. Mandatory
        // settings will be loaded from mandatory.json, which the user
        // cannot change.

        try {
            response = await fetch('./defaults.json');
            if (!response.ok) {
                throw Error("" + response.status + " " + response.statusText);
            }

            defaults = await response.json();
        } catch (err) {
            Log.Error("Couldn't fetch defaults.json: " + err);
        }

        try {
            response = await fetch('./mandatory.json');
            if (!response.ok) {
                throw Error("" + response.status + " " + response.statusText);
            }

            mandatory = await response.json();
        } catch (err) {
            Log.Error("Couldn't fetch mandatory.json: " + err);
        }

        // Read parameters specified in the URL query string
        // By default, use the host and port of server that served this file
        function readQueryVariable(name, defaultValue) {
            // A URL with a query parameter can look like this:
            // https://www.example.com?myqueryparam=myvalue
            //
            // Note that we use location.href instead of location.search
            // because Firefox < 53 has a bug w.r.t location.search
            const re = new RegExp('.*[?&]' + name + '=([^&#]*)'),
                  match = document.location.href.match(re);

            if (match) {
                // We have to decode the URL since want the cleartext value
                return decodeURIComponent(match[1]);
            }

            return defaultValue;
        }

        const password = readQueryVariable('password');

        // Event handlers for RFB
        function connectedToServer(e) {
            document.getElementById('noVNC_status').textContent = "Connected to " + desktopName;
	        attachKeepAlive(rfb);  // Add this line
        }

        function disconnectedFromServer(e) {
            if (e.detail.clean) {
                document.getElementById('noVNC_status').textContent = "Disconnected, retrying...";
                initDC();
            } else {
                document.getElementById('noVNC_status').textContent = "Something went wrong, connection is closed, retrying...";
                initDC();
            }
        }

        function credentialsAreRequired(e) {
            const password = prompt("Password required:");
            rfb.sendCredentials({ password: password });
        }

        function updateDesktopName(e) {
            desktopName = e.detail.name;
        }

	function attachKeepAlive(rfbInstance, intervalMs = 5000) {
    let timerId;

    function sendKeepAlive() {
        try {
            rfbInstance.sendKey(F23, true);   // press
            rfbInstance.sendKey(F23, false);  // release
            console.info("[KeepAlive] Sent F23 press/release");
        } catch (err) {
            console.error("[KeepAlive] Error sending keep-alive:", err);
        }
    }

    function start() {
        stop();
        timerId = setInterval(sendKeepAlive, intervalMs);
        console.log(`[KeepAlive] Started with interval ${intervalMs}ms`);
    }

    function stop() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            console.log("[KeepAlive] Stopped");
        }
    }

    rfbInstance.addEventListener("disconnect", stop);
    start();
    return { stop };
}

// Separate function to initialize the UI with the existing RFB connection
window.initializeUIWithExistingRFB = () => {
    // Import the UI module and initialize it with our existing RFB connection
    import('./app/ui.js').then(UI => {
        console.log('UI module loaded');

        // Start the UI with settings that prevent autoconnection
        UI.default.start(
        ).then(() => {
            console.log('UI started');
	    window.UI = UI;
	    //UI.rfb = rfb;

            // Set the RFB object to our existing connection
            UI.default.rfb = window.rfb;

            // Manually set up the event listeners that would normally be set in connect()
            UI.default.rfb.addEventListener("connect", UI.default.connectFinished);
            UI.default.rfb.addEventListener("disconnect", UI.default.disconnectFinished);
            UI.default.rfb.addEventListener("serververification", UI.default.serverVerify);
            UI.default.rfb.addEventListener("credentialsrequired", UI.default.credentials);
            UI.default.rfb.addEventListener("securityfailure", UI.default.securityFailed);
            UI.default.rfb.addEventListener("clippingviewport", UI.default.updateViewDrag);
            UI.default.rfb.addEventListener("capabilities", UI.default.updatePowerButton);
            UI.default.rfb.addEventListener("clipboard", UI.default.clipboardReceive);
            UI.default.rfb.addEventListener("bell", UI.default.bell);
            UI.default.rfb.addEventListener("desktopname", UI.default.updateDesktopName);

            // Set the UI state to connected
            UI.default.connected = true;
            UI.default.inhibitReconnect = false;
            //UI.default.updateVisualState('connected');
	    // Patch the focus method to prevent errors
if (window.UI && window.UI.default && window.UI.default.rfb) {
    const originalCloseControlbar = UI.default.closeControlbar;
    UI.default.closeControlbar = function() {
        // Don't try to focus until we're sure the RFB object is ready
        if (this.rfb && typeof this.rfb.focus === 'function') {
            this.rfb.focus();
        }
        // Call the original closeControlbar without the focus call
        //originalCloseControlbar.call(this);
    };
    console.log('Focus method patched');
}
            UI.default.updateVisualState('connected');
	    window.setTimeout(() => {console.log("Trying to update the view..."); window.UI.default.connected = true; window.UI.default.rfb = window.rfb; window.UI.default.updateVisualState("connected")}, 1500);

            // Update the UI elements
            //UI.default.updatePowerButton();
            //UI.default.updateViewOnly();

            console.log('UI initialized with existing RFB connection');
	    //UI.rfb = rfb;

        }).catch(err => {
            console.error('Error initializing UI:', err);
        });
    }).catch(err => {
        console.error('Error loading UI module:', err);
    });
}

// Modified Link() function
        // Function to create the RFB connection when the data channel is ready
	// Replace the entire window.Link function with this:
window.Link = function() {
    // First, remove the "noVNC_loading" class to stop the loading indicator
    document.documentElement.classList.remove('noVNC_loading');

    // Hide the connect dialog
    document.getElementById('noVNC_connect_dlg').style.display = 'none';

    try {
        // Creating a new RFB object will start a new connection
        rfb = new RFB(document.getElementById('noVNC_container'), vncDC,
                     { credentials: { password: password } });

        window.rfb=rfb;
        // Add listeners to important events from the RFB module
        rfb.addEventListener("connect", connectedToServer);
        rfb.addEventListener("disconnect", disconnectedFromServer);
        rfb.addEventListener("credentialsrequired", credentialsAreRequired);
        rfb.addEventListener("desktopname", updateDesktopName);

        // Set parameters that can be changed on an active connection
        rfb.viewOnly = readQueryVariable('view_only', false);
        rfb.scaleViewport = readQueryVariable('scale', false);

        // Initialize the UI with our existing RFB connection, but don't wait for it
        setTimeout(initializeUIWithExistingRFB, 500);

        // Initialize UI controls without trying to instantiate UI
    } catch (error) {
        console.error("Error initializing RFB connection:", error);
        document.getElementById('noVNC_status').textContent = "Error: " + error.message;
    }
};
        // Initialize the data channel to start the WebRTC connection
        initDC();
    

