"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { addToCart } from "@/lib/inquiry-cart";

// 加入詢價清單；加入後按鈕短暫顯示「已加入」，詳細頁另外出現前往清單的連結
export default function AddToInquiry({ slug, withQty = false }: { slug: string; withQty?: boolean }) {
  const t = useTranslations("Products");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [added]);

  const add = () => {
    addToCart(slug, withQty ? qty : 1);
    setAdded(true);
  };

  if (!withQty) {
    return (
      <button
        type="button"
        onClick={add}
        aria-live="polite"
        className={`border border-ink px-2.5 py-1 font-mono text-xs whitespace-nowrap hover:bg-brand hover:text-[#1d1f22] ${
          added ? "bg-brand text-[#1d1f22]" : ""
        }`}
      >
        {added ? t("added") : t("add")}
      </button>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex items-stretch border border-ink font-mono">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 hover:bg-highlight"
            aria-label="−1"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            aria-label={t("qty")}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="w-14 [appearance:textfield] border-x border-ink bg-transparent text-center [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button type="button" onClick={() => setQty((q) => q + 1)} className="px-3 hover:bg-highlight" aria-label="+1">
            +
          </button>
        </div>
        <button
          type="button"
          onClick={add}
          className="border-[1.5px] border-ink bg-ink px-5.5 py-3 text-sm font-medium text-bg transition-colors hover:border-brand hover:bg-brand hover:text-[#1d1f22]"
        >
          {t("addToInquiry")} →
        </button>
      </div>
      <p aria-live="polite" className="min-h-6 text-sm">
        {added && (
          <>
            <span className="mr-3">{t("added")}</span>
            <Link href="/inquiry" className="underline underline-offset-4">
              {t("goToList")}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
