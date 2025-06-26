## What is this for? 
To run your desktop apps through the browser. Securely, in a Kiosk mode. It is useful for:
 - demos  
 - control interfaces  
 - transient terminals  
 - emergency/backup access to an app  
 - remote access in general  

## What is this?
This is a program that is terse and can be used to automatically setup and teardown and manage X11 and sway (Wayland) sessions through noVNC. This, in effect, allows you to run specific comamnds and display them in your browser. 
In the `uds` branch, there is a config file for `ctwm` that disables all menus and gives typical Microsoft Windows (R)-like behaviour.   
The -rtc branches add WebRTC and screen recording. 

Environment variables:  
```
export RESOLUTION_WIDTH=1024
export RESOLUTION_HEIGHT=768
export DEFAULT_PROGRAM_NAME=xeyes
#export WEBSOCKIFY=websockify-rs (Apache/MIT like licensed over websockify's LGPL)
#BASE_PATH for reverse subdirectory proxies
export BASE_PATH="/"
export RECORD_SCREEN=false #Needs duplicator executable, dumps RFB session TCP streams to file in a directory. Useful for audits. c2x: client to server, s2c: server to client 
#To use TURN (never sent to the client, the server uses it for itself) 
export ANSWERER_TURN_USERNAME=xxxx 
export ANSWERER_TURN_CREDENTIAL=xxxx 
export ANSWERER_TURN_SERVER=turn:xxxx.xxxx.com 
```

## Usage 
```
?WebRTC=true <== ENABLE WEBRTC, otherwise use WebSockets 
```
##### Sway 
Ctrl+Drag to move windows 
Usually does not render text (should not have any text rendering dependencies) 

##### WebRTC 
For using it, you have to also have t-a-c executable in PATH (can be found in the uv section of the fossil repo) 

##### Recordings 
They are dumped to a directory, c2s -> client-to-server, s2c -> server-to-client 
You need to have the `duplicator` executable in PATH. 

## Requiremets
#### For all  
`websockify` or `websockify-rs`  
`x11-apps` (for default apps)  
`x11-utils` (for default apps)  

##### X11
`tigervnc-server`  
`ctwm` (recommended)  

##### Wayland
`sway`  
`wayvnc`  

### TLS/SSL
Ideally usable from an Apache Web Server reverse HTTPS proxy.

### Things that have been tested 
 - `xeyes` (and others)  
 - `Mono`   
 - `dotnet`  
 - glxgears  
 - Some of the ABA games   

### Requirements
Please use the latest `websockify` if you want to use Unix sockets to the maximum. They are more secure on the local machine. The `uds` branch contains the code. To use Wayland, use the `sway` branch. OpenGL works now, Vulkan doesn't (by default, use the .icd for LLVMPipe if you want software rendering - but then you have to recompile - avoided due to platform differences). 
The `trunk` branch has the code for pure TCP. Use it if you don't have the latest `websockify`. Be mindful that anyone can connect from the local machine to any session if that's the case. 

### Running
`dotnet run` 

#### Original Fossil Repo(s) 
[this](https://vz.al/repos/fw/home)   
[unversioned binaries (uv)](https://vz.al/repos/fw/uv) 

###### Duplicator 
https://vz.al/repos/duplicator/home    
[unversioned binaries (uv)](https://vz.al/repos/duplicator/uv) 

###### WebRTC Forwarding Utilities 
https://vz.al/repos/webrtc-udp-tcp-forwarder/home    
[unversioned binaries (uv)](https://vz.al/repos/webrtc-udp-tcp-forwarder/uv) 

### License
Copyright (C) 2025 Rishikeshan Sulochana/Lavakumar 
License: Open Software License, Version 3.0 (no later versions)
