"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("./lib/auth");
async function migrate() {
    try {
        console.log('Running migrations...');
        // @ts-ignore
        await auth_1.auth.api.runMigrations?.();
        console.log('Done!');
    }
    catch (e) {
        console.log('Migration error:', e);
    }
    process.exit(0);
}
migrate();
