import { Request, Response, NextFunction } from "express";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const validToken = process.env.LOCAL_AUTH_TOKEN || process.env.OPENCLAW_TOKEN || "akki123";

    // Local token check
    if (token === validToken) {
        (req as any).user = { id: "local-user", email: "local@akki.os" };
        return next();
    }

    // Clerk JWT — accept any JWT (decode without verify in local mode)
    if (token && token.includes(".")) {
        try {
            const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
            const userId = payload.sub || "local-user";
            (req as any).user = { id: userId, email: payload.email || "local@akki.os" };
            return next();
        } catch (e) {
            // JWT decode failed — fallback to local-user
            (req as any).user = { id: "local-user", email: "local@akki.os" };
            return next();
        }
    }

    return res.status(401).json({ error: "Invalid token" });
};
