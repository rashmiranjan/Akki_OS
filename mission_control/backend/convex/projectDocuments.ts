import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsert = mutation({
    args: {
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
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("project_documents")
            .withIndex("by_slug_path", (q) =>
                q.eq("slug", args.slug).eq("relativePath", args.relativePath)
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, args);
            return existing._id;
        }

        return await ctx.db.insert("project_documents", args);
    },
});

export const deleteMissingForSlug = mutation({
    args: {
        slug: v.string(),
        activePaths: v.array(v.string()),
    },
    handler: async (ctx, { slug, activePaths }) => {
        const docs = await ctx.db
            .query("project_documents")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .collect();

        const active = new Set(activePaths);
        let deleted = 0;

        for (const doc of docs) {
            if (!active.has(doc.relativePath)) {
                await ctx.db.delete(doc._id);
                deleted += 1;
            }
        }

        return { deleted };
    },
});

export const listProjects = query({
    args: {},
    handler: async (ctx) => {
        const docs = await ctx.db.query("project_documents").collect();
        const bySlug = new Map<string, {
            slug: string;
            docCount: number;
            categories: Record<string, number>;
            updatedAt: number;
            title?: string;
        }>();

        for (const doc of docs) {
            const current = bySlug.get(doc.slug) || {
                slug: doc.slug,
                docCount: 0,
                categories: {},
                updatedAt: 0,
                title: undefined,
            };

            current.docCount += 1;
            current.categories[doc.category] = (current.categories[doc.category] || 0) + 1;
            current.updatedAt = Math.max(current.updatedAt, doc.lastSyncedAt);

            if (!current.title && doc.relativePath === "README.md") {
                current.title = doc.title || doc.slug;
            }

            if (!current.title && doc.relativePath === "project.yaml" && doc.structuredData?.name) {
                current.title = String(doc.structuredData.name);
            }

            bySlug.set(doc.slug, current);
        }

        return Array.from(bySlug.values()).sort((a, b) => b.updatedAt - a.updatedAt);
    },
});

export const listDocuments = query({
    args: {
        slug: v.string(),
        category: v.optional(v.string()),
    },
    handler: async (ctx, { slug, category }) => {
        let docs = await ctx.db
            .query("project_documents")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .collect();

        if (category) {
            docs = docs.filter((doc) => doc.category === category);
        }

        return docs.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
    },
});

export const getDocument = query({
    args: {
        slug: v.string(),
        relativePath: v.string(),
    },
    handler: async (ctx, { slug, relativePath }) => {
        return await ctx.db
            .query("project_documents")
            .withIndex("by_slug_path", (q) =>
                q.eq("slug", slug).eq("relativePath", relativePath)
            )
            .first();
    },
});
