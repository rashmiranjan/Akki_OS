import { auth } from "./lib/auth";

async function migrate() {
    try {
        console.log('Running migrations...');
        // @ts-ignore
        await auth.api.runMigrations?.();
        console.log('Done!');
    } catch(e) {
        console.log('Migration error:', e);
    }
    process.exit(0);
}

migrate();
