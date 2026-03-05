import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Get all drafts for a user. */
export const list = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        return ctx.db
            .query("drafts")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

/** Create a new draft. */
export const create = mutation({
    args: {
        userId: v.string(),
        agent: v.string(),
        content: v.string(),
        platform: v.string(),
    },
    handler: async (ctx, { userId, agent, content, platform }) => {
        return ctx.db.insert("drafts", { userId, agent, content, platform, status: "pending" });
    },
});

/** Update draft status (approve / reject / published). */
export const update = mutation({
    args: {
        id: v.id("drafts"),
        userId: v.string(),
        status: v.string(),
    },
    handler: async (ctx, { id, userId, status }) => {
        const draft = await ctx.db.get(id);
        if (!draft || draft.userId !== userId) throw new Error("Not found or unauthorized");
        await ctx.db.patch(id, { status });
        return await ctx.db.get(id);
    },
});
