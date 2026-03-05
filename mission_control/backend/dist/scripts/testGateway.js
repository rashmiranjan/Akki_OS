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
async function testConnection() {
    console.log('--- Testing Gateway Connection ---');
    try {
        const result = await gateway.triggerAgent('jarvis', 'status_check');
        console.log('✅ Gateway Response:', result);
    }
    catch (err) {
        console.error('❌ Gateway Test Failed:', err.message);
    }
}
testConnection();
