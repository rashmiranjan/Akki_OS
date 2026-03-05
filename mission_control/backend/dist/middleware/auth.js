"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing authorization header' });
    }
    const token = authHeader.split(' ')[1];
    const validToken = process.env.LOCAL_AUTH_TOKEN || process.env.OPENCLAW_TOKEN;
    if (token !== validToken) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = { id: 'local-user', email: 'local@akki.os' };
    next();
};
exports.authMiddleware = authMiddleware;
