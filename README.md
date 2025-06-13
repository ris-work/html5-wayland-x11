## What is this?
This is a program that is terse and can be used to automatically setup and teardown and manage X11 sessions through noVNC. This, in effect, allows you to run specific comamnds and display them in your browser.  

### Requirements
Please use the latest `websockify` if you want to use Unix sockets to the maximum. They are more secure on the local machine. The `uds` branch contains the code. 
The `trunk` branch has the code for pure TCP. Use it if you don't have the latest `websockify`. Be mindful that anyone can connect from the local machine to any session if that's the case. 

### Running
`dotnet run` 

### License
Copyright (C) 2025 Rishikeshan Sulochana/Lavakumar 
License: Open Software License, Version 3.0 (no later versions)
