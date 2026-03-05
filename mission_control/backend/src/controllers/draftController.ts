import { Request, Response } from 'express';
import { convex, convexApi } from '../lib/convexClient';
import { logActivity } from './activityController';

/** GET /api/v1/drafts */
export const getDrafts = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    try {
        const items = await convex.query(convexApi.drafts.list, { userId });
        res.json({ success: true, drafts: items, items });
    } catch (error: any) {
        console.error('[Drafts] getDrafts error:', error.message);
        res.json({ success: true, items: [] });
    }
};

/** PATCH /api/v1/drafts/:id */
export const updateDraft = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).user?.id;

    try {
        const updated = await convex.mutation(convexApi.drafts.update, {
            id: id as any,
            userId,
            status,
        });

        if (status === 'approved') {
            await logActivity(userId, 'atlas', 'trigger', `Draft ${id} approved â€” queued for publishing`);
            console.log(`ðŸš€ Draft ${id} approved â€” Atlas will publish`);
        } else if (status === 'rejected') {
            await logActivity(userId, 'loki', 'update', `Draft ${id} rejected`);
        }

        res.json({ success: true, item: updated });
    } catch (error: any) {
        console.error('[Drafts] updateDraft error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

/** Used by agents to save a new draft to Convex. */
export const createDraft = async (
    userId: string,
    agent: string,
    content: string,
    platform: string
): Promise<any> => {
    try {
        return await convex.mutation(convexApi.drafts.create, { userId, agent, content, platform });
    } catch (e: any) {
        console.error('[Drafts] createDraft error:', e.message);
        return null;
    }
};
