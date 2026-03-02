# Firebase Emulator Start Guide

## Issue

The Firebase emulator is having a permissions issue trying to create a cache directory at:
`C:\Users\Admin\.cache\firebase\emulators`

## Solution: Start Emulator Manually

### Option 1: Run as Administrator (Recommended)

1. **Open PowerShell as Administrator:**
   - Press `Win + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Navigate to your project:**
   ```powershell
   cd D:\misrak-shemeta-
   ```

3. **Start the emulator:**
   ```powershell
   firebase emulators:start --project demo-misrak-shemeta
   ```

### Option 2: Create Cache Directory Manually

1. **Open File Explorer as Administrator:**
   - Press `Win + R`
   - Type: `C:\Users\Admin`
   - Press Enter

2. **Create the directory:**
   - Right-click → New → Folder
   - Name it: `.cache`
   - Inside `.cache`, create folder: `firebase`
   - Inside `firebase`, create folder: `emulators`

3. **Then start emulator normally:**
   ```bash
   firebase emulators:start --project demo-misrak-shemeta
   ```

### Option 3: Use Existing Cache

The emulator JAR files are already downloaded in `.firebase-cache/`. Let's use those:

1. **Copy the JAR file:**
   ```powershell
   # Create directory (if it doesn't exist)
   New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.cache\firebase\emulators"
   
   # Copy JAR file
   Copy-Item ".firebase-cache\cloud-firestore-emulator-v1.20.2.jar" "$env:USERPROFILE\.cache\firebase\emulators\"
   ```

2. **Start emulator:**
   ```bash
   firebase emulators:start --project demo-misrak-shemeta
   ```

## What You Should See

When the emulator starts successfully, you'll see:

```
✔  All emulators ready! It is now safe to connect your app.
┌─────────────────────────────────────────────────────────────┐
│ ✔  All emulators ready! It is now safe to connect your app. │
│ i  View Emulator UI at http://127.0.0.1:4000                │
└─────────────────────────────────────────────────────────────┘

┌────────────┬────────────────┬─────────────────────────────────┐
│ Emulator   │ Host:Port      │ View in Emulator UI             │
├────────────┼────────────────┼─────────────────────────────────┤
│ Auth       │ 127.0.0.1:9099 │ http://127.0.0.1:4000/auth      │
├────────────┼────────────────┼─────────────────────────────────┤
│ Firestore  │ 127.0.0.1:8080 │ http://127.0.0.1:4000/firestore │
├────────────┼────────────────┼─────────────────────────────────┤
│ Storage    │ 127.0.0.1:9199 │ http://127.0.0.1:4000/storage   │
└────────────┴────────────────┴─────────────────────────────────┘
```

## After Emulator Starts

Once the emulator is running:

1. **Keep the emulator terminal open**
2. **Open a NEW terminal**
3. **Run the seed script:**
   ```bash
   npm run seed
   ```

This will populate the emulator with:
- 5 users (buyers, merchants, runners)
- 8 shops (4 in Harar, 4 in Dire Dawa)
- 72 products (9 per shop)
- Sample cart and order

## Troubleshooting

### "Port already in use"

If you see port errors, kill existing processes:

```powershell
# Kill process on port 8080 (Firestore)
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F

# Kill process on port 9099 (Auth)
netstat -ano | findstr :9099
taskkill /PID <PID_NUMBER> /F
```

### "Java not found"

Make sure Java is installed:
```bash
java -version
```

You should see Java 11 or higher.

### Still having issues?

Try restarting your computer and running PowerShell as Administrator.

## Quick Commands

```bash
# Start emulator
firebase emulators:start --project demo-misrak-shemeta

# Seed data (in NEW terminal)
npm run seed

# View Emulator UI
# Open: http://127.0.0.1:4000
```
