@echo off
echo Starting Firebase Emulator...
set JAVA_HOME=%CD%\jdk-21.0.6+7
set PATH=%JAVA_HOME%\bin;%PATH%
npm run emulator
