import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { GatewayService } from "../services/gatewayService.js";
import { logActivity } from "./activityController.js";
import { convex, convexApi } from "../lib/convexClient.js";

const gatewayService = GatewayService.getInstance();

// Register listener — saves agent replies to Convex
gatewayService.onAgentReply(async (agentId, runId, content) => {
    try {
        await convex.mutation(convexApi.chat.updateByRunId, { runId, content });
        console.log(`💾 Agent reply saved: ${agentId} → "${content.slice(0, 60)}..."`);
    } catch (e: any) {
        console.error("❌ Failed to save agent reply:", e.message);
    }
});

export const sendMessage = async (req: Request, res: Response) => {
    const { agentId, message } = req.body;
    const userId = (req as any).user?.id || "local-user";

    if (!agentId || !message) {
        return res.status(400).json({ success: false, error: "agentId and message are required" });
    }

    try {
        // Save user message to Convex
        await convex.mutation(convexApi.chat.create, {
            agentId,
            userId,
            role: "user",
            content: message,
        });

        logActivity(userId, agentId, "chat_user", message);

        // Send to OpenClaw
        console.log(`📡 Sending to agent: ${agentId}`);
        const result = await gatewayService.triggerAgent(agentId, message, userId);
        const runId = result?.runId || uuidv4();

        // Save placeholder — will be updated when agent replies
        await convex.mutation(convexApi.chat.create, {
            agentId,
            userId,
            role: "agent",
            content: "⏳ Thinking...",
            runId,
        });

        logActivity(userId, agentId, "chat_agent", `Sent to OpenClaw (runId: ${runId})`);
        res.json({ success: true, payload: { runId, status: "sent" } });

    } catch (error: any) {
        console.error(`❌ Chat failed for ${agentId}:`, error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getHistory = async (req: Request, res: Response) => {
    const { agentId } = req.query;
    const userId = (req as any).user?.id || "local-user";

    if (!agentId) {
        return res.status(400).json({ success: false, error: "agentId is required" });
    }

    try {
        const messages = await convex.query(convexApi.chat.list, {
            agentId: String(agentId),
            userId,
        });
        res.json({ success: true, history: messages });
    } catch (error: any) {
        res.json({ success: true, history: [] });
    }
};

export const updateReply = async (req: Request, res: Response) => {
    const { runId, content } = req.body;

    if (!runId || !content) {
        return res.status(400).json({ success: false, error: "runId and content required" });
    }

    try {
        await convex.mutation(convexApi.chat.updateByRunId, { runId, content });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
};
