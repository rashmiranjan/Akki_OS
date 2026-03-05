import { Request, Response } from "express";
import { convex, convexApi } from "../lib/convexClient";

/** GET /api/v1/activity */
export const getActivity = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || "local-user";
  try {
    const items = await convex.query(convexApi.activity.list, { userId });
    const normalized = items.map((item: any) => ({
      ...item,
      id: item._id || item.id,
      created_at: item._creationTime
        ? new Date(item._creationTime).toISOString()
        : new Date().toISOString(),
    }));
    res.json({ success: true, items: normalized, total: normalized.length });
  } catch (error: any) {
    console.error("[Activity] getActivity error:", error.message);
    res.json({ success: true, items: [], total: 0 });
  }
};

/** POST /api/v1/activity - ingest adapter for webhook events */
export const ingestActivity = async (req: Request, res: Response) => {
  const body = req.body || {};
  const userId =
    (req as any).user?.id || body.user_id || body.userId || "local-user";
  const agent = body.agent || "system";
  const action = body.action || "message";

  try {
    const tableHint = String(body.table || "").toLowerCase();
    const draftLikeAction =
      action.includes("draft") || action.includes("post_pending");

    if (tableHint === "drafts" || body.content || draftLikeAction) {
      const content = body.content || body.message || "";
      if (!content) {
        return res
          .status(400)
          .json({ success: false, error: "content or message is required" });
      }
      const platform = body.platform || "linkedin";
      const draft = await convex.mutation(convexApi.drafts.create, {
        userId,
        agent,
        content,
        platform,
      });
      await logActivity(
        userId,
        agent,
        "draft_ingested",
        `Draft queued (${platform})`
      );
      return res.json({ success: true, type: "draft", item: draft });
    }

    const message =
      body.message ||
      (typeof body === "string" ? body : JSON.stringify(body, null, 0));
    const id = await convex.mutation(convexApi.activity.log, {
      userId,
      agent,
      action,
      message,
    });
    return res.json({ success: true, type: "activity", id });
  } catch (error: any) {
    console.error("[Activity] ingestActivity error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/** Called by other controllers to log agent actions to Convex. */
export const logActivity = async (
  userId: string,
  agent: string,
  action: string,
  message: string
): Promise<void> => {
  try {
    await convex.mutation(convexApi.activity.log, {
      userId,
      agent,
      action,
      message,
    });
  } catch (e: any) {
    console.error("[Activity] logActivity failed:", e.message);
  }
};
