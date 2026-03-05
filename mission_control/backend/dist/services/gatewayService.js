"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayService = void 0;
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || '';
const GATEWAY_TOKEN = process.env.OPENCLAW_TOKEN || '';
class GatewayService {
    static instance;
    constructor() { }
    static getInstance() {
        if (!GatewayService.instance) {
            GatewayService.instance = new GatewayService();
        }
        return GatewayService.instance;
    }
    async connect() {
        return new Promise((resolve, reject) => {
            if (!GATEWAY_URL)
                return reject(new Error('OPENCLAW_GATEWAY_URL not configured'));
            console.log(`🔌 Initializing WebSocket connection to ${GATEWAY_URL}...`);
            const ws = new ws_1.WebSocket(GATEWAY_URL, {
                headers: {
                    'Authorization': `Bearer ${GATEWAY_TOKEN}`
                }
            });
            const timeout = setTimeout(() => {
                ws.terminate();
                reject(new Error('Gateway connection timeout (Handshake failed)'));
            }, 15000);
            ws.on('open', () => {
                console.log('📡 WebSocket open, waiting for challenge...');
            });
            ws.on('error', (err) => {
                console.error('❌ WebSocket Error:', err.message);
                clearTimeout(timeout);
                reject(err);
            });
            ws.on('message', (data) => {
                const messageStr = data.toString();
                try {
                    const message = JSON.parse(messageStr);
                    if (message.type === 'event' && message.event === 'connect.challenge') {
                        console.log('⚖️ Received challenge, sending connect request...');
                        ws.send(JSON.stringify({
                            type: 'req',
                            id: (0, uuid_1.v4)(),
                            method: 'connect',
                            params: {
                                minProtocol: 3,
                                maxProtocol: 3,
                                role: 'operator',
                                scopes: ['operator.read', 'operator.write', 'operator.admin'],
                                auth: { token: GATEWAY_TOKEN },
                                client: {
                                    id: 'cli',
                                    version: '1.0.0',
                                    platform: 'node',
                                    mode: 'cli'
                                }
                            }
                        }));
                    }
                    if (message.type === 'res' && message.ok === true && (message.method === 'connect' || message.payload?.type === 'hello-ok')) {
                        const payload = message.payload || message.result || {};
                        console.log('✅ Gateway Connection Finalized!');
                        console.log('📜 Granted Scopes:', JSON.stringify(payload.scopes || payload.policy?.scopes || 'none'));
                        console.log('🎭 Role:', payload.role || 'none');
                        clearTimeout(timeout);
                        resolve(ws);
                    }
                    if (message.type === 'res' && message.ok === false) {
                        console.error('❌ Gateway Error:', message.error?.message);
                        clearTimeout(timeout);
                        reject(new Error(message.error?.message || 'Unknown Gateway error'));
                    }
                }
                catch (e) { }
            });
        });
    }
    async call(method, params = {}) {
        const ws = await this.connect();
        const requestId = (0, uuid_1.v4)();
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                ws.close();
                reject(new Error(`Timeout calling method: ${method}`));
            }, 60000);
            ws.on('message', (data) => {
                try {
                    const response = JSON.parse(data.toString());
                    if (response.type === 'res' && response.id === requestId) {
                        console.log(`📥 RPC Response for ${method}:`, JSON.stringify(response));
                        const status = response.payload?.status || response.result?.status;
                        if (status === 'accepted') {
                            console.log(`⏳ Request accepted by ${method}, waiting for final response...`);
                            return;
                        }
                        clearTimeout(timeout);
                        ws.close();
                        if (response.ok) {
                            resolve(response.payload || response.result);
                        }
                        else {
                            reject(new Error(response.error?.message || 'Gateway RPC failed'));
                        }
                    }
                }
                catch (e) { }
            });
            ws.send(JSON.stringify({ type: 'req', id: requestId, method, params }));
        });
    }
    async triggerAgent(agentName, command, userId) {
        return this.call('chat.send', {
            sessionKey: userId || 'default',
            idempotencyKey: (0, uuid_1.v4)(),
            message: `@${agentName} ${command}`
        });
    }
}
exports.GatewayService = GatewayService;
