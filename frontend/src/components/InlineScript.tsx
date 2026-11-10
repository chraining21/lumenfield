"use client";

// 伺服器輸出可執行的 script，瀏覽器端改成 text/plain，避免 React 的 script 警告
// 參考：next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
export default function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
