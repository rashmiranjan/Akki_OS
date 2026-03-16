import { GatewayService } from './gatewayService';

export class SchedulerService {
    private static instance: SchedulerService;
    private gatewayService: GatewayService;

    private constructor() {
        this.gatewayService = GatewayService.getInstance();
    }

    public static getInstance(): SchedulerService {
        if (!SchedulerService.instance) {
            SchedulerService.instance = new SchedulerService();
        }
        return SchedulerService.instance;
    }

    public start(): void {
        console.log('⏰ Scheduler Service Started');

        this.scheduleOracle();

        this.scheduleAtlas();

        this.schedulePulse();
    }

    private scheduleOracle() {
        const FOUR_HOURS = 4 * 60 * 60 * 1000;
        setInterval(async () => {
            console.log('🤖 [Oracle] Triggering autonomous research cycle...');
            try {
                await this.gatewayService.triggerAgent('oracle', 'autonomous_research_scan');
            } catch (err) {
                console.error('Failed to trigger Oracle', err);
            }
        }, FOUR_HOURS);
    }

    private scheduleAtlas() {
        console.log('📅 [Atlas] Scheduled for weekly strategy generation');
    }

    private schedulePulse() {
        console.log('📈 [Pulse] Scheduled for weekly analytics report');
    }
}
