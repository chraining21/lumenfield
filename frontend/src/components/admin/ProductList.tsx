"use client";

import Link from "next/link";
import { useState } from "react";
import type { Category, Product } from "@/types";

const GROUPS = [
  { type: "LIGHT_TYPE", label: "燈型" },
  { type: "SPACE", label: "空間" },
] as const;

// 搜尋型號或中英文名稱，並可依分類篩選（不放網址，後台不需要分享連結）
export default function ProductList({ products, categories }: { products: Product[]; categories: Category[] }) {
  const catName = (id: number) => categories.find((c) => c.id === id)?.name.zh;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  const keyword = q.trim().toLowerCase();
  const list = products.filter(
    (p) =>
      (!cat || p.categoryIds.includes(Number(cat))) &&
      (!keyword || [p.modelNo, p.name.zh, p.name.en].some((s) => s.toLowerCase().includes(keyword))),
  );

  const field = "border border-ink bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/40";

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 basis-56">
          <span className="label-mono mb-1 block">搜尋</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="型號或名稱"
            className={`${field} w-full`}
          />
        </label>
        <label>
          <span className="label-mono mb-1 block">分類</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className={field}>
            <option value="">全部</option>
            {GROUPS.map((g) => (
              <optgroup key={g.type} label={g.label}>
                {categories
                  .filter((c) => c.type === g.type)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.zh}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <Link
          href="/admin/products/new"
          className="ml-auto border-[1.5px] border-ink bg-ink px-4 py-2 text-sm font-medium text-bg hover:border-brand hover:bg-brand hover:text-[#1d1f22]"
        >
          ＋ 新增產品
        </Link>
      </div>

      <p className="label-mono mb-2">
        {list.length} / {products.length} 筆
      </p>
      <div className="overflow-x-auto border border-ink">
        <table className="w-full text-sm">
          <thead className="border-b border-ink bg-surface text-left">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-mono [&>th]:text-xs [&>th]:font-normal">
              <th>型號</th>
              <th>名稱</th>
              <th>分類</th>
              <th>價格</th>
              <th className="sr-only">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((p) => (
              <tr key={p.id} className="[&>td]:px-3 [&>td]:py-2.5 [&>td]:align-top">
                <td className="font-mono whitespace-nowrap">{p.modelNo}</td>
                <td className="min-w-40">
                  {p.name.zh}
                  <span className="block text-xs text-muted">{p.name.en}</span>
                </td>
                <td className="min-w-40 text-xs text-muted">{p.categoryIds.map(catName).join("、")}</td>
                {/* 後台看得到不公開的價格，另外標示前台顯示「詢價」 */}
                <td className="font-mono whitespace-nowrap">
                  {p.price != null ? `NT$ ${p.price.toLocaleString("en-US")}` : "—"}
                  {!p.priceVisible && <span className="block font-sans text-xs text-muted">前台顯示詢價</span>}
                </td>
                <td className="text-right whitespace-nowrap">
                  <Link href={`/admin/products/${p.id}`} className="font-mono text-xs hover:underline">
                    編輯 →
                  </Link>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-muted">
                  沒有符合的產品
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
