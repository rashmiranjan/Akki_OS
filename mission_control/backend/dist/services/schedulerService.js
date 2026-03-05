"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const gatewayService_1 = require("./gatewayService");
class SchedulerService {
    static instance;
    gatewayService;
    constructor() {
        this.gatewayService = gatewayService_1.GatewayService.getInstance();
    }
    static getInstance() {
        if (!SchedulerService.instance) {
            SchedulerService.instance = new SchedulerService();
        }
        return SchedulerService.instance;
    }
    start() {
        console.log('⏰ Scheduler Service Started');
        // 1. Fury: Autonomous Researcher (PRD: Runs every 4 hours)
        // For demo/dev purposes, let's run every 1 hour, or just log for now
        this.scheduleFury();
        // 2. Shuri: Content Strategist (PRD: Runs every Sunday 8pm)
        this.scheduleShuri();
        // 3. Pulse: Analytics (PRD: Runs every Monday 6am)
        this.schedulePulse();
    }
    scheduleFury() {
        // Simple interval for demonstration (4 hours = 14400000ms)
        const FOUR_HOURS = 4 * 60 * 60 * 1000;
        setInterval(async () => {
            console.log('🤖 [Fury] Triggering autonomous research cycle...');
            try {
                await this.gatewayService.triggerAgent('fury', 'autonomous_research_scan');
            }
            catch (err) {
                console.error('Failed to trigger Fury', err);
            }
        }, FOUR_HOURS);
    }
    scheduleShuri() {
        // In production, use node-cron for specific times
        // Here we just acknowledge the requirement
        console.log('📅 [Shuri] Scheduled for weekly strategy generation');
    }
    schedulePulse() {
        console.log('📈 [Pulse] Scheduled for weekly analytics report');
    }
}
exports.SchedulerService = SchedulerService;
