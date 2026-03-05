"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = void 0;
const gatewayService_1 = require("./gatewayService");
const gatewayService = gatewayService_1.GatewayService.getInstance();
const LOCAL_USER_ID = 'local-user';
const initCronJobs = () => {
    console.log('--- AKKI OS Autonomous Cron System Initialized ---');
    // FURY: Research every 4 hours
    setInterval(async () => {
        console.log('[Cron] Triggering Fury Research Cycle...');
        await gatewayService.triggerAgent('fury', 'autonomous_market_scan', LOCAL_USER_ID);
    }, 4 * 60 * 60 * 1000);
    // ECHO: Engagement every 2 hours
    setInterval(async () => {
        console.log('[Cron] Triggering Echo Engagement Check...');
        await gatewayService.triggerAgent('echo', 'conversation_hunt', LOCAL_USER_ID);
    }, 2 * 60 * 60 * 1000);
    // SHURI, ORACLE, PULSE: every 12 hours
    setInterval(async () => {
        console.log('[Cron] Triggering Strategy & Idea Generation Cycle...');
        await gatewayService.triggerAgent('shuri', 'update_content_calendar', LOCAL_USER_ID);
        await gatewayService.triggerAgent('oracle', 'generate_idea_bank', LOCAL_USER_ID);
        await gatewayService.triggerAgent('pulse', 'weekly_pattern_analysis', LOCAL_USER_ID);
    }, 12 * 60 * 60 * 1000);
};
exports.initCronJobs = initCronJobs;
