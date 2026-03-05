"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = exports.getActivity = void 0;
const convexClient_1 = require("../lib/convexClient");
/** GET /api/v1/activity */
const getActivity = async (req, res) => {
    const userId = req.user?.id;
    try {
        const items = await convexClient_1.convex.query(convexClient_1.convexApi.activity.list, { userId });
        res.json({ success: true, items, total: items.length });
    }
    catch (error) {
        console.error('[Activity] getActivity error:', error.message);
        res.json({ success: true, items: [], total: 0 });
    }
};
exports.getActivity = getActivity;
/** Called by other controllers to log agent actions to Convex. */
const logActivity = async (userId, agent, action, message) => {
    try {
        await convexClient_1.convex.mutation(convexClient_1.convexApi.activity.log, { userId, agent, action, message });
    }
    catch (e) {
        console.error('[Activity] logActivity failed:', e.message);
    }
};
exports.logActivity = logActivity;
