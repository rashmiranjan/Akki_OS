import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    project_documents: defineTable({
        slug: v.string(),
        relativePath: v.string(),
        category: v.string(),
        extension: v.string(),
        title: v.optional(v.string()),
        content: v.string(),
        contentHash: v.string(),
        sourceMtime: v.number(),
        lastSyncedAt: v.number(),
        parseStatus: v.string(),
        structuredData: v.optional(v.any()),
    })
        .index("by_slug", ["slug"])
        .index("by_slug_category", ["slug", "category"])
        .index("by_slug_path", ["slug", "relativePath"]),

    memory: defineTable({
        userId: v.string(),
        agent: v.string(),
        type: v.string(),
        data: v.any(),
    })
        .index("by_user", ["userId"])
        .index("by_user_agent", ["userId", "agent"])
        .index("by_user_agent_type", ["userId", "agent", "type"]),

    drafts: defineTable({
        userId: v.string(),
        agent: v.string(),
        content: v.string(),
        platform: v.string(),
        status: v.string(),
    })
        .index("by_user", ["userId"])
        .index("by_user_status", ["userId", "status"]),

    activity: defineTable({
        userId: v.string(),
        agent: v.string(),
        action: v.string(),
        message: v.string(),
    })
        .index("by_user", ["userId"]),

    chat_messages: defineTable({
        agentId: v.string(),
        userId: v.string(),
        role: v.string(),
        content: v.string(),
        runId: v.optional(v.string()),
    })
        .index("by_agent_user", ["agentId", "userId"]),

    strategy: defineTable({
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
    })
        .index("by_user", ["userId"]),
});
