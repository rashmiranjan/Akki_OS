import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Get activity log for a user (last 100 entries). */
export const list = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        return ctx.db
            .query("activity")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .take(100);
    },
});

/** Log an agent action. */
export const log = mutation({
    args: {
        userId: v.string(),
        agent: v.string(),
        action: v.string(),
        message: v.string(),
    },
    handler: async (ctx, { userId, agent, action, message }) => {
        return ctx.db.insert("activity", { userId, agent, action, message });
    },
});
