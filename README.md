# 🎙️ Local Network Live Interpretation System

A zero-internet, local-network real-time audio interpretation system built with Node.js, Express, Socket.io, and WebRTC. Designed for cross-region meetings and events.

---

## 🚀 Quick Start for Colleagues (One-Click Deployment)

Make sure your computer has **Node.js** installed first. You do **not** need to manually install dependencies or generate SSL certificates; the startup scripts will handle everything automatically on the first run!

### 💻 For Windows Users:
1. Download or clone this repository to your local computer.
2. Double-click **`start_server.bat`**.
3. The script will automatically:
   - Install missing dependencies (`npm install`).
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

## 📱 On-Site Access URLs
Once the server is running, the terminal will display your local IP and QR codes will appear on the **Monitor Dashboard (`/monitor.html`)**:
* **Listener Interface**: Scan the listener QR code or visit `https://<YOUR-IP>:3000`
* **Admin Console**: Scan the admin QR code or visit `https://<YOUR-IP>:3000/admin.html`
* **System Monitor**: Visit `https://localhost:3000/monitor.html`
