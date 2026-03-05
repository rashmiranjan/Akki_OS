"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDraft = exports.updateDraft = exports.getDrafts = void 0;
const convexClient_1 = require("../lib/convexClient");
const activityController_1 = require("./activityController");
/** GET /api/v1/drafts */
const getDrafts = async (req, res) => {
    const userId = req.user?.id;
    try {
        const items = await convexClient_1.convex.query(convexClient_1.convexApi.drafts.list, { userId });
        res.json({ success: true, items });
    }
    catch (error) {
        console.error('[Drafts] getDrafts error:', error.message);
        res.json({ success: true, items: [] });
    }
};
exports.getDrafts = getDrafts;
/** PATCH /api/v1/drafts/:id */
const updateDraft = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;
    try {
        const updated = await convexClient_1.convex.mutation(convexClient_1.convexApi.drafts.update, {
            id: id,
            userId,
            status,
        });
        if (status === 'approved') {
            await (0, activityController_1.logActivity)(userId, 'atlas', 'trigger', `Draft ${id} approved — queued for publishing`);
            console.log(`🚀 Draft ${id} approved — Atlas will publish`);
        }
        else if (status === 'rejected') {
            await (0, activityController_1.logActivity)(userId, 'loki', 'update', `Draft ${id} rejected`);
        }
        res.json({ success: true, item: updated });
    }
    catch (error) {
        console.error('[Drafts] updateDraft error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.updateDraft = updateDraft;
/** Used by agents to save a new draft to Convex. */
const createDraft = async (userId, agent, content, platform) => {
    try {
        return await convexClient_1.convex.mutation(convexClient_1.convexApi.drafts.create, { userId, agent, content, platform });
    }
    catch (e) {
        console.error('[Drafts] createDraft error:', e.message);
        return null;
    }
};
exports.createDraft = createDraft;
