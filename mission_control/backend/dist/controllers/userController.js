"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.getMe = void 0;
const db_1 = require("../lib/db");
const getMe = (req, res) => {
    const user = req.user;
    // BetterAuth stores user in the 'user' table in SQLite
    const dbUser = db_1.db.prepare('SELECT * FROM user WHERE id = ?').get(user?.id);
    res.json({
        id: user?.id,
        email: dbUser?.email || user?.email,
        name: dbUser?.name || 'Akki User',
        avatar_url: dbUser?.image || null,
        emailVerified: Boolean(dbUser?.emailVerified),
        created_at: dbUser?.createdAt || new Date().toISOString(),
    });
};
exports.getMe = getMe;
const getAllUsers = (req, res) => {
    try {
        const users = db_1.db.prepare('SELECT id, email, name, image, createdAt FROM user').all();
        res.json({ success: true, users });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getAllUsers = getAllUsers;
