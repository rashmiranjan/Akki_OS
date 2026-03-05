"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemoryStats = exports.deleteMemory = exports.upsertMemory = exports.getMemory = void 0;
const memoryService_1 = require("../services/memoryService");
const memoryService = memoryService_1.MemoryService.getInstance();
/** GET /api/v1/memory?agent=jarvis&type=UserProfile */
const getMemory = async (req, res) => {
    const userId = req.user?.id;
    const { agent, type } = req.query;
    try {
        const records = await memoryService.getMemory(userId, agent, type);
        res.json({ success: true, memory: records });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getMemory = getMemory;
/** POST /api/v1/memory — Body: { agent, type, data } */
const upsertMemory = async (req, res) => {
    const userId = req.user?.id;
    const { agent, type, data } = req.body;
    if (!agent || !type || !data) {
        return res.status(400).json({ success: false, error: 'agent, type, and data are required' });
    }
    try {
        const record = await memoryService.upsertMemory(userId, agent, type, data);
        res.json({ success: true, memory: record });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.upsertMemory = upsertMemory;
/** DELETE /api/v1/memory/:id */
const deleteMemory = async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    try {
        await memoryService.deleteMemory(userId, id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.deleteMemory = deleteMemory;
/** GET /api/v1/memory/stats */
const getMemoryStats = async (req, res) => {
    const userId = req.user?.id;
    try {
        const stats = await memoryService.getStats(userId);
        res.json({ success: true, stats });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getMemoryStats = getMemoryStats;
