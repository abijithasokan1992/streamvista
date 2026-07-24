@echo off
set "JAVA_HOME=%~dp0jdk21\jdk-21.0.2"
set "PATH=%JAVA_HOME%\bin;%PATH%"
npx firebase emulators:start --only auth,firestore,storage
