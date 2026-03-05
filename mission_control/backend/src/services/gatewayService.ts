import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "";
const GATEWAY_TOKEN = process.env.OPENCLAW_TOKEN || "";

const AGENT_SESSION_MAP: Record<string, string> = {
    main: "agent:main:main",
    jarvis: "agent:jarvis:main",
    loki: "agent:loki:main",
    fury: "agent:fury:main",
    echo: "agent:echo:main",
    shuri: "agent:shuri:main",
    oracle: "agent:oracle:main",
    pulse: "agent:pulse:main",
    atlas: "agent:atlas:main",
    vision: "agent:vision:main",
};

const SESSION_AGENT_MAP: Record<string, string> = Object.fromEntries(
    Object.entries(AGENT_SESSION_MAP).map(([k, v]) => [v, k])
);

type ReplyCallback = (agentId: string, runId: string, content: string) => void;

export class GatewayService {
    private static instance: GatewayService;
    private ws: WebSocket | null = null;
    private connected = false;
    private pendingRequests = new Map<string, { resolve: Function; reject: Function }>();
    private replyCallbacks: ReplyCallback[] = [];
    private reconnectTimer: NodeJS.Timeout | null = null;

    private constructor() { }

    public static getInstance(): GatewayService {
        if (!GatewayService.instance) {
            GatewayService.instance = new GatewayService();
        }
        return GatewayService.instance;
    }

    public onAgentReply(cb: ReplyCallback) {
        this.replyCallbacks.push(cb);
    }

    private notifyReply(agentId: string, runId: string, content: string) {
        this.replyCallbacks.forEach(cb => {
            try { cb(agentId, runId, content); } catch (e) { }
        });
    }

    public async connect(): Promise<void> {
        if (this.connected && this.ws?.readyState === WebSocket.OPEN) return;

        return new Promise((resolve, reject) => {
            if (!GATEWAY_URL) return reject(new Error("OPENCLAW_GATEWAY_URL not configured"));

            console.log(`📌 Connecting to OpenClaw Gateway: ${GATEWAY_URL}`);
            this.ws = new WebSocket(GATEWAY_URL, {
                headers: { Authorization: `Bearer ${GATEWAY_TOKEN}` }
            });

            const timeout = setTimeout(() => {
                this.ws?.terminate();
                reject(new Error("Gateway connection timeout"));
            }, 15000);

            this.ws.on("open", () => {
                console.log("📡 WebSocket open, waiting for challenge...");
            });

            this.ws.on("error", (err) => {
                console.error("❌ WebSocket Error:", err.message);
                this.connected = false;
                clearTimeout(timeout);
                reject(err);
            });

            this.ws.on("close", () => {
                console.log("📌 WebSocket closed, reconnecting in 5s...");
                this.connected = false;
                this.ws = null;
                this.reconnectTimer = setTimeout(() => this.connect().catch(() => { }), 5000);
            });

            this.ws.on("message", (data) => {
                try {
                    const msg = JSON.parse(data.toString());

                    // Auth challenge
                    if (msg.type === "event" && msg.event === "connect.challenge") {
                        console.log("⚖️ Challenge received, authenticating...");
                        this.ws!.send(JSON.stringify({
                            type: "req", id: "cli", method: "connect",
                            params: {
                                minProtocol: 3, maxProtocol: 3,
                                role: "operator",
                                scopes: ["operator.read", "operator.write", "operator.admin"],
                                auth: { token: GATEWAY_TOKEN },
                                client: { id: "cli", version: "1.0.0", platform: "node", mode: "cli" }
                            }
                        }));
                    }

                    // Connected
                    if (msg.type === "event" && msg.event === "health") {
                        console.log("✅ Gateway Connected! Agents online:", msg.payload?.agents?.length || 0);
                        this.connected = true;
                        clearTimeout(timeout);
                        resolve();
                    }

                    // Auth failed
                    if (msg.type === "res" && msg.ok === false && !this.connected) {
                        console.error("❌ Gateway Auth Failed:", msg.error?.message);
                        clearTimeout(timeout);
                        reject(new Error(msg.error?.message || "Auth failed"));
                    }

                    // ✅ AGENT REPLY - chat event final state
                    if (msg.type === "event" && msg.event === "chat") {
                        const payload = msg.payload || {};
                        if (payload.state === "final") {
                            const sessionKey = payload.sessionKey || "";
                            const agentId = SESSION_AGENT_MAP[sessionKey] || sessionKey;
                            const runId = payload.runId || "";
                            const content = payload.message?.content?.[0]?.text || "";
                            if (content && agentId) {
                                console.log(`💬 Agent reply: ${agentId} → "${content.slice(0, 80)}"`);
                                this.notifyReply(agentId, runId, content);
                            }
                        }
                    }

                    // Route RPC responses
                    if (msg.type === "res" && msg.id && this.pendingRequests.has(msg.id)) {
                        const { resolve: res, reject: rej } = this.pendingRequests.get(msg.id)!;
                        this.pendingRequests.delete(msg.id);
                        if (msg.ok) res(msg.payload || msg.result);
                        else rej(new Error(msg.error?.message || "RPC failed"));
                    }

                } catch (e) { }
            });
        });
    }

    public async call(method: string, params: any = {}): Promise<any> {
        await this.connect();
        const requestId = uuidv4();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new Error(`Timeout: ${method}`));
            }, 60000);

            this.pendingRequests.set(requestId, {
                resolve: (val: any) => { clearTimeout(timeout); resolve(val); },
                reject: (err: any) => { clearTimeout(timeout); reject(err); }
            });

            this.ws!.send(JSON.stringify({ type: "req", id: requestId, method, params }));
        });
    }

    public async triggerAgent(agentName: string, command: string, userId?: string): Promise<any> {
        const sessionKey = AGENT_SESSION_MAP[agentName.toLowerCase()] || `agent:${agentName}:main`;
        console.log(`🤖 Triggering: ${agentName} | session: ${sessionKey}`);
        return this.call("chat.send", {
            sessionKey,
            message: command,
            idempotencyKey: uuidv4()
        });
    }

    public getAgentSessionKey(agentName: string): string {
        return AGENT_SESSION_MAP[agentName.toLowerCase()] || `agent:${agentName}:main`;
    }
}
