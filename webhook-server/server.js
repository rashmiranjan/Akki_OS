const http = require('http');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'activity.jsonl');
const PORT = 3003;
const CONVEX_URL = process.env.CONVEX_URL || '';
const CONVEX_SITE_URL = process.env.CONVEX_SITE_URL || '';

async function saveDraftToConvex(agent, content, platform) {
    try {
        const { ConvexHttpClient } = await import('convex/browser');
        const { makeFunctionReference } = await import('convex/server');
        
        // Load env
        const envFile = path.join(__dirname, '../mission_control/backend/.env.local');
        if (fs.existsSync(envFile)) {
            const envContent = fs.readFileSync(envFile, 'utf8');
            const match = envContent.match(/CONVEX_URL=(.+)/);
            if (match) process.env.CONVEX_URL = match[1].trim();
        }
        
        const client = new ConvexHttpClient(process.env.CONVEX_URL);
        const createDraft = makeFunctionReference('drafts:create');
        await client.mutation(createDraft, {
            userId: 'local-user',
            agent,
            content,
            platform: platform || 'linkedin',
            status: 'pending'
        });
        console.log(`✅ Draft saved to Convex: ${content.slice(0, 60)}...`);
    } catch (e) {
        console.error('❌ Convex save failed:', e.message);
    }
}

async function processPayload(data) {
    const { agent, action } = data;

    if (action === 'save_ideas' && Array.isArray(data.ideas)) {
        console.log(`📥 Oracle sent ${data.ideas.length} ideas`);
        for (const idea of data.ideas) {
            const content = `**${idea.title}**\n\nProblem: ${idea.problem}\nSolution: ${idea.solution}\nAudience: ${idea.audience}\n\nPriority: ${idea.priority}`;
            await saveDraftToConvex('oracle', content, 'linkedin');
        }
    }

    if (action === 'save_draft' && data.content) {
        await saveDraftToConvex(agent, data.content, data.platform || 'linkedin');
    }
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const entry = { ...data, receivedAt: new Date().toISOString() };
                fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
                console.log(`📨 Received from ${data.agent}: ${data.action}`);
                await processPayload(data);
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
        } catch (e) { res.writeHead(500); res.end('Error'); }
        return;
    }

    res.writeHead(200); res.end('Webhook OK');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Smart Webhook Server running on port ${PORT}`);
});
