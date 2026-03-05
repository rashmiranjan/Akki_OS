import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import dotenv from "dotenv";
dotenv.config();

const CONVEX_URL = process.env.CONVEX_URL || "";
if (!CONVEX_URL) {
    console.warn("⚠️  CONVEX_URL not set — Convex features will fail. Add it to .env");
}
export const convex = new ConvexHttpClient(CONVEX_URL);

export const convexApi = {
    memory: {
        list: makeFunctionReference<"query">("memory:list"),
        upsert: makeFunctionReference<"mutation">("memory:upsert"),
        remove: makeFunctionReference<"mutation">("memory:remove"),
        stats: makeFunctionReference<"query">("memory:stats"),
    },
    drafts: {
        list: makeFunctionReference<"query">("drafts:list"),
        create: makeFunctionReference<"mutation">("drafts:create"),
        update: makeFunctionReference<"mutation">("drafts:update"),
    },
    activity: {
        list: makeFunctionReference<"query">("activity:list"),
        log: makeFunctionReference<"mutation">("activity:log"),
    },
    strategy: {
        get: makeFunctionReference<"query">("strategy:get"),
        save: makeFunctionReference<"mutation">("strategy:save"),
        updateDayStatus: makeFunctionReference<"mutation">("strategy:updateDayStatus"),
    },
    chat: {
        list: makeFunctionReference<"query">("chat:list"),
        create: makeFunctionReference<"mutation">("chat:create"),
        updateByRunId: makeFunctionReference<"mutation">("chat:updateByRunId"),
    },
};

