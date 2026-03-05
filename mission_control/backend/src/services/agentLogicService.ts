import { GatewayService } from './gatewayService';
import { MemoryService } from './memoryService';
import { logActivity } from '../controllers/activityController';

export class AgentLogicService {
    private static instance: AgentLogicService;
    private gatewayService: GatewayService;
    private memoryService: MemoryService;

    private constructor() {
        this.gatewayService = GatewayService.getInstance();
        this.memoryService = MemoryService.getInstance();
    }

    public static getInstance(): AgentLogicService {
        if (!AgentLogicService.instance) {
            AgentLogicService.instance = new AgentLogicService();
        }
        return AgentLogicService.instance;
    }

    public async runLoki(userId: string): Promise<any> {
        console.log(`🎬 [Loki] Preparing context for user ${userId}...`);
        const LokiPayload = {
            agentId: 'loki',
            action: 'write_post',
            params: { platforms: ['linkedin', 'twitter'], user_id: userId }
        };
        return this.gatewayService.triggerAgent('loki', JSON.stringify(LokiPayload), userId);
    }

    public async runFury(userId: string): Promise<any> {
        console.log(`🔍 [Fury] Starting contextual research for user ${userId}...`);
        const FuryPayload = {
            agentId: 'fury',
            action: 'deep_scan',
            params: { sources: ['reddit', 'linkedin', 'indiehackers'], depth: 'high', user_id: userId }
        };
        return this.gatewayService.triggerAgent('fury', JSON.stringify(FuryPayload), userId);
    }

    public async runJarvisOnboarding(userId: string, context: any): Promise<any> {
        console.log(`🤖 [Jarvis] Initializing memory for new user ${userId}...`);
        // Save to permanent memory (Convex)
        try {
            await this.memoryService.saveOnboardingMemory(userId, context);
            await logActivity(userId, 'jarvis', 'onboarding', `Onboarding complete for user ${userId}`);
            console.log(`💾 [Jarvis] Memory saved for user ${userId}`);
        } catch (e: any) {
            console.error(`⚠️ [Jarvis] Memory save failed:`, e.message);
        }
        return this.runFury(userId);
    }
}
