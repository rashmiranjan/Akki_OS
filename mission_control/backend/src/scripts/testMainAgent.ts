import { GatewayService } from '../services/gatewayService';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const gateway = GatewayService.getInstance();

async function testMainAgent() {
    console.log('--- Testing Akki (Main) Agent via Gateway ---');
    try {
        const result = await gateway.call('agent', {
            agent: 'main',
            action: 'chat',
            params: {
                message: 'How many agents are there?',
                user_id: 'test-user',
                session_key: 'test-session'
            }
        });
        console.log('✅ Result:', JSON.stringify(result, null, 2));
    } catch (err: any) {
        console.error('❌ Failed:', err.message);
    }
}

testMainAgent();
