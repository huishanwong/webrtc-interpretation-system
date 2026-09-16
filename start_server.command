#!/bin/bash

# 1. Locate to the script directory
cd "$(dirname "$0")"

# 2. Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Error: Node.js is not installed on this Mac."
    echo "Please download and install Node.js first from: https://nodejs.org"
    exit 1
fi

# 3. Check if node_modules exists, if not, auto-run npm install
if [ ! -d "node_modules" ]; then
    echo "⚙️ [Setup] 'node_modules' not found. Installing project dependencies (npm install)..."
    npm install
    echo "✅ Dependencies installed successfully!"
fi

# 4. Check and install mkcert via Homebrew if missing
if ! command -v mkcert &> /dev/null
then
    echo "⚙️ [Setup] 'mkcert' not found. Installing mkcert automatically..."
    if command -v brew &> /dev/null; then
        brew install mkcert nss > /dev/null 2>&1
    else
        echo "❌ Error: Homebrew is not installed on this Mac. Please install Homebrew first (https://brew.sh)"
        exit 1
    fi
fi

# 5. Ensure local CA is installed
mkcert -install > /dev/null 2>&1

# 6. Auto-detect Local IP (Prioritize Wi-Fi en0, fallback to en1)
IP_ADDR=$(ipconfig getifaddr en0)
if [ -z "$IP_ADDR" ]; then IP_ADDR=$(ipconfig getifaddr en1); fi
if [ -z "$IP_ADDR" ]; then IP_ADDR="127.0.0.1"; fi

clear
echo "==============================================="
echo "      Interpretation System | Mac Live Server    "
echo "==============================================="
echo ""
echo "[1/3] 📡 Detecting Network... Done! (IP: $IP_ADDR)"

# 7. Update Certificates (Fixed filenames: key.pem & cert.pem)
echo "[2/3] 🔐 Updating Certificates for $IP_ADDR..."
mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 "$IP_ADDR" > /dev/null 2>&1

# 8. Startup Information
echo "[3/3] 🚀 Launching Server..."
echo ""
echo "-----------------------------------------------"
echo "  📌 Listener:  https://$IP_ADDR:3000"
echo "  🔐 Admin:     https://$IP_ADDR:3000/admin.html"
echo "  📊 Monitor:   https://localhost:3000/monitor.html"
echo "-----------------------------------------------"
echo ""
echo "[Tip] Press Ctrl+C to stop the server."

# 9. Delay 2 seconds to open Monitor page (QR Code)
(sleep 2 && open "https://localhost:3000/monitor.html") &

# 10. Run Node.js
node server.js