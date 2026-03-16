import { Request, Response } from "express";
import { MemoryService } from "../services/memoryService";
import fs from "fs";
import path from "path";
import { PBOS_AGENT_IDS } from "../config/pbos";

const memoryService = MemoryService.getInstance();

const OPERATIONS_ROOT = path.resolve(process.cwd(), "..");
const REPO_ROOT = path.resolve(OPERATIONS_ROOT, "..");
const OPENCLAW_WORKSPACE_ROOT =
  process.env.OPENCLAW_WORKSPACE_ROOT ||
  path.join(REPO_ROOT, "workspace");
const AGENTS_ROOT = process.env.AGENTS_ROOT || path.join(REPO_ROOT, "agents");
const USERPROFILE_PATH =
  process.env.OPENCLAW_USERPROFILE_PATH ||
  path.join(OPENCLAW_WORKSPACE_ROOT, "memory", "graph", "nodes", "UserProfile.json");

export const getOnboarding = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id || "local-user";
    try {
        const records = await memoryService.getMemory(userId, "system", "OnboardingStatus");
        const status = records[0]?.data ?? { completed: false };

        // Also return saved profile if exists
        const profileRecords = await memoryService.getMemory(userId, "atlas", "UserProfile");
        const profile = profileRecords[0]?.data ?? null;

        res.json({ success: true, onboarding: status, profile });
    } catch (error: any) {
        res.json({ success: true, onboarding: { completed: false }, profile: null });
    }
};

export const completeOnboarding = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id || "local-user";
    const { context } = req.body;

    if (!context) {
        return res.status(400).json({ success: false, error: "context is required" });
    }

    try {
        // 1. Save to Convex memory
        await memoryService.saveOnboardingMemory(userId, context);
        await memoryService.upsertMemory(userId, "system", "OnboardingStatus", {
            completed: true,
            completedAt: new Date().toISOString(),
        });

        // 1.5 Update user name in SQLite
        try {
            const { db } = await import("../lib/db.js");
            db.prepare("UPDATE user SET name = ? WHERE id = ?").run(context.name, userId);
            console.log(`✅ User name updated: ${context.name}`);
        } catch (dbErr: any) {
            console.warn("⚠️ Could not update user name:", dbErr.message);
        }

        // 2. Sync to OpenClaw UserProfile.json
        const userProfile = {
            name: context.name || "Akki User",
            nickname: context.name?.split(" ")[0] || "Akki",
            what_they_build: context.niche || context.do || "",
            who_they_help: context.audience || context.customer || "Founders",
            stage: context.stage || "Building",
            goal: context.goal || "",
            tone: context.tone || context.communication || "",
            platforms: context.platforms || [],
            painPoints: context.painPoints || [],
            linkedin: context.linkedin || "",
            timezone: context.timezone || "Asia/Kolkata",
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString(),
        };

        try {
            const dir = path.dirname(USERPROFILE_PATH);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(USERPROFILE_PATH, JSON.stringify(userProfile, null, 2), "utf8");
            console.log("OpenClaw UserProfile.json synced");
        } catch (fsErr: any) {
            console.warn("Could not write UserProfile.json:", fsErr.message);
        }

        // 2.5 Sync to all agents USER.md
        try {
            const userMdContent = `# USER.md - About Your Human
_Auto-synced from onboarding on ${new Date().toISOString()}_

- **Name:** ${userProfile.name}
- **Nickname:** ${userProfile.nickname}
- **Timezone:** ${userProfile.timezone}

## What They Build
${userProfile.what_they_build}

## Who They Help
${userProfile.who_they_help}

## Current Stage
${userProfile.stage}

## Goal
${userProfile.goal}

## Content Tone
${userProfile.tone}

## Platforms
${(userProfile.platforms || []).join(", ")}

## Pain Points
${(userProfile.painPoints || []).join("\\n- ")}

## LinkedIn
${userProfile.linkedin || "Not provided"}
`;
            for (const agent of PBOS_AGENT_IDS) {
                const agentDir = path.join(AGENTS_ROOT, agent);
                if (fs.existsSync(agentDir)) {
                    fs.writeFileSync(path.join(agentDir, "USER.md"), userMdContent, "utf8");
                }
            }
            console.log("✅ All agents USER.md synced!");
        } catch (mdErr: any) {
            console.warn("⚠️ Could not sync USER.md:", mdErr.message);
        }

        // 3. Brief all key agents directly
        try {
            const { GatewayService: GS } = await import("../services/gatewayService.js");
            const gw = GS.getInstance();
            const agentBriefings = [
                { id: "atlas", msg: `Briefing: Founder is ${userProfile.name}. Build: ${userProfile.what_they_build}. Goal: ${userProfile.goal}. Tone: ${userProfile.tone}. Audience: ${userProfile.who_they_help}. Use this to initialize PB-OS orchestration.` },
                { id: "archivist", msg: `Briefing: Founder is ${userProfile.name}. Background capture is ready. Consolidate durable memory for build, audience, pain points, and goals.` },
                { id: "oracle", msg: `Briefing: Founder is ${userProfile.name}. Build: ${userProfile.what_they_build}. Audience: ${userProfile.who_they_help}. Generate audience and opportunity intelligence from this context.` },
                { id: "scribe", msg: `Briefing: Founder is ${userProfile.name}. Tone: ${userProfile.tone}. Audience: ${userProfile.who_they_help}. Write with this voice and positioning baseline.` },
                { id: "keith", msg: `Briefing: Founder is ${userProfile.name}. Audience: ${userProfile.who_they_help}. Look for communities, collaborators, and distribution opportunities.` },
                { id: "pulse", msg: `Briefing: Founder is ${userProfile.name}. Prepare to evaluate which content and positioning signals will matter most.` },
            ];
            for (const agent of agentBriefings) {
                await gw.triggerAgent(agent.id, agent.msg);
            }
            console.log("✅ All agents briefed!");
        } catch (agErr: any) {
            console.warn("⚠️ Could not brief agents:", agErr.message);
        }

        // 4. Notify Atlas via OpenClaw
        try {
            const { GatewayService } = await import("../services/gatewayService.js");
            const gateway = GatewayService.getInstance();
            await gateway.triggerAgent(
                "atlas",
                `Founder onboarding complete. Here is the profile: ${JSON.stringify(userProfile, null, 2)}. Acknowledge it and start the PB-OS project orchestration loop.`,
            );
            console.log("Atlas notified of onboarding");
        } catch (gwErr: any) {
            console.warn("Could not notify agent:", gwErr.message);
        }

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};




