const http = require('http');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'activity.jsonl');
const PORT = 3003;

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200); res.end(); return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const entry = { ...data, receivedAt: new Date().toISOString() };
                fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
                console.log('📨 Received:', JSON.stringify(entry));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(400); res.end('Bad Request');
            }
        });
        return;
    }

    if (req.method === 'GET' && req.url === '/activity') {
        try {
            const lines = fs.existsSync(LOG_FILE)
                ? fs.readFileSync(LOG_FILE, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse)
                : [];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: lines.slice(-50).reverse() }));
        } catch (e) {
            res.writeHead(500); res.end('Error');
        }
        return;
    }

    res.writeHead(200); res.end('OK');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Webhook Server running on port ${PORT}`);
    console.log(`📋 Activity log: ${LOG_FILE}`);
});
