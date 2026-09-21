# 🎙️ Local Network Live Interpretation System

A zero-internet, local-network real-time audio and background music interpretation system built with Node.js, Express, Socket.io, and WebRTC. Designed specifically for cross-region meetings, international conferences, and events without reliable internet access.

---

## 📺 Video Demo & Tutorial
Watch the complete system walkthrough and operation guide on YouTube:
[![WebRTC Live Interpretation System User Guide](https://img.youtube.com/vi/aTFk9WxoXNI/0.jpg)](https://www.youtube.com/watch?v=aTFk9WxoXNI)
👉 **[Watch the full demo video on YouTube](https://www.youtube.com/watch?v=aTFk9WxoXNI)**

---

## 🚀 Quick Start for Colleagues (One-Click Deployment)

Make sure your computer has **Node.js** installed first. You do **not** need to manually install dependencies or generate SSL certificates; the startup scripts will handle everything automatically on the first run!

### 💻 For Windows Users:
1. Download or clone this repository to your local computer.
2. Double-click **`start_server.bat`**.
3. The script will automatically:
   - Check and install missing dependencies (`npm install`).
   - Download and configure `mkcert` for local HTTPS.
   - Generate secure local SSL certificates (`key.pem` & `cert.pem`).
   - Launch the server and open the **Monitor Dashboard** in your default browser.

### 🍏 For Mac Users:
1. Download or clone this repository to your local computer.
2. Double-click **`start_server.command`**. *(Note: If Mac blocks it, right-click the file -> "Open" -> confirm "Open").*
3. The script will automatically:
   - Check and install dependencies (`npm install`).
   - Check and configure `mkcert` (via Homebrew if needed).
   - Generate secure local SSL certificates.
   - Launch the server and open the **Monitor Dashboard**.

---

## 🎵 Background Music (`music` Folder)
* **How it works**: The system automatically reads audio files from the `music/` directory.
* **Preloaded Tracks**: This repository includes default custom preloaded MP3 tracks for testing and channel checks:
  * `cantonese.mp3`
  * `english.mp3`
  * `mandarin.mp3`
* **API Integration**: The Admin panel automatically fetches and lists all available MP3 files via an API endpoint (`/api/music-list`), allowing the operator to control and sync background tracks seamlessly during the session.

---

## 🖥️ Detailed Guide for the Three HTML Interfaces

Once the server is running, three distinct web pages power the system. Each serves a specific role:

### 📊 1. System Monitor Dashboard (`monitor.html`)
* **URL**: `https://localhost:3000/monitor.html` (Typically opens automatically on the host machine).
* **Purpose**: The central command center for the event operator or technician.
* **Key Features**:
  * **3-Column Layout**: Left side displays the Listener QR code, center shows the quick URL box, and the right side displays the Admin QR code for fast on-site scanning.
  * **Real-time Statistics**: Tracks active broadcast channels and live listener counts per language.
  * **BGM & Audio Monitoring**: Displays currently playing background music titles and audio status.

### 🔐 2. Admin Console (`admin.html`)
* **URL**: Scanned from the Monitor page or accessed via `https://<YOUR-IP>:3000/admin.html`
* **Purpose**: Used by live interpreters or event hosts to broadcast audio.
* **Key Features**:
  * **Language Selection**: Supports pre-filled or custom language/dialect labels (covering Asia-Pacific, European, and Middle Eastern locales).
  * **Microphone Control**: Broadcasts high-quality live audio securely via WebRTC.
  * **Music Management**: Selects and triggers background music tracks from the `music/` folder.

### 🎧 3. Listener Interface (`index.html`)
* **URL**: Scanned by attendees using the Listener QR code (`https://<YOUR-IP>:3000`)
* **Purpose**: Used by audience members or participants on their smartphones.
* **Key Features**:
  * **Multi-language Channel Selection**: Listeners can pick their preferred language channel instantly.
  * **Low-Latency Audio**: Receives crystal-clear real-time interpretation audio.
  * **Connection Drop Warning**: Features an instant alert banner if a mobile device drops connection (e.g., triggered by phone network switches), ensuring users immediately know if a channel goes silent.

---

## 📁 Repository Structure
```text
├── admin.html           # Interpreter / Host broadcasting console
├── index.html           # Mobile listener interface
├── monitor.html         # Central technician dashboard (3-column layout)
├── music/               # Preloaded background & test music folder
│   ├── arabic.mp3       # Arabic preloaded track
│   ├── burmese.mp3      # Burmese preloaded track
│   ├── cantonese.mp3    # Cantonese preloaded track
│   ├── english.mp3      # English preloaded track
│   ├── filipino.mp3     # Filipino preloaded track
│   ├── french.mp3       # french preloaded track
│   ├── german.mp3       # German preloaded track
│   ├── hindi.mp3        # Hindi preloaded track
│   ├── indonesia.mp3    # Indonesia preloaded track
│   ├── italian.mp3      # Italian preloaded track
│   ├── japanese.mp3     # Japanese preloaded track
│   ├── khmer.mp3        # Khmer preloaded track
│   ├── korean.mp3       # Korean preloaded track
│   ├── malay.mp3        # Malay preloaded track
│   ├── mandarin.mp3     # Mandarin preloaded track
│   ├── polish           # Polish preloaded track
│   ├── portuguese.mp3   # Portuguese preloaded track
│   ├── russian.mp3      # Russian preloaded track
│   ├── spanish.mp3      # Spanish preloaded track
│   ├── thai.mp3         # Thai preloaded track
│   ├── turkish.mp3      # Turkish preloaded track
│   ├── ukrainian.mp3    # Ukrainian preloaded track
│   └── vietnamese.mp3   # Vietnamese preloaded track
├── qrcode.min.js        # Offline QR Code generator library
├── server.js            # Node.js backend & WebRTC signaling server
├── package.json         # Project metadata & dependencies
├── package-lock.json    # Locked dependency versions
├── start_server.bat     # Windows one-click auto-setup script
└── start_server.command # Mac one-click auto-setup script
