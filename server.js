const fs = require('fs');
const https = require('https');
const express = require('express');
const socketIO = require('socket.io');
const os = require('os');
const path = require('path'); // 引入路徑工具

const app = express();

/**
 * 跨平台路徑優化
 * 使用 path.join(__dirname, ...) 確保在 Windows (\) 與 Mac (/) 下都能正確讀取憑證
 */
const keyPath = path.join(__dirname, 'key.pem');
const certPath = path.join(__dirname, 'cert.pem');

const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
};

// --- [新增] 音樂資料夾路徑與自動建立 ---
const musicDir = path.join(__dirname, 'music');
if (!fs.existsSync(musicDir)) {
    fs.mkdirSync(musicDir);
    console.log(`[System] Created music directory: ${musicDir}`);
}

// 設置靜態檔案目錄（絕對路徑）
app.use(express.static(path.join(__dirname)));

// --- [新增] 靜態公開音樂資料夾與獲取清單 API ---
app.use('/music', express.static(musicDir));

app.get('/api/music-list', (req, res) => {
    fs.readdir(musicDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "無法讀取音樂目錄" });
        }
        // 只過濾出 .mp3 檔案
        const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));
        res.json(mp3Files);
    });
});

const server = https.createServer(options, app);
const io = socketIO(server);

let activeChannels = {}; // 格式: { "LanguageName": "socketId" }
let langStats = {};      // 格式: { "LanguageName": count }
let bgmStatuses = {};    // 支援檔名：{ "LanguageName": { isPlaying: boolean, fileName: string } }

// --- 獲取區域網路 IP 的函數 ---
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            // 過濾 IPv4, 非迴路(localhost), 且不是內部虛擬機 IP
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return 'localhost';
}

const LAN_IP = getLocalIP();
const PORT = 3000;

