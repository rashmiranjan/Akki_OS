import { GatewayService } from './gatewayService';
import { createDraft } from '../controllers/draftController';

const gatewayService = GatewayService.getInstance();
const LOCAL_USER_ID = 'local-user';

export const initCronJobs = () => {
    console.log('--- AKKI OS Autonomous Cron System Initialized ---');

    // FURY: Research every 4 hours
    setInterval(async () => {
        console.log('[Cron] Triggering Fury Research Cycle...');
        await gatewayService.triggerAgent('fury', 
            'Do a market scan: find top 3 trending topics in AI agents and personal branding. Save findings to board memory for Oracle and Loki to use.',
            LOCAL_USER_ID
        );
    }, 4 * 60 * 60 * 1000);

    // ECHO: Engagement every 2 hours
    setInterval(async () => {
        console.log('[Cron] Triggering Echo Engagement Check...');
        await gatewayService.triggerAgent('echo', 
            'Check for any engagement opportunities. Find conversations to join in AI agents and personal branding space.',
            LOCAL_USER_ID
        );
    }, 2 * 60 * 60 * 1000);

    // ORACLE: Idea generation every 12 hours
    setInterval(async () => {
        console.log('[Cron] Triggering Oracle Idea Generation...');
        await gatewayService.triggerAgent('oracle',
            'Generate 5 fresh LinkedIn post ideas for Chirag based on AI agents niche. Target audience: Founders & Developers. Save ideas to webhook at http://host.docker.internal:3003 with action save_ideas.',
            LOCAL_USER_ID
        );
    }, 12 * 60 * 60 * 1000);

    // LOKI: Write posts every 24 hours
    setInterval(async () => {
        console.log('[Cron] Triggering Loki Content Sprint...');
        await gatewayService.triggerAgent('loki',
            'Write 2 LinkedIn posts for Chirag. Niche: AI Agents. Tone: Bold and Direct. Audience: Founders & Developers. Save each to webhook at http://host.docker.internal:3003 with action save_draft.',
            LOCAL_USER_ID
        );
    }, 24 * 60 * 60 * 1000);

    // SHURI + PULSE: Strategy every 12 hours
    setInterval(async () => {
        console.log('[Cron] Triggering Strategy Cycle...');
        await gatewayService.triggerAgent('shuri', 
            'Update content calendar based on latest trends. Save strategy to memory.',
            LOCAL_USER_ID
        );
        await gatewayService.triggerAgent('pulse', 
            'Analyze recent content performance patterns. What is working? What should change?',
            LOCAL_USER_ID
        );
    }, 12 * 60 * 60 * 1000);

    // JARVIS: Coordination every 6 hours
    setInterval(async () => {
        console.log('[Cron] Triggering Jarvis Coordination...');
        await gatewayService.triggerAgent('jarvis',
            'Review current mission status. Check if Fury has research ready, Oracle has ideas, Loki has drafts. Identify what needs to be done next and coordinate accordingly.',
            LOCAL_USER_ID
        );
    }, 6 * 60 * 60 * 1000);

        // ATLAS: Post approved drafts every 6 hours
    setInterval(async () => {
        console.log('[Cron] Triggering Atlas - Post Approved Drafts...');
        await gatewayService.triggerAgent('atlas',
            'post_approved_drafts. Check for approved drafts and publish them. Read skills/linkedin-post/SKILL.md and skills/twitter-post/SKILL.md first.',
            LOCAL_USER_ID
        );
    }, 6 * 60 * 60 * 1000);

    // ATLAS: Engagement every 2 hours
    setInterval(async () => {
        console.log('[Cron] Triggering Atlas - Engagement Cycle...');
        await gatewayService.triggerAgent('atlas',
            'engagement_cycle. Read skills/engagement-hunter/SKILL.md and run one full engagement session on LinkedIn and Twitter.',
            LOCAL_USER_ID
        );
    }, 2 * 60 * 60 * 1000);

    console.log('✅ All cron jobs scheduled!');
    console.log('  Fury: every 4h | Echo: every 2h | Oracle: every 12h');
    console.log('  Loki: every 24h | Shuri+Pulse: every 12h | Jarvis: every 6h');
};

