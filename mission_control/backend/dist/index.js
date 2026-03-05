"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_1 = require("better-auth/node");
const auth_1 = require("./lib/auth");
require("./lib/db"); // initialize app tables (memory, drafts, activity)
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.all('/api/auth/*', (0, node_1.toNodeHandler)(auth_1.auth));
const auth_2 = require("./middleware/auth");
const userController_1 = require("./controllers/userController");
const agentController_1 = require("./controllers/agentController");
const activityController_1 = require("./controllers/activityController");
const draftController_1 = require("./controllers/draftController");
const chatController_1 = require("./controllers/chatController");
const memoryController_1 = require("./controllers/memoryController");
const onboardingController_1 = require("./controllers/onboardingController");
const cronService_1 = require("./services/cronService");
app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api', auth_2.authMiddleware);
app.get('/api/v1/users/me', userController_1.getMe);
app.get('/api/v1/admin/users', userController_1.getAllUsers);
app.get('/api/v1/agents', agentController_1.getAgents);
app.post('/api/v1/agents/trigger', agentController_1.triggerAgent);
app.get('/api/v1/activity', activityController_1.getActivity);
app.get('/api/v1/drafts', draftController_1.getDrafts);
app.patch('/api/v1/drafts/:id', draftController_1.updateDraft);
app.post('/api/v1/chat/send', chatController_1.sendMessage);
app.get('/api/v1/chat/history', chatController_1.getHistory);
// Memory routes
app.get('/api/v1/memory', memoryController_1.getMemory);
app.post('/api/v1/memory', memoryController_1.upsertMemory);
app.delete('/api/v1/memory/:id', memoryController_1.deleteMemory);
app.get('/api/v1/memory/stats', memoryController_1.getMemoryStats);
// Onboarding routes
app.get('/api/v1/onboarding', onboardingController_1.getOnboarding);
app.post('/api/v1/onboarding/complete', onboardingController_1.completeOnboarding);
app.listen(PORT, () => {
    console.log('🚀 Akki OS Backend running on http://localhost:' + PORT);
    (0, cronService_1.initCronJobs)();
});
