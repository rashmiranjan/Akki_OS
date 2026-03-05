"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gatewayService_1 = require("../services/gatewayService");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../../.env') });
const gateway = gatewayService_1.GatewayService.getInstance();
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
    }
    catch (err) {
        console.error('❌ Failed:', err.message);
    }
}
testMainAgent();
