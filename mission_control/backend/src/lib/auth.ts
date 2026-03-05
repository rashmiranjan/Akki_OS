import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "auth.db");
const db = new Database(dbPath);

db.exec(`CREATE TABLE IF NOT EXISTS user (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, emailVerified INTEGER NOT NULL DEFAULT 0, image TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)`);
db.exec(`CREATE TABLE IF NOT EXISTS session (id TEXT PRIMARY KEY, expiresAt TEXT NOT NULL, token TEXT NOT NULL UNIQUE, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, ipAddress TEXT, userAgent TEXT, userId TEXT NOT NULL)`);
db.exec(`CREATE TABLE IF NOT EXISTS account (id TEXT PRIMARY KEY, accountId TEXT NOT NULL, providerId TEXT NOT NULL, userId TEXT NOT NULL, accessToken TEXT, refreshToken TEXT, idToken TEXT, accessTokenExpiresAt TEXT, refreshTokenExpiresAt TEXT, scope TEXT, password TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)`);
db.exec(`CREATE TABLE IF NOT EXISTS verification (id TEXT PRIMARY KEY, identifier TEXT NOT NULL, value TEXT NOT NULL, expiresAt TEXT NOT NULL, createdAt TEXT, updatedAt TEXT)`);

console.log("✅ Database tables ready!");

export const auth = betterAuth({
    database: db,
    emailAndPassword: { enabled: true },
    trustedOrigins: ["http://localhost:3000"],
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8000",
});