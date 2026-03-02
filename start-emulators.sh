#!/bin/bash

# Firebase Emulator Startup Script
# Uses local Java 21 and cached emulator files

echo "🔧 Setting up environment..."

# Set Java 21 from local directory
export JAVA_HOME="$(pwd)/jdk-21.0.6+7"
export PATH="$JAVA_HOME/bin:$PATH"

echo "✅ Using Java: $(java -version 2>&1 | head -1)"

# Set Firebase cache to use local directory
export FIREBASE_EMULATORS_PATH="$(pwd)/.firebase-cache"

echo "🚀 Starting Firebase Emulators..."
echo ""

# Start emulators
firebase emulators:start --project demo-misrak-shemeta

