import { convex, convexApi } from '../lib/convexClient';

export class MemoryService {
    private static instance: MemoryService;
    private constructor() { }

    public static getInstance(): MemoryService {
        if (!MemoryService.instance) MemoryService.instance = new MemoryService();
        return MemoryService.instance;
    }

    /** Fetch memory for user. Optionally filter by agent and/or type. */
    public async getMemory(userId: string, agent?: string, type?: string): Promise<any[]> {
        return convex.query(convexApi.memory.list, { userId, agent, type });
    }

    /** Upsert a memory record (insert or update by agent+type). */
    public async upsertMemory(userId: string, agent: string, type: string, data: any): Promise<any> {
        return convex.mutation(convexApi.memory.upsert, { userId, agent, type, data });
    }

    /** Delete a memory record by Convex id. */
    public async deleteMemory(userId: string, id: string): Promise<void> {
        await convex.mutation(convexApi.memory.remove, { id: id as any, userId });
    }

    /** Save onboarding context as structured memory entries (UserProfile, PainPoint, VoiceProfile). */
    public async saveOnboardingMemory(userId: string, context: any): Promise<void> {
        const tasks: Promise<any>[] = [];

        const primarySummary = {
            name: context.name,
            niche: context.niche || context.do,
            goal: context.goal,
            tone: context.tone || context.communication,
            audience: context.audience || context.customer,
            stage: context.stage,
            background: context.background,
            platforms: context.platforms,
        };

        if (primarySummary.niche || primarySummary.goal || primarySummary.tone) {
            tasks.push(this.upsertMemory(userId, 'atlas', 'UserProfile', {
                ...primarySummary,
                savedAt: new Date().toISOString(),
            }));
        }

        if (context?.painPoints?.length || context?.customer) {
            tasks.push(this.upsertMemory(userId, 'archivist', 'PainPoint', {
                points: context.painPoints || [context.customer],
                savedAt: new Date().toISOString(),
            }));
        }

        if (context?.voiceProfile || context?.communication || context?.tone) {
            tasks.push(this.upsertMemory(userId, 'scribe', 'VoiceProfile', {
                ...(context.voiceProfile || {}),
                communication: context.communication,
                tone: context.tone,
                savedAt: new Date().toISOString(),
            }));
        }

        await Promise.all(tasks);
    }

    /** Dashboard stats: memory counts, drafts, activity. */
    public async getStats(userId: string): Promise<{
        totalMemories: number;
        byAgent: Record<string, number>;
        totalDrafts: number;
        approvedDrafts: number;
        pendingDrafts: number;
        totalActivity: number;
    }> {
        return convex.query(convexApi.memory.stats, { userId });
    }
}
