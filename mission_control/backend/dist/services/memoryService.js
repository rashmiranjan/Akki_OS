"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryService = void 0;
const convexClient_1 = require("../lib/convexClient");
class MemoryService {
    static instance;
    constructor() { }
    static getInstance() {
        if (!MemoryService.instance)
            MemoryService.instance = new MemoryService();
        return MemoryService.instance;
    }
    /** Fetch memory for user. Optionally filter by agent and/or type. */
    async getMemory(userId, agent, type) {
        return convexClient_1.convex.query(convexClient_1.convexApi.memory.list, { userId, agent, type });
    }
    /** Upsert a memory record (insert or update by agent+type). */
    async upsertMemory(userId, agent, type, data) {
        return convexClient_1.convex.mutation(convexClient_1.convexApi.memory.upsert, { userId, agent, type, data });
    }
    /** Delete a memory record by Convex id. */
    async deleteMemory(userId, id) {
        await convexClient_1.convex.mutation(convexClient_1.convexApi.memory.remove, { id: id, userId });
    }
    /** Save onboarding context as structured memory entries (UserProfile, PainPoint, VoiceProfile). */
    async saveOnboardingMemory(userId, context) {
        const tasks = [];
        if (context?.niche || context?.goal || context?.tone) {
            tasks.push(this.upsertMemory(userId, 'jarvis', 'UserProfile', {
                niche: context.niche,
                goal: context.goal,
                tone: context.tone,
                platforms: context.platforms,
                savedAt: new Date().toISOString(),
            }));
        }
        if (context?.painPoints?.length) {
            tasks.push(this.upsertMemory(userId, 'jarvis', 'PainPoint', {
                points: context.painPoints,
                savedAt: new Date().toISOString(),
            }));
        }
        if (context?.voiceProfile) {
            tasks.push(this.upsertMemory(userId, 'loki', 'VoiceProfile', {
                ...context.voiceProfile,
                savedAt: new Date().toISOString(),
            }));
        }
        await Promise.all(tasks);
    }
    /** Dashboard stats: memory counts, drafts, activity. */
    async getStats(userId) {
        return convexClient_1.convex.query(convexClient_1.convexApi.memory.stats, { userId });
    }
}
exports.MemoryService = MemoryService;
