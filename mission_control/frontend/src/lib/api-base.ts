export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) {
    throw new Error("NEXT_PUBLIC_API_URL is not set.");
  }
  const normalized = raw.replace(/\/+$/, "");
  if (!normalized) {
    throw new Error("NEXT_PUBLIC_API_URL is invalid.");
  }
  return normalized;
}
