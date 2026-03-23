import { GatewayService } from "./gatewayService";

const gatewayService = GatewayService.getInstance();
const LOCAL_USER_ID = "local-user";

export const initCronJobs = () => {
  console.log("--- AKKI PB-OS Autonomous Cron System Initialized ---");

  setInterval(async () => {
    console.log("[Cron] Triggering Atlas orchestration cycle...");
    await gatewayService.triggerAgent(
      "atlas",
      "Run a PB-OS orchestration check. Review project stage, blockers, missing artifacts, and next specialist handoffs.",
      LOCAL_USER_ID,
    );
  }, 6 * 60 * 60 * 1000);

  setInterval(async () => {
    console.log("[Cron] Triggering Archivist memory cycle...");
    await gatewayService.triggerAgent(
      "archivist",
      "Review the latest founder, product, and project context. Capture missing durable memory and summarize what changed.",
      LOCAL_USER_ID,
    );
  }, 12 * 60 * 60 * 1000);

  setInterval(async () => {
    console.log("[Cron] Triggering Oracle audience scan...");
    await gatewayService.triggerAgent(
      "oracle",
      "Scan for fresh audience signals, objections, and trend shifts relevant to the active PB-OS projects.",
      LOCAL_USER_ID,
    );
  }, 8 * 60 * 60 * 1000);

  setInterval(async () => {
    console.log("[Cron] Triggering Scribe content sprint...");
    await gatewayService.triggerAgent(
      "scribe",
      "Review active positioning and ideas, then draft the next highest-priority content assets for review.",
      LOCAL_USER_ID,
    );
  }, 24 * 60 * 60 * 1000);

  setInterval(async () => {
    console.log("[Cron] Triggering Keith distribution loop...");
    await gatewayService.triggerAgent(
      "keith",
      "Review collaboration pipeline and distribution opportunities. Surface the next best conversations to enter.",
      LOCAL_USER_ID,
    );
  }, 8 * 60 * 60 * 1000);

  setInterval(async () => {
    console.log("[Cron] Triggering Sentinel monitoring loop...");
    await gatewayService.triggerAgent(
      "sentinel",
      "Review performance and discourse signals. Flag changes in resonance, topic movement, and narrative effectiveness.",
      LOCAL_USER_ID,
    );
  }, 6 * 60 * 60 * 1000);

  setInterval(async () => {
    console.log("[Cron] Triggering Pulse iteration review...");
    await gatewayService.triggerAgent(
      "pulse",
      "Analyze recent outcomes and recommend strategic adjustments for the next PB-OS cycle.",
      LOCAL_USER_ID,
    );
  }, 12 * 60 * 60 * 1000);

  console.log("✅ All PB-OS cron jobs scheduled!");
  console.log("  Atlas: 6h | Archivist: 12h | Oracle: 8h | Scribe: 24h");
  console.log("  Keith: 8h | Sentinel: 6h | Pulse: 12h");
};
