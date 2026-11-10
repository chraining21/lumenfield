import type { ReactNode } from "react";

// 頁面外框（PageShell、PageHeader）＋虛線佔位框（目前只剩載入中畫面使用）
export type Block = {
  code: string; // 區塊名稱，如 "HERO"
  source?: string; // 資料來源，對應 SITEMAP 的代號
  height?: string; // Tailwind 高度 class
  children?: ReactNode;
};

export function Placeholder({ code, source, height = "h-40", children }: Block) {
  return (
    <div className={`relative flex flex-col items-center justify-center gap-2 border border-dashed border-muted bg-surface/60 p-10 ${height}`}>
      <span className="label-mono absolute top-2 left-3">{code}</span>
      {source && <span className="label-mono absolute right-3 bottom-2">SRC: {source}</span>}
      {children}
    </div>
  );
}

export function PageHeader({ title, label }: { title: string; label: string }) {
  return (
    <div className="mb-10 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b-2 border-ink pb-3">
      <h1 className="text-[clamp(28px,4vw,44px)] font-bold tracking-wide">{title}</h1>
      <span className="label-mono ml-auto">{label}</span>
    </div>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="wrap flex-1 pt-14">{children}</main>;
}
