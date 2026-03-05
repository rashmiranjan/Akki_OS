"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerAgent = exports.getAgents = void 0;
const gatewayService_1 = require("../services/gatewayService");
const agentLogicService_1 = require("../services/agentLogicService");
const activityController_1 = require("./activityController");
const agentLogicService = agentLogicService_1.AgentLogicService.getInstance();
const gatewayService = gatewayService_1.GatewayService.getInstance();
const DEFAULT_AGENTS = [
    { id: 'jarvis', name: 'Jarvis', role: 'Orchestrator', status: 'online', description: 'Parses intent, delegates tasks, and coordinates the agent network.', capabilities: ['Intent Parsing', 'Task Delegation', 'System Orchestration'] },
    { id: 'fury', name: 'Fury', role: 'Researcher', status: 'online', description: 'Autonomous web intel via Apify focusing on Reddit, LinkedIn, and X.', capabilities: ['Trend Detection', 'Market Research', 'Pain Point Extraction'] },
    { id: 'shuri', name: 'Shuri', role: 'Strategist', status: 'online', description: 'Develops 7-day content calendars and campaign planning.', capabilities: ['Strategic Planning', 'Content Calendaring', 'Campaign Management'] },
    { id: 'oracle', name: 'Oracle', role: 'Idea Generator', status: 'online', description: 'Creates hundreds of content ideas from research data.', capabilities: ['Brainstorming', 'Concept Generation', 'Trend Adaptation'] },
    { id: 'loki', name: 'Loki', role: 'Writer', status: 'online', description: 'Generates high-performance LinkedIn and X posts.', capabilities: ['Copywriting', 'Voice Adaptation', 'Platform Optimization'] },
    { id: 'vision', name: 'Vision', role: 'Visual Generator', status: 'online', description: 'Creates quote cards, diagrams, and video scripts.', capabilities: ['Visual Design', 'Diagramming', 'Creative Direction'] },
    { id: 'atlas', name: 'Atlas', role: 'Distributor', status: 'online', description: 'Schedules and publishes posts to social platforms.', capabilities: ['Auto-Publishing', 'Multi-Platform Sync', 'Scheduling'] },
    { id: 'echo', name: 'Echo', role: 'Engagement', status: 'online', description: 'Generates reply suggestions and hunts for conversations.', capabilities: ['Comment Analysis', 'Reply Generation', 'Social Listening'] },
    { id: 'pulse', name: 'Pulse', role: 'Analytics', status: 'online', description: 'Weekly performance analysis and auto-evolution insights.', capabilities: ['Performance Tracking', 'Growth Analytics', 'Strategy Refinement'] },
];
const getAgents = async (req, res) => {
    try {
        res.json({ success: true, agents: DEFAULT_AGENTS });
    }
    catch (error) {
        res.json({ success: true, agents: DEFAULT_AGENTS });
    }
};
exports.getAgents = getAgents;
const triggerAgent = async (req, res) => {
    const { agentName, command, context } = req.body;
    const userId = req.user?.id;
    console.log(`🚀 [Trigger] Agent: ${agentName}, Command: ${command}`);
    try {
        let result;
        if (agentName === 'loki' && command === 'manual_trigger') {
            result = await agentLogicService.runLoki(userId);
        }
        else if (agentName === 'fury' && command === 'manual_trigger') {
            result = await agentLogicService.runFury(userId);
        }
        else if (agentName === 'jarvis' && command === 'initialize_phase_0') {
            result = await agentLogicService.runJarvisOnboarding(userId, context);
        }
        else {
            result = await gatewayService.triggerAgent(agentName, command, userId);
        }
        (0, activityController_1.logActivity)(userId, agentName, 'trigger', `Triggered ${agentName}: ${command}`);
        res.json({ success: true, result });
    }
    catch (error) {
        console.error('Trigger Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.triggerAgent = triggerAgent;
