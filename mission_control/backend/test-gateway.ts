
import { GatewayService } from './src/services/gatewayService';

async function test() {
    const gateway = GatewayService.getInstance();
    try {
        console.log('Testing gateway connection...');
        // We'll try a dummy call or just trigger an agent if we know one exists
        // From the previous conversation, they were trying to connect.
        // The service connects on the first call.
        const result = await gateway.triggerAgent('test-agent', 'ping');
        console.log('Test result:', result);
    } catch (error: any) {
        console.error('Test failed with error:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
    }
}

test();
