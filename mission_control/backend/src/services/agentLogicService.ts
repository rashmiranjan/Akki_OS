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

    public async runScribe(userId: string): Promise<any> {
        console.log(`🎬 [Scribe] Preparing content sprint for user ${userId}...`);
        const payload = {
            agentId: 'scribe',
            action: 'content_sprint',
            params: { formats: ['linkedin', 'twitter'], user_id: userId }
        };
        return this.gatewayService.triggerAgent('scribe', JSON.stringify(payload), userId);
    }

    public async runArchivist(userId: string): Promise<any> {
        console.log(`📚 [Archivist] Starting contextual research for user ${userId}...`);
        const payload = {
            agentId: 'archivist',
            action: 'deep_scan',
            params: { sources: ['reddit', 'linkedin', 'indiehackers'], depth: 'high', user_id: userId }
        };
        return this.gatewayService.triggerAgent('archivist', JSON.stringify(payload), userId);
    }

    public async runAtlasOnboarding(userId: string, context: any): Promise<any> {
        console.log(`🤖 [Atlas] Initializing memory for new user ${userId}...`);
        // Save to permanent memory (Convex)
        try {
            await this.memoryService.saveOnboardingMemory(userId, context);
            await logActivity(userId, 'atlas', 'onboarding', `Onboarding complete for user ${userId}`);
            console.log(`💾 [Atlas] Memory saved for user ${userId}`);
        } catch (e: any) {
            console.error(`⚠️ [Atlas] Memory save failed:`, e.message);
        }
        return this.runArchivist(userId);
    }
}
