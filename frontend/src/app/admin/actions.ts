"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminFetch } from "@/lib/admin-api";
import { ADMIN_COOKIE } from "@/lib/admin-cookie";
import { backendFetch } from "@/lib/api";

export type LoginState = { error?: "invalid" | "locked" | "failed" };

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  // 只送到後台頁面（Server Action 也是 POST 到所在頁面的網址）
  path: "/admin",
} as const;

// 帳密交給後端驗證；成功後把後端給的 Session ID 存成 httpOnly cookie
export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  let res: Response;
  try {
    res = await backendFetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
    });
  } catch {
    return { error: "failed" };
  }
  if (res.status === 401 || res.status === 400) return { error: "invalid" };
  if (res.status === 429) return { error: "locked" };
  const sessionId = res.headers
    .getSetCookie()
    .map((c) => /^JSESSIONID=([^;]+)/.exec(c)?.[1])
    .find(Boolean);
  if (!res.ok || !sessionId) return { error: "failed" };

  (await cookies()).set(ADMIN_COOKIE, sessionId, COOKIE_OPTIONS);
  redirect("/admin");
}

export async function logout() {
  // 後端 Session 先作廢；就算後端連不上，也照樣清掉本地 cookie
  await adminFetch("/api/admin/logout", { method: "POST" }).catch(() => {});
  (await cookies()).delete({ name: ADMIN_COOKIE, path: COOKIE_OPTIONS.path });
  redirect("/admin/login");
}
