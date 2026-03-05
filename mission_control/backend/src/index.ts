import express from 'express';
import cors from 'cors';
import { GatewayService } from './services/gatewayService';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import "./lib/db"; // initialize app tables (memory, drafts, activity)

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.all('/api/auth/*', toNodeHandler(auth));

import { authMiddleware } from './middleware/auth';
import { getMe, getAllUsers } from './controllers/userController';
import { getAgents, triggerAgent } from './controllers/agentController';
import { getActivity, ingestActivity } from './controllers/activityController';
import { getDrafts, updateDraft } from './controllers/draftController';
import { createDraft } from './controllers/draftController';
import { sendMessage, getHistory } from './controllers/chatController';
import { getMemory, upsertMemory, deleteMemory, getMemoryStats } from './controllers/memoryController';
import { getOnboarding, completeOnboarding } from './controllers/onboardingController';
import { initCronJobs } from './services/cronService';
import { convex, convexApi } from './lib/convexClient';

app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', authMiddleware);
app.get('/api/v1/users/me', getMe);
app.get('/api/v1/admin/users', getAllUsers);
app.get('/api/v1/agents', getAgents);
app.post('/api/v1/agents/trigger', triggerAgent);
app.get('/api/v1/activity', getActivity);
app.post('/api/v1/activity', ingestActivity);
app.get('/api/v1/drafts', getDrafts);
app.post('/api/v1/drafts', async (req, res) => {
    const userId = (req as any).user?.id || 'local-user';
    const { agent, content, platform, status } = req.body;
    try {
        const item = await createDraft(userId, agent, content, platform || 'linkedin');
        res.json({ success: true, item });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});
app.patch('/api/v1/drafts/:id', updateDraft);
app.post('/api/v1/chat/send', sendMessage);
app.get('/api/v1/chat/history', getHistory);

// Memory routes
app.get('/api/v1/memory', getMemory);
app.post('/api/v1/memory', upsertMemory);
app.delete('/api/v1/memory/:id', deleteMemory);
app.get('/api/v1/memory/stats', getMemoryStats);

// Strategy routes
app.get('/api/v1/strategy', async (req: any, res: any) => {
    const userId = req.user?.id || 'local-user';
    try {
        const strategy = await convex.query(convexApi.strategy.get, { userId });
        res.json({ success: true, strategy });
    } catch (e: any) { res.json({ success: true, strategy: null }); }
});
app.post('/api/v1/strategy', async (req: any, res: any) => {
    const userId = req.user?.id || 'local-user';
    const { week, goal, frequency, persona, days, generatedBy } = req.body;
    try {
        const id = await convex.mutation(convexApi.strategy.save, { userId, week, goal, frequency, persona, days, generatedBy: generatedBy || 'shuri' });
        res.json({ success: true, id });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
});

// Onboarding routes
app.get('/api/v1/onboarding', getOnboarding);
app.post('/api/v1/onboarding/complete', completeOnboarding);

// Start persistent Gateway connection
GatewayService.getInstance().connect().catch(console.error);

app.listen(PORT, () => {
    console.log(`ðŸš€ Mission Control running on port ${PORT}`);
    initCronJobs();
});


