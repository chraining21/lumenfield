"use server";

import { backendFetch } from "@/lib/api";
import type { DataLocale } from "@/types";

export type InquiryInput = {
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  message: string;
  locale: DataLocale;
  items: { productId: number; quantity: number }[];
};

// busy：太多人同時送出（後端限量，回 429）
export type InquiryResult = { ok: true; inquiryNo: string } | { ok: false; busy?: boolean };

// 由 Next 伺服器轉送到後端：瀏覽器不直接連後端，不用處理跨網域；輸入檢查以後端為準
export async function submitInquiry(input: InquiryInput): Promise<InquiryResult> {
  try {
    const res = await backendFetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
