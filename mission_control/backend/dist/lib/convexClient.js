"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convexApi = exports.convex = void 0;
/**
 * convexClient.ts
 * Central Convex HTTP client for Akki OS backend.
 * Uses makeFunctionReference so we don't need _generated types at runtime.
 * Schema + functions live in backend/convex/*.ts
 */
const browser_1 = require("convex/browser");
const server_1 = require("convex/server");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ─── Singleton Client ─────────────────────────────────────────────────────────
const CONVEX_URL = process.env.CONVEX_URL || "";
if (!CONVEX_URL) {
    console.warn("⚠️  CONVEX_URL not set — Convex features will fail. Add it to .env");
}
exports.convex = new browser_1.ConvexHttpClient(CONVEX_URL);
// ─── Typed Function References ────────────────────────────────────────────────
// These map to convex/memory.ts, convex/drafts.ts, convex/activity.ts
exports.convexApi = {
    memory: {
        list: (0, server_1.makeFunctionReference)("memory:list"),
        upsert: (0, server_1.makeFunctionReference)("memory:upsert"),
        remove: (0, server_1.makeFunctionReference)("memory:remove"),
        stats: (0, server_1.makeFunctionReference)("memory:stats"),
    },
    drafts: {
        list: (0, server_1.makeFunctionReference)("drafts:list"),
        create: (0, server_1.makeFunctionReference)("drafts:create"),
        update: (0, server_1.makeFunctionReference)("drafts:update"),
    },
    activity: {
        list: (0, server_1.makeFunctionReference)("activity:list"),
        log: (0, server_1.makeFunctionReference)("activity:log"),
    },
};
