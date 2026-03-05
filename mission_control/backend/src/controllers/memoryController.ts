import { Request, Response } from 'express';
import { MemoryService } from '../services/memoryService';

const memoryService = MemoryService.getInstance();

/** GET /api/v1/memory?agent=jarvis&type=UserProfile */
export const getMemory = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { agent, type } = req.query as { agent?: string; type?: string };
    try {
        const records = await memoryService.getMemory(userId, agent, type);
        res.json({ success: true, memory: records });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/** POST /api/v1/memory — Body: { agent, type, data } */
export const upsertMemory = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { agent, type, data } = req.body;
    if (!agent || !type || !data) {
        return res.status(400).json({ success: false, error: 'agent, type, and data are required' });
    }
    try {
        const record = await memoryService.upsertMemory(userId, agent, type, data);
        res.json({ success: true, memory: record });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/** DELETE /api/v1/memory/:id */
export const deleteMemory = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    try {
        await memoryService.deleteMemory(userId, id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/** GET /api/v1/memory/stats */
export const getMemoryStats = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    try {
        const stats = await memoryService.getStats(userId);
        res.json({ success: true, stats });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
