import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/admin-cookie";
import { API_URL } from "@/lib/api";

// 後台上傳：轉送給後端 /api/admin/uploads（後端檢查登入、檔案類型與大小）。
// 用 Route Handler 而不用 Server Action：Server Action 的大小上限是全站共用的，
// 放寬會連前台公開的 Action 一起放寬；這條路徑也不經 proxy.ts（proxy 最多只暫存 10MB）
export async function POST(request: Request) {
  const sessionId = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!sessionId) return Response.json({ error: "unauthorized" }, { status: 401 });

  // 原樣串流給後端，不把整個檔案讀進記憶體
  const res = await fetch(`${API_URL}/api/admin/uploads`, {
    method: "POST",
    headers: { Cookie: `JSESSIONID=${sessionId}`, "Content-Type": request.headers.get("content-type") ?? "" },
    body: request.body,
    duplex: "half",
  } as RequestInit);
  const body = res.headers.get("content-type")?.includes("json") ? await res.json() : {};
  return Response.json(body, { status: res.status });
}
