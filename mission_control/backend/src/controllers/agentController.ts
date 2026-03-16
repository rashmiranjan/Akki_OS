import { Request, Response } from 'express';
import { GatewayService } from '../services/gatewayService';
import { AgentLogicService } from '../services/agentLogicService';
import { logActivity } from './activityController';
import { PBOS_AGENTS } from '../config/pbos';

const agentLogicService = AgentLogicService.getInstance();
const gatewayService = GatewayService.getInstance();

export const getAgents = async (req: Request, res: Response) => {
    try {
        res.json({ success: true, agents: PBOS_AGENTS });
    } catch (error: any) {
        res.json({ success: true, agents: PBOS_AGENTS });
    }
};

export const triggerAgent = async (req: Request, res: Response) => {
    const { agentName, command, context } = req.body;
    const userId = (req as any).user?.id;

    console.log(`🚀 [Trigger] Agent: ${agentName}, Command: ${command}`);

    try {
        let result;

        if (agentName === 'scribe' && command === 'manual_trigger') {
            result = await agentLogicService.runScribe(userId);
        } else if (agentName === 'archivist' && command === 'manual_trigger') {
            result = await agentLogicService.runArchivist(userId);
        } else if (agentName === 'atlas' && command === 'initialize_phase_0') {
            result = await agentLogicService.runAtlasOnboarding(userId, context);
        } else {
            result = await gatewayService.triggerAgent(agentName, command, userId);
        }

        logActivity(userId, agentName, 'trigger', `Triggered ${agentName}: ${command}`);

        res.json({ success: true, result });
    } catch (error: any) {
        console.error('Trigger Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
