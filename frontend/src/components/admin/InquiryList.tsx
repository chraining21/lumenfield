"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDateTime, LOCALE_LABEL, totalQuantity } from "@/lib/inquiry";
import type { Inquiry } from "@/types";

// 搜尋編號、聯絡人、公司或 Email；新到舊
export default function InquiryList({ inquiries }: { inquiries: Inquiry[] }) {
  const [q, setQ] = useState("");

  const keyword = q.trim().toLowerCase();
  const list = inquiries
    .filter(
      (i) =>
        !keyword ||
        [i.inquiryNo, i.contactName, i.companyName ?? "", i.email].some((s) => s.toLowerCase().includes(keyword)),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <label className="mb-4 block max-w-md">
        <span className="label-mono mb-1 block">搜尋</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="編號、聯絡人、公司或 Email"
          className="w-full border border-ink bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/40"
        />
      </label>

      <p className="label-mono mb-2">
        {list.length} / {inquiries.length} 筆
      </p>
      <div className="overflow-x-auto border border-ink">
        <table className="w-full text-sm">
          <thead className="border-b border-ink bg-surface text-left">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-mono [&>th]:text-xs [&>th]:font-normal [&>th]:whitespace-nowrap">
              <th>送出時間</th>
              <th>編號</th>
              <th>聯絡人</th>
              <th>產品</th>
              <th>語系</th>
              <th className="sr-only">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((i) => (
              <tr key={i.id} className="[&>td]:px-3 [&>td]:py-2.5 [&>td]:align-top">
                <td className="font-mono text-xs whitespace-nowrap">{formatDateTime(i.createdAt)}</td>
                <td className="font-mono text-xs whitespace-nowrap">{i.inquiryNo}</td>
                <td className="min-w-40">
                  {i.contactName}
                  {i.companyName && <span className="block text-xs text-muted">{i.companyName}</span>}
                </td>
                <td className="min-w-32 text-xs">
                  {i.items.length} 項 · 共 {totalQuantity(i)} 件
                  <span className="block text-muted">{i.items.map((x) => x.modelNoSnapshot).join("、")}</span>
                </td>
                <td className="text-xs whitespace-nowrap">{LOCALE_LABEL[i.locale]}</td>
                <td className="text-right whitespace-nowrap">
                  <Link href={`/admin/inquiries/${i.id}`} className="font-mono text-xs hover:underline">
                    查看 →
                  </Link>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-muted">
                  沒有符合的詢價
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
