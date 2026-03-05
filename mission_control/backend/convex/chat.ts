import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: { agentId: v.string(), userId: v.string() },
    handler: async (ctx, { agentId, userId }) => {
        return ctx.db
            .query("chat_messages")
            .withIndex("by_agent_user", (q) => q.eq("agentId", agentId).eq("userId", userId))
            .order("asc")
            .take(100);
    },
});

export const create = mutation({
    args: {
        agentId: v.string(),
        userId: v.string(),
        role: v.string(),
        content: v.string(),
        runId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return ctx.db.insert("chat_messages", args);
    },
});

export const updateByRunId = mutation({
    args: { runId: v.string(), content: v.string() },
    handler: async (ctx, { runId, content }) => {
        const msgs = await ctx.db
            .query("chat_messages")
            .filter((q) => q.eq(q.field("runId"), runId))
            .collect();
        for (const msg of msgs) {
            if (msg.role === "agent") await ctx.db.patch(msg._id, { content });
        }
    },
});
