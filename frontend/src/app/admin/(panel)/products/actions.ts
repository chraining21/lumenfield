"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { adminFetch } from "@/lib/admin-api";
import { TAGS } from "@/lib/api";
import type { LocalizedText, ProductFileKind } from "@/types";

// 對應後端 ProductRequest：整份送出，照片、檔案、分類整批取代
export type ProductPayload = {
  slug: string;
  modelNo: string;
  name: LocalizedText;
  wattage: string;
  colorTemperature: string;
  dimensions: string;
  ipRating: string;
  price: number | null;
  priceVisible: boolean;
  categoryIds: number[];
  images: { url: string }[];
  applicationImages: { url: string }[];
  files: { kind: ProductFileKind; url: string; fileName: string; sizeBytes?: number }[];
};

export type SaveError = { error: "slug" | "modelNo" | "invalid" | "failed" };

// 成功：清掉前台產品快取（下一個請求就是新資料）並回列表；失敗回傳原因給表單顯示
export async function saveProduct(id: number | null, payload: ProductPayload): Promise<SaveError | undefined> {
  const res = await adminFetch(id == null ? "/api/admin/products" : `/api/admin/products/${id}`, {
    method: id == null ? "POST" : "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 409) {
    const { detail } = (await res.json()) as { detail?: string };
    return { error: detail === "modelNo" ? "modelNo" : "slug" };
  }
  if (res.status === 400) return { error: "invalid" };
  if (!res.ok) return { error: "failed" };

  updateTag(TAGS.products);
  redirect("/admin/products");
}
