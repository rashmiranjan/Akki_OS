import { Request, Response } from "express";
import { checkUpgrade, getUpgradeStatus, runUpgrade } from "../services/systemUpgradeService";

export const postUpgradeCheck = async (_req: Request, res: Response) => {
  try {
    const data = await checkUpgrade();
    return res.json({ success: true, ...data });
  } catch (err: any) {
    return res.status(502).json({ success: false, error: err?.message || "Upgrade check failed" });
  }
};

export const postUpgradeRun = async (req: Request, res: Response) => {
  const pullLatest = Boolean(req.body?.pullLatest);
  try {
    const data = await runUpgrade(pullLatest);
    return res.status(202).json({ success: true, ...data });
  } catch (err: any) {
    return res.status(502).json({ success: false, error: err?.message || "Upgrade run failed" });
  }
};

export const getUpgradeJobStatus = async (req: Request, res: Response) => {
  const jobId = req.params.id;
  if (!jobId) {
    return res.status(400).json({ success: false, error: "Missing job id" });
  }

  try {
    const data = await getUpgradeStatus(jobId);
    return res.json({ success: true, ...data });
  } catch (err: any) {
    const status = err?.response?.status || 502;
    return res.status(status).json({ success: false, error: err?.message || "Upgrade status failed" });
  }
};
