import { GatewayService } from '../services/gatewayService';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const gateway = GatewayService.getInstance();

async function testConnection() {
    console.log('--- Testing Gateway Connection ---');
    try {
        const result = await gateway.triggerAgent('jarvis', 'status_check');
        console.log('✅ Gateway Response:', result);
    } catch (err: any) {
        console.error('❌ Gateway Test Failed:', err.message);
    }
}

testConnection();
