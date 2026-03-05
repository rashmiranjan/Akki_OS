"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dbDir = path_1.default.join(process.cwd(), "data");
if (!fs_1.default.existsSync(dbDir)) {
    fs_1.default.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path_1.default.join(dbDir, "auth.db");
const db = new better_sqlite3_1.default(dbPath);
db.exec(`CREATE TABLE IF NOT EXISTS user (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, emailVerified INTEGER NOT NULL DEFAULT 0, image TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)`);
db.exec(`CREATE TABLE IF NOT EXISTS session (id TEXT PRIMARY KEY, expiresAt TEXT NOT NULL, token TEXT NOT NULL UNIQUE, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, ipAddress TEXT, userAgent TEXT, userId TEXT NOT NULL)`);
db.exec(`CREATE TABLE IF NOT EXISTS account (id TEXT PRIMARY KEY, accountId TEXT NOT NULL, providerId TEXT NOT NULL, userId TEXT NOT NULL, accessToken TEXT, refreshToken TEXT, idToken TEXT, accessTokenExpiresAt TEXT, refreshTokenExpiresAt TEXT, scope TEXT, password TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)`);
db.exec(`CREATE TABLE IF NOT EXISTS verification (id TEXT PRIMARY KEY, identifier TEXT NOT NULL, value TEXT NOT NULL, expiresAt TEXT NOT NULL, createdAt TEXT, updatedAt TEXT)`);
console.log("✅ Database tables ready!");
exports.auth = (0, better_auth_1.betterAuth)({
    database: db,
    emailAndPassword: { enabled: true },
    trustedOrigins: ["http://localhost:3000"],
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8000",
});
