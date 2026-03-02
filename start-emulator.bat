@echo off
echo Starting Firebase Emulators...
echo.

REM Set environment variables
set FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
set FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
set FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199

REM Start Firebase Emulators
firebase emulators:start --only firestore,auth,storage --project demo-misrak-shemeta

pause
