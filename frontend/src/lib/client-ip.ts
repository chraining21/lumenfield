import { headers } from "next/headers";

// 後端只看得到 Next 伺服器的 IP；登入鎖定、詢價限量要依訪客計次，所以把訪客 IP 轉給後端。
// Vercel 會覆寫 x-forwarded-for，訪客無法偽造；後端也只在內部密鑰正確時才採信 X-Client-IP
export async function clientIpHeader(): Promise<Record<string, string>> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip");
  return ip ? { "X-Client-IP": ip } : {};
}
