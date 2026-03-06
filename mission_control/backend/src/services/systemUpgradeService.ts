import axios from "axios";

const baseUrl = process.env.UPDATER_URL || "http://host.docker.internal:3010";
const token = process.env.UPDATER_TOKEN || process.env.OPENCLAW_TOKEN || "";

const headers = () => ({
  "x-updater-token": token,
  "content-type": "application/json",
});

export async function checkUpgrade(): Promise<any> {
  const res = await axios.post(`${baseUrl}/api/v1/system/upgrade/check`, {}, { headers: headers(), timeout: 30_000 });
  return res.data;
}

export async function runUpgrade(pullLatest: boolean): Promise<any> {
  const res = await axios.post(
    `${baseUrl}/api/v1/system/upgrade/run`,
    { pullLatest },
    { headers: headers(), timeout: 30_000 },
  );
  return res.data;
}

export async function getUpgradeStatus(jobId: string): Promise<any> {
  const res = await axios.get(`${baseUrl}/api/v1/system/upgrade/status/${jobId}`, {
    headers: headers(),
    timeout: 30_000,
  });
  return res.data;
}
