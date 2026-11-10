"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { adminFetch } from "@/lib/admin-api";
import { TAGS } from "@/lib/api";
import type { CountyCode, LocalizedText } from "@/types";

// 對應後端 ProjectRequest：整份送出，照片、分類整批取代
export type ProjectPayload = {
  slug: string;
  title: LocalizedText;
  description: LocalizedText; // 兩個都空代表沒有說明
  year: number;
  location: LocalizedText;
  countyCode: CountyCode;
  latitude: number | null;
  longitude: number | null;
  categoryIds: number[];
  images: { url: string }[];
};

export type SaveError = { error: "slug" | "invalid" | "failed" };

// 成功：清掉前台案例快取並回列表；失敗回傳原因給表單顯示
export async function saveProject(id: number | null, payload: ProjectPayload): Promise<SaveError | undefined> {
  const res = await adminFetch(id == null ? "/api/admin/projects" : `/api/admin/projects/${id}`, {
    method: id == null ? "POST" : "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 409) return { error: "slug" };
  if (res.status === 400) return { error: "invalid" };
  if (!res.ok) return { error: "failed" };

  updateTag(TAGS.projects);
  redirect("/admin/projects");
}
