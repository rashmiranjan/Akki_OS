"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../../.env') });
const ip = "135.125.131.247";
const token = process.env.OPENCLAW_TOKEN;
async function debugSSH() {
    console.log('--- Debugging SSH Connection ---');
    // Try a simple echo first
    const testCmd = `ssh -o ConnectTimeout=5 ubuntu@${ip} "echo 'SSH Connection OK'"`;
    console.log(`Running: ${testCmd}`);
    (0, child_process_1.exec)(testCmd, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ SSH Test Failed:', error.message);
            console.error('Stderr:', stderr);
            return;
        }
        console.log('✅ SSH Stdout:', stdout);
    });
}
debugSSH();
