import { cacheLife, cacheTag } from "next/cache";
import type { Category, Product, Project } from "@/types";

// 後端位址；本機預設 Spring Boot 的 8080，部署時以環境變數 API_URL 指定
export const API_URL = process.env.API_URL ?? "http://localhost:8080";

// 呼叫後端的唯一出口：部署時帶上和後端共用的密鑰（BACKEND_TOKEN），後端沒收到就拒絕，
// 外人無法繞過 Next 直接打後端 API。本機沒設定就不帶
export function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (process.env.BACKEND_TOKEN) headers.set("X-Internal-Token", process.env.BACKEND_TOKEN);
  return fetch(`${API_URL}${path}`, { ...init, headers });
}

// 前台資料快取到後台存檔為止：後台在 Server Action 以 updateTag(TAGS.xxx) 清掉，下一個請求就拿新資料
export const TAGS = { categories: "categories", products: "products", projects: "projects" } as const;

async function get<T>(path: string): Promise<T | null> {
  const res = await backendFetch(path);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function getList<T>(path: string): Promise<T[]> {
  return (await get<T[]>(path)) ?? [];
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.categories);
  return getList<Category>("/api/categories");
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.products);
  return getList<Product>("/api/products");
}

export async function getProduct(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.products);
  return get<Product>(`/api/products/${encodeURIComponent(slug)}`);
}

// 年份新到舊（後端已排序）
export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.projects);
  return getList<Project>("/api/projects");
}

export async function getProject(slug: string): Promise<Project | null> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.projects);
  return get<Project>(`/api/projects/${encodeURIComponent(slug)}`);
}
