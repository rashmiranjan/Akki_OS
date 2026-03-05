import { exec } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const ip = "135.125.131.247";
const token = process.env.OPENCLAW_TOKEN;

async function debugSSH() {
    console.log('--- Debugging SSH Connection ---');
    // Try a simple echo first
    const testCmd = `ssh -o ConnectTimeout=5 ubuntu@${ip} "echo 'SSH Connection OK'"`;
    console.log(`Running: ${testCmd}`);

    exec(testCmd, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ SSH Test Failed:', error.message);
            console.error('Stderr:', stderr);
            return;
        }
        console.log('✅ SSH Stdout:', stdout);
    });
}

debugSSH();
