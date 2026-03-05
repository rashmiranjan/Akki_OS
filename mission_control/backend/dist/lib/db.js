"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
/**
 * db.ts — SQLite instance for BetterAuth user lookups ONLY.
 * App data (memory, drafts, activity) lives in Convex.
 * Auth tables are managed by BetterAuth in auth.ts.
 */
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dbDir = path_1.default.join(process.cwd(), 'data');
if (!fs_1.default.existsSync(dbDir))
    fs_1.default.mkdirSync(dbDir, { recursive: true });
exports.db = new better_sqlite3_1.default(path_1.default.join(dbDir, 'auth.db'));
