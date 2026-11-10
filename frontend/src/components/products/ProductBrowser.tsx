"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/localized";
import { formatPrice, lightTypeOf } from "@/lib/product";
import type { Category, Product } from "@/types";
import AddToInquiry from "./AddToInquiry";
import ProductVisual from "./ProductVisual";

type Tab = "type" | "space";
type Props = { products: Product[]; categories: Category[] };

// 讀網址參數 ?tab=type|space&category=slug；篩選放網址才能分享連結、上一頁保留狀態
export default function ProductBrowser(props: Props) {
  const params = useSearchParams();
  return (
    <ProductBrowserView
      {...props}
      tab={params.get("tab") === "space" ? "space" : "type"}
      category={params.get("category")}
    />
  );
}

// 預渲染時（還拿不到網址參數）也用這個，先輸出全部產品
export function ProductBrowserView({
  products,
  categories,
  tab = "type",
  category = null,
}: Props & { tab?: Tab; category?: string | null }) {
  const t = useTranslations("Products");
  const locale = useLocale();

  const tabCategories = categories
    .filter((c) => c.type === (tab === "space" ? "SPACE" : "LIGHT_TYPE"))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const current = tabCategories.find((c) => c.slug === category);
  const list = current ? products.filter((p) => p.categoryIds.includes(current.id)) : products;

  const href = (query: Record<string, string>) => ({ pathname: "/products" as const, query });
  const tabClass = (active: boolean) =>
    `block px-5 py-2.5 text-sm font-medium ${active ? "bg-ink text-bg" : "hover:bg-highlight"}`;
  const chipClass = (active: boolean) =>
    `block border border-ink px-3 py-1.5 ${active ? "bg-ink text-bg" : "hover:bg-ink hover:text-bg"}`;

  return (
    <>
      <nav className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <ul className="flex divide-x divide-ink border border-ink">
          {(["type", "space"] as const).map((k) => (
            <li key={k}>
              <Link
                href={href({ tab: k })}
                scroll={false}
                aria-current={tab === k ? "page" : undefined}
                className={tabClass(tab === k)}
              >
                {t(k === "type" ? "tabType" : "tabSpace")}
              </Link>
            </li>
          ))}
        </ul>
        <span className="label-mono">{t("count", { count: list.length })}</span>
      </nav>

      <ul className="mb-8 flex flex-wrap gap-2 font-mono text-xs">
        <li>
          <Link href={href({ tab })} scroll={false} className={chipClass(!current)}>
            {t("all")}
          </Link>
        </li>
        {tabCategories.map((c) => (
          <li key={c.slug}>
            <Link href={href({ tab, category: c.slug })} scroll={false} className={chipClass(current?.id === c.id)}>
              {localized(c.name, locale)}
            </Link>
          </li>
        ))}
      </ul>

      {list.length ? (
        <ul className="grid gap-6 min-[640px]:grid-cols-2 min-[900px]:grid-cols-3">
          {list.map((p) => (
            <li key={p.slug} className="flex flex-col border border-ink bg-bg">
              <Link href={`/products/${p.slug}`} className="group block">
                <ProductVisual
                  src={p.images[0]?.url}
                  alt={localized(p.name, locale)}
                  lightTypeId={lightTypeOf(p, categories)}
                  className="border-b border-ink transition-colors group-hover:bg-highlight"
                />
                <div className="px-4 pt-3 pb-4">
                  <span className="font-mono text-[13px] text-muted">{p.modelNo}</span>
                  <h3 className="mt-1 font-medium group-hover:underline">{localized(p.name, locale)}</h3>
                </div>
              </Link>
              <div className="mt-auto flex items-center justify-between border-t border-dashed border-line px-4 py-3">
                <span className="font-mono">{formatPrice(p) ?? t("ask")}</span>
                <AddToInquiry slug={p.slug} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border border-dashed border-muted p-10 text-center">
          <p className="text-muted">{t("empty")}</p>
          <Link href={href({ tab })} scroll={false} className="label-mono mt-3 inline-block hover:text-ink">
            {t("showAll")} →
          </Link>
        </div>
      )}
    </>
  );
}
