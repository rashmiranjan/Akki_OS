/**
 * db.ts - SQLite for BetterAuth + chat_messages
 * App data (memory, drafts, activity) lives in Convex.
 */
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

export const db = new Database(path.join(dbDir, "auth.db"));

// Chat messages table for Mission Control chat UI
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id          TEXT PRIMARY KEY,
    agent_id    TEXT NOT NULL,
    user_id     TEXT NOT NULL,
    role        TEXT NOT NULL CHECK(role IN ('user', 'agent')),
    content     TEXT NOT NULL,
    run_id      TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_chat_agent ON chat_messages(agent_id, user_id, created_at);
`);

console.log("âœ… Database tables ready!");

