"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentLogicService = void 0;
const gatewayService_1 = require("./gatewayService");
const memoryService_1 = require("./memoryService");
const activityController_1 = require("../controllers/activityController");
class AgentLogicService {
    static instance;
    gatewayService;
    memoryService;
    constructor() {
        this.gatewayService = gatewayService_1.GatewayService.getInstance();
        this.memoryService = memoryService_1.MemoryService.getInstance();
    }
    static getInstance() {
        if (!AgentLogicService.instance) {
            AgentLogicService.instance = new AgentLogicService();
        }
        return AgentLogicService.instance;
    }
    async runLoki(userId) {
        console.log(`🎬 [Loki] Preparing context for user ${userId}...`);
        const LokiPayload = {
            agentId: 'loki',
            action: 'write_post',
            params: { platforms: ['linkedin', 'twitter'], user_id: userId }
        };
        return this.gatewayService.triggerAgent('loki', JSON.stringify(LokiPayload), userId);
    }
    async runFury(userId) {
        console.log(`🔍 [Fury] Starting contextual research for user ${userId}...`);
        const FuryPayload = {
            agentId: 'fury',
            action: 'deep_scan',
            params: { sources: ['reddit', 'linkedin', 'indiehackers'], depth: 'high', user_id: userId }
        };
        return this.gatewayService.triggerAgent('fury', JSON.stringify(FuryPayload), userId);
    }
    async runJarvisOnboarding(userId, context) {
        console.log(`🤖 [Jarvis] Initializing memory for new user ${userId}...`);
        // Save to permanent memory (Convex)
        try {
            await this.memoryService.saveOnboardingMemory(userId, context);
            await (0, activityController_1.logActivity)(userId, 'jarvis', 'onboarding', `Onboarding complete for user ${userId}`);
            console.log(`💾 [Jarvis] Memory saved for user ${userId}`);
        }
        catch (e) {
            console.error(`⚠️ [Jarvis] Memory save failed:`, e.message);
        }
        return this.runFury(userId);
    }
}
exports.AgentLogicService = AgentLogicService;
