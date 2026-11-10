"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/admin/actions";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const NAV = [
  { href: "/admin", code: "00", label: "總覽" },
  { href: "/admin/products", code: "01", label: "產品" },
  { href: "/admin/projects", code: "02", label: "案例" },
  { href: "/admin/inquiries", code: "03", label: "詢價" },
];

type Props = { user: React.ReactNode; children: React.ReactNode };

// 後台外框：桌機左側選單，手機改成頂列＋展開選單。登入檢查在 proxy.ts 與後端，不在這裡
export default function AdminShell({ user, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav aria-label="後台選單">
      <ul className="divide-y divide-line border-y border-line">
        {NAV.map((n) => (
          <li key={n.href}>
            <Link
              href={n.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={`flex items-center gap-3 px-4 py-3 text-sm ${
                isActive(n.href) ? "bg-ink text-bg" : "hover:bg-highlight"
              }`}
            >
              <span className="font-mono text-[11px] opacity-60">{n.code}</span>
              {n.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  const tools = (
    <div className="flex items-center justify-between gap-2 px-4 py-4 font-mono text-xs">
      <a href="/zh-TW" target="_blank" rel="noreferrer" className="hover:underline">
        前台 ↗
      </a>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <form action={logout}>
          <button type="submit" className="border border-ink px-2.5 py-1.5 hover:bg-ink hover:text-bg">
            登出
          </button>
        </form>
      </div>
    </div>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5 font-bold tracking-[.12em] whitespace-nowrap">
      <Logo size={24} />
      明野後台
    </Link>
  );

  return (
    <div className="min-[900px]:grid min-[900px]:grid-cols-[220px_minmax(0,1fr)]">
      {/* 桌機：左側選單 */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-ink bg-bg min-[900px]:flex">
        <div className="px-4 py-5">
          {brand}
          <p className="label-mono mt-1">ADMIN CONSOLE</p>
          <p className="mt-3 font-mono text-xs">{user}</p>
        </div>
        {nav}
        <div className="mt-auto border-t border-line">{tools}</div>
      </aside>

      {/* 手機：頂列＋展開選單 */}
      <header className="sticky top-0 z-20 border-b border-ink bg-bg min-[900px]:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          {brand}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="admin-menu"
            aria-label={open ? "關閉選單" : "開啟選單"}
            className="grid size-8 place-items-center border border-ink"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
              {open ? <path d="M3 3l10 10M13 3 3 13" /> : <path d="M2 4h12M2 8h12M2 12h12" />}
            </svg>
          </button>
        </div>
        {open && (
          <div id="admin-menu" className="absolute inset-x-0 top-full border-b border-ink bg-bg">
            {nav}
            {tools}
          </div>
        )}
      </header>

      <main className="min-w-0 px-4 py-8 min-[900px]:px-10 min-[900px]:py-10">{children}</main>
    </div>
  );
}
