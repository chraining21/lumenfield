"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useInquiryCart } from "@/lib/inquiry-cart";

// 導覽列的詢價按鈕；件數＝清單中的產品項數
export default function InquiryLink() {
  const t = useTranslations("Nav");
  const count = useInquiryCart().length;

  return (
    <Link
      href="/inquiry"
      aria-label={t("inquiryCount", { count })}
      className="bg-brand px-2.5 py-1 font-medium whitespace-nowrap text-[#1d1f22]"
    >
      {t("inquiry")} [{count}]
    </Link>
  );
}
