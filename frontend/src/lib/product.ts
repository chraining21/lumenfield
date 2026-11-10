import type { Category, Product } from "@/types";

// 不公開價格時回傳 null，由畫面顯示「詢價」
export function formatPrice(p: Product): string | null {
  return p.priceVisible && p.price != null ? `NT$ ${p.price.toLocaleString("en-US")}` : null;
}

// 產品的燈型分類（示意圖依此決定）
export function lightTypeOf(p: Product, categories: Category[]): number | undefined {
  return p.categoryIds.find((id) => categories.some((c) => c.id === id && c.type === "LIGHT_TYPE"));
}

export function fileSize(bytes?: number) {
  if (bytes == null) return "—";
  return bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.ceil(bytes / 1000)} KB`;
}