io.on('connection', (socket) => {
    let myJoinedLang = null;

    console.log(`[System] New connection: ${socket.id}`);

    // 發送伺服器資訊給 Monitor (用於生成 QR Code)
    socket.emit('server-info', {
        ip: LAN_IP,
        indexUrl: `https://${LAN_IP}:${PORT}`,
        adminUrl: `https://${LAN_IP}:${PORT}/admin.html`
    });

    // --- Admin 開始廣播 ---
    socket.on('admin-start', (langName) => {
        if (activeChannels[langName] && activeChannels[langName] !== socket.id) {
            console.log(`[Warning] Blocked duplicate channel: ${langName}`);
            socket.emit('error-msg', `Channel "${langName}" already exists.`);
            return;
        }

        activeChannels[langName] = socket.id;
        if (langStats[langName] === undefined) langStats[langName] = 0;
        
        // 初始化 BGM 狀態物件
        if (bgmStatuses[langName] === undefined) {
            bgmStatuses[langName] = { isPlaying: false, fileName: "" };
        }
        
        socket.join(`room-${langName}`);
        
        // 全域廣播頻道更新
        io.emit('update-channels', Object.keys(activeChannels));
        
        // 更新 Monitor 資訊，包含統計與 BGM 狀態
        io.emit('update-stats', { 
            channels: Object.keys(activeChannels), 
            stats: langStats,
            bgms: bgmStatuses 
        });
        console.log(`[Broadcast] Live: ${langName}`);
    });

    // --- 同步音量 (由 Admin 發出，Monitor 接收) ---
    socket.on('audio-sync', (data) => {
        // data 格式: { lang: 'xxx', vol: 0-100 }
        socket.to(`room-${data.lang}`).emit('monitor-audio-update', data);
        io.emit('monitor-vol-display', data); 
    });

    // --- 同步 BGM 狀態 (支援檔案名稱傳遞) ---
    socket.on('bgm-sync', (data) => {
        // 預期 data 格式: { lang: 'Chinese', isPlaying: true, fileName: 'music.mp3' }
        bgmStatuses[data.lang] = {
            isPlaying: data.isPlaying,
            fileName: data.isPlaying ? (data.fileName || "Unknown Title") : ""
        };

        // 通知聽眾 (用於手機 UI 顯示圖標)
        socket.to(`room-${data.lang}`).emit('monitor-bgm-update', bgmStatuses[data.lang]);
        
        // 通知 Monitor (用於顯示檔名與動畫圖標)
        io.emit('monitor-bgm-display', {
            lang: data.lang,
            isPlaying: data.isPlaying,
            fileName: bgmStatuses[data.lang].fileName
        }); 
    });

    // --- 聽眾加入頻道 ---
    socket.on('join-lang', (langName) => {
        // 如果原本已在別的頻道，先減去舊統計
        if (myJoinedLang && langStats[myJoinedLang]) {
            langStats[myJoinedLang]--;
        }
        
        myJoinedLang = langName;
        socket.join(`room-${langName}`);
        
        if (langStats[langName] === undefined) langStats[langName] = 0;
        langStats[langName]++;

        // 告知 Admin 有新聽眾 (用於 WebRTC P2P 連線)
        const adminId = activeChannels[langName];
        if (adminId) io.to(adminId).emit('new-listener', socket.id);

        // 同步最新統計給所有 Monitor
        io.emit('update-stats', { 
            channels: Object.keys(activeChannels), 
            stats: langStats,
            bgms: bgmStatuses 
        });
        
        // 即時回傳目前的 BGM 狀態給該位聽眾
        socket.emit('monitor-bgm-update', bgmStatuses[langName] || { isPlaying: false, fileName: "" });
        
        console.log(`[User] Joined: ${langName}, Count: ${langStats[langName]}`);
    });

    // --- 聽眾主動離開 ---
    socket.on('leave-lang', (langName) => {
        if (myJoinedLang === langName) {
            if (langStats[langName] > 0) langStats[langName]--;
            myJoinedLang = null;
            socket.leave(`room-${langName}`);
            io.emit('update-stats', { 
                channels: Object.keys(activeChannels), 
                stats: langStats, 
                bgms: bgmStatuses
            });
        }
    });

    // --- 基礎資料請求 ---
    socket.on('get-channels', () => {
        socket.emit('update-channels', Object.keys(activeChannels));
    });

    socket.on('get-stats', () => {
        socket.emit('update-stats', { 
            channels: Object.keys(activeChannels), 
            stats: langStats,
            bgms: bgmStatuses 
        });
    });

    // --- 停止廣播邏輯 ---
    const stopBroadcasting = () => {
        for (let lang in activeChannels) {
            if (activeChannels[lang] === socket.id) {
                delete activeChannels[lang];
                delete bgmStatuses[lang]; 
                langStats[lang] = 0; 
                
                io.to(`room-${lang}`).emit('broadcast-stopped', lang);
                io.emit('update-channels', Object.keys(activeChannels));
                io.emit('update-stats', { 
                    channels: Object.keys(activeChannels), 
                    stats: langStats, 
                    bgms: bgmStatuses
                });
                
                console.log(`[Broadcast] Stopped: ${lang}`);
            }
        }
    };

    socket.on('admin-stop', stopBroadcasting);

    // 斷線處理
    socket.on('disconnect', () => {
        stopBroadcasting(); // 如果是 Admin 斷開
        
        if (myJoinedLang && langStats[myJoinedLang]) {
            langStats[myJoinedLang]--;
            io.emit('update-stats', { 
                channels: Object.keys(activeChannels), 
                stats: langStats, 
                bgms: bgmStatuses
            });
        }
        console.log(`[System] Disconnected: ${socket.id}`);
    });

    // WebRTC 信令中轉
    socket.on('message', (data) => {
        if (data.to) {
            io.to(data.to).emit('message', { ...data, from: socket.id });
        }
    });
});

// 啟動伺服器
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=========================================`);
    console.log(`🚀 Live Interpretation Server is Running`);
    console.log(`📡 LAN IP: ${LAN_IP}`);
    console.log(`🔗 Index: https://${LAN_IP}:${PORT}`);
    console.log(`🛠  Admin: https://${LAN_IP}:${PORT}/admin.html`);
    console.log(`=========================================\n`);
});