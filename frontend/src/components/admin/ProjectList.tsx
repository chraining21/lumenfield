"use client";

import Link from "next/link";
import { useState } from "react";
import { COUNTIES } from "@/data/taiwan-map";
import type { Category, Project } from "@/types";

const countyName = (code: string) => COUNTIES.find((c) => c.code === code)?.name.zh;

// 搜尋中英文標題或地點，並可依案例分類篩選；年份新到舊
export default function ProjectList({ projects, categories }: { projects: Project[]; categories: Category[] }) {
  const catName = (id: number) => categories.find((c) => c.id === id)?.name.zh;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  const keyword = q.trim().toLowerCase();
  const list = projects
    .filter(
      (p) =>
        (!cat || p.categoryIds.includes(Number(cat))) &&
        (!keyword ||
          [p.title.zh, p.title.en, p.location.zh, p.location.en].some((s) => s.toLowerCase().includes(keyword))),
    )
    .sort((a, b) => b.year - a.year);

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
            placeholder="標題或地點"
            className={`${field} w-full`}
          />
        </label>
        <label>
          <span className="label-mono mb-1 block">分類</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className={field}>
            <option value="">全部</option>
            {categories
              .filter((c) => c.type === "PROJECT")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.zh}
                </option>
              ))}
          </select>
        </label>
        <Link
          href="/admin/projects/new"
          className="ml-auto border-[1.5px] border-ink bg-ink px-4 py-2 text-sm font-medium text-bg hover:border-brand hover:bg-brand hover:text-[#1d1f22]"
        >
          ＋ 新增案例
        </Link>
      </div>

      <p className="label-mono mb-2">
        {list.length} / {projects.length} 筆
      </p>
      <div className="overflow-x-auto border border-ink">
        <table className="w-full text-sm">
          <thead className="border-b border-ink bg-surface text-left">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-mono [&>th]:text-xs [&>th]:font-normal [&>th]:whitespace-nowrap">
              <th>年份</th>
              <th>標題</th>
              <th>分類</th>
              <th>地點</th>
              <th>照片</th>
              <th className="sr-only">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((p) => (
              <tr key={p.id} className="[&>td]:px-3 [&>td]:py-2.5 [&>td]:align-top">
                <td className="font-mono">{p.year}</td>
                <td className="min-w-56">
                  {p.title.zh}
                  <span className="block text-xs text-muted">{p.title.en}</span>
                </td>
                <td className="min-w-32 text-xs text-muted">{p.categoryIds.map(catName).join("、")}</td>
                <td className="min-w-28 text-xs">
                  {countyName(p.countyCode)}
                  <span className="block text-muted">{p.latitude != null ? "有座標" : "無座標"}</span>
                </td>
                <td className="font-mono">{p.images.length}</td>
                <td className="text-right whitespace-nowrap">
                  <Link href={`/admin/projects/${p.id}`} className="font-mono text-xs hover:underline">
                    編輯 →
                  </Link>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-muted">
                  沒有符合的案例
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
