import { Request, Response } from 'express';
import { db } from '../lib/db';

export const getMe = (req: Request, res: Response) => {
    const user = (req as any).user;
    // BetterAuth stores user in the 'user' table in SQLite
    const dbUser = db.prepare('SELECT * FROM user WHERE id = ?').get(user?.id) as any;
    res.json({
        id: user?.id,
        email: dbUser?.email || user?.email,
        name: dbUser?.name || 'Akki User',
        avatar_url: dbUser?.image || null,
        emailVerified: Boolean(dbUser?.emailVerified),
        created_at: dbUser?.createdAt || new Date().toISOString(),
    });
};

export const getAllUsers = (req: Request, res: Response) => {
    try {
        const users = db.prepare('SELECT id, email, name, image, createdAt FROM user').all();
        res.json({ success: true, users });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};