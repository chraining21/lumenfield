"use server";

import { API_URL } from "@/lib/api";
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

export type InquiryResult = { ok: true; inquiryNo: string } | { ok: false };

// 由 Next 伺服器轉送到後端：瀏覽器不直接連後端，不用處理跨網域；輸入檢查以後端為準
export async function submitInquiry(input: InquiryInput): Promise<InquiryResult> {
  try {
    const res = await fetch(`${API_URL}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return { ok: false };
    const { inquiryNo } = (await res.json()) as { inquiryNo: string };
    return { ok: true, inquiryNo };
  } catch {
    return { ok: false };
  }
}
