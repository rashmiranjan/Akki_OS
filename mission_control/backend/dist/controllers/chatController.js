"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.sendMessage = void 0;
const gatewayService_1 = require("../services/gatewayService");
const activityController_1 = require("./activityController");
const gatewayService = gatewayService_1.GatewayService.getInstance();
const sendMessage = async (req, res) => {
    const { agentId, message } = req.body;
    const userId = req.user?.id;
    if (!agentId || !message) {
        return res.status(400).json({ success: false, error: 'agentId and message are required' });
    }
    try {
        (0, activityController_1.logActivity)(userId, agentId, 'chat_user', message);
        let replyText = '';
        try {
            console.log(`📡 Sending chat request to Gateway for agent: ${agentId}`);
            const result = await gatewayService.call('agent', {
                agent: agentId,
                action: 'chat',
                params: {
                    message,
                    user_id: userId,
                    session_key: `akki_${agentId}_${userId}`
                }
            });
            replyText = result?.response || result?.text || result?.content ||
                result?.payload?.response || result?.payload?.text ||
                result?.result?.text || '';
            if (!replyText)
                throw new Error('Empty response content');
        }
        catch (err) {
            console.error(`Gateway chat failed for ${agentId}:`, err.message);
            replyText = `⚠️ Gateway Connection Failed: ${err.message}`;
        }
        (0, activityController_1.logActivity)(userId, agentId, 'chat_agent', replyText);
        res.json({ success: true, payload: { response: replyText } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.sendMessage = sendMessage;
const getHistory = async (req, res) => {
    const { agentId } = req.query;
    const userId = req.user?.id;
    if (!agentId) {
        return res.status(400).json({ success: false, error: 'agentId is required' });
    }
    try {
        const sessionKey = `akki_${agentId}_${userId}`;
        const gatewayHistory = await gatewayService.call('chat.history', {
            sessionKey,
            limit: 50
        });
        res.json({ success: true, history: gatewayHistory || [] });
    }
    catch (error) {
        res.json({ success: true, history: [] });
    }
};
exports.getHistory = getHistory;
