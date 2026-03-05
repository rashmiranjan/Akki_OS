import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: { userId: v.string() },
    handler: async (ctx, { userId }) => {
        return ctx.db
            .query("strategy")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .first();
    },
});

export const save = mutation({
    args: {
        userId: v.string(),
        week: v.string(),
        goal: v.string(),
        frequency: v.string(),
        persona: v.string(),
        days: v.array(v.object({
            day: v.string(),
            date: v.string(),
            theme: v.string(),
            topic: v.string(),
            platform: v.string(),
            time: v.string(),
            agent: v.string(),
            status: v.string(),
        })),
        generatedBy: v.string(),
    },
    handler: async (ctx, args) => {
        return ctx.db.insert("strategy", args);
    },
});

export const updateDayStatus = mutation({
    args: {
        id: v.id("strategy"),
        dayIndex: v.number(),
        status: v.string(),
    },
    handler: async (ctx, { id, dayIndex, status }) => {
        const strategy = await ctx.db.get(id);
        if (!strategy) throw new Error("Not found");
        const days = [...strategy.days];
        days[dayIndex] = { ...days[dayIndex], status };
        await ctx.db.patch(id, { days });
        return await ctx.db.get(id);
    },
});
