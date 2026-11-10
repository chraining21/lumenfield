import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/admin-cookie";
import { backendFetch } from "@/lib/api";
import type { Inquiry, Product, Project } from "@/types";

// 後台呼叫後端的唯一入口：帶上登入 Session；沒登入或 Session 過期（401）就回登入頁。
// 權限一律由後端驗證（ADR-001 §6），這裡只負責轉送
export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const sessionId = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!sessionId) redirect("/admin/login");
  const headers = new Headers(init.headers);
  headers.set("Cookie", `JSESSIONID=${sessionId}`);
  const res = await backendFetch(path, { ...init, headers, cache: "no-store" });
  if (res.status === 401) redirect("/admin/login");
  return res;
}

async function getJson<T>(path: string): Promise<T | null> {
  const res = await adminFetch(path);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

// 後台看得到不公開的價格；不快取，每次都向後端拿最新的
export async function getAdminProducts(): Promise<Product[]> {
  return (await getJson<Product[]>("/api/admin/products")) ?? [];
}

export async function getAdminProduct(id: number): Promise<Product | null> {
  return Number.isInteger(id) ? getJson<Product>(`/api/admin/products/${id}`) : null;
}

// 年份新到舊（後端已排序）
export async function getAdminProjects(): Promise<Project[]> {
  return (await getJson<Project[]>("/api/admin/projects")) ?? [];
}

export async function getAdminProject(id: number): Promise<Project | null> {
  return Number.isInteger(id) ? getJson<Project>(`/api/admin/projects/${id}`) : null;
}

// 新到舊（後端已排序）
export async function getAdminInquiries(): Promise<Inquiry[]> {
  return (await getJson<Inquiry[]>("/api/admin/inquiries")) ?? [];
}

export async function getAdminInquiry(id: number): Promise<Inquiry | null> {
  return Number.isInteger(id) ? getJson<Inquiry>(`/api/admin/inquiries/${id}`) : null;
}

// role：ADMIN 可讀寫；VIEWER 是公開 demo 用的唯讀帳號
export async function getCurrentAdmin(): Promise<{ username: string; role: "ADMIN" | "VIEWER" }> {
  const res = await adminFetch("/api/admin/me");
  if (!res.ok) throw new Error(`GET /api/admin/me failed: ${res.status}`);
  return res.json();
}
