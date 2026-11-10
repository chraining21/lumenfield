"use server";

import { backendFetch } from "@/lib/api";
import { clientIpHeader } from "@/lib/client-ip";
import type { DataLocale } from "@/types";

export type InquiryInput = {
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  message: string;
  locale: DataLocale;
  items: { productId: number; quantity: number }[];
  // honeypot：畫面上看不到的欄位，真人不會填；有值就是機器人
  website?: string;
};

// busy：太多人同時送出（後端限量，回 429）
export type InquiryResult = { ok: true; inquiryNo: string } | { ok: false; busy?: boolean };

// 由 Next 伺服器轉送到後端：瀏覽器不直接連後端，不用處理跨網域；輸入檢查以後端為準
export async function submitInquiry({ website, ...input }: InquiryInput): Promise<InquiryResult> {
  // 機器人：假裝送出成功，不存進資料庫，也不讓它知道被擋
  if (website) return { ok: true, inquiryNo: fakeInquiryNo() };
  try {
    const res = await backendFetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await clientIpHeader()) },
      body: JSON.stringify(input),
    });
    if (res.status === 429) return { ok: false, busy: true };
    if (!res.ok) return { ok: false };
    const { inquiryNo } = (await res.json()) as { inquiryNo: string };
    return { ok: true, inquiryNo };
  } catch {
    return { ok: false };
  }
}

function fakeInquiryNo() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `INQ-${date}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
}
