"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeOnboarding = exports.getOnboarding = void 0;
const memoryService_1 = require("../services/memoryService");
const memoryService = memoryService_1.MemoryService.getInstance();
/** GET /api/v1/onboarding */
const getOnboarding = async (req, res) => {
    const userId = req.user?.id;
    try {
        const records = await memoryService.getMemory(userId, 'system', 'OnboardingStatus');
        const status = records[0]?.data ?? { completed: false };
        res.json({ success: true, onboarding: status });
    }
    catch (error) {
        res.json({ success: true, onboarding: { completed: false } });
    }
};
exports.getOnboarding = getOnboarding;
/** POST /api/v1/onboarding/complete — Body: { context } */
const completeOnboarding = async (req, res) => {
    const userId = req.user?.id;
    const { context } = req.body;
    try {
        if (context) {
            await memoryService.saveOnboardingMemory(userId, context);
        }
        await memoryService.upsertMemory(userId, 'system', 'OnboardingStatus', {
            completed: true,
            completedAt: new Date().toISOString(),
        });
        console.log(`✅ [Onboarding] User ${userId} completed onboarding`);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.completeOnboarding = completeOnboarding;
