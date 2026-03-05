import { GatewayService } from './src/services/gatewayService';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const gateway = GatewayService.getInstance();
    try {
        console.log("Testing Gateway connection...");
        const result = await gateway.call('health', {});
        console.log("Gateway Health:", result);
    } catch (err) {
        console.error("Gateway Test Failed:", err);
    }
}
test();
