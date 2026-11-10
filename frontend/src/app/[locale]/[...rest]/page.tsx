import { notFound } from "next/navigation";

// 這頁一定丟 404，沒有可預先渲染的內容，關掉 instant 驗證
export const instant = false;

// 語系底下不存在的網址都交給 [locale]/not-found.tsx
export default function CatchAllPage() {
  notFound();
}
