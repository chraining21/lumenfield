import type { Inquiry } from "@/types";

// 固定用台灣時間顯示，伺服器與瀏覽器結果一致，例：2026-11-03 08:51
const dateTime = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(iso: string) {
  return dateTime.format(new Date(iso));
}

export function totalQuantity(inq: Inquiry) {
  return inq.items.reduce((sum, i) => sum + i.quantity, 0);
}

export const LOCALE_LABEL = { zh: "中文", en: "英文" } as const;
