import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Fetch memory records for a user. Optionally filter by agent and/or type. */
export const list = query({
    args: {
        userId: v.string(),
        agent: v.optional(v.string()),
        type: v.optional(v.string()),
    },
    handler: async (ctx, { userId, agent, type }) => {
        let records = await ctx.db
            .query("memory")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        if (agent) records = records.filter((r) => r.agent === agent);
        if (type) records = records.filter((r) => r.type === type);

        return records;
    },
});

/**
 * Upsert memory — if agent+type already exists for user, update it.
 * Otherwise insert a new record.
 */
export const upsert = mutation({
    args: {
        userId: v.string(),
        agent: v.string(),
        type: v.string(),
        data: v.any(),
    },
    handler: async (ctx, { userId, agent, type, data }) => {
        const existing = await ctx.db
            .query("memory")
            .withIndex("by_user_agent_type", (q) =>
                q.eq("userId", userId).eq("agent", agent).eq("type", type)
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { data });
            return existing._id;
        } else {
            return await ctx.db.insert("memory", { userId, agent, type, data });
        }
    },
});

/** Delete a memory record (validates ownership). */
export const remove = mutation({
    args: { id: v.id("memory"), userId: v.string() },
    handler: async (ctx, { id, userId }) => {
        const record = await ctx.db.get(id);
        if (!record || record.userId !== userId) {
            throw new Error("Not found or unauthorized");
        }
        await ctx.db.delete(id);
    },
});

/** Dashboard stats: memory counts, draft counts, activity count. */
export const stats = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        const [memories, allDrafts, activities] = await Promise.all([
            ctx.db.query("memory").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
            ctx.db.query("drafts").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
            ctx.db.query("activity").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
        ]);

        const byAgent: Record<string, number> = {};
        for (const m of memories) {
            byAgent[m.agent] = (byAgent[m.agent] || 0) + 1;
        }

        return {
            totalMemories: memories.length,
            byAgent,
            totalDrafts: allDrafts.length,
            approvedDrafts: allDrafts.filter((d) => d.status === "approved").length,
            pendingDrafts: allDrafts.filter((d) => d.status === "pending").length,
            totalActivity: activities.length,
        };
    },
});
