"use client";

import { useTranslations } from "next-intl";

export default function ThemeToggle() {
  const t = useTranslations("Theme");

  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  // 圖示與說明文字由 CSS 依 data-theme 切換，伺服器與瀏覽器輸出一致
  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-8 place-items-center border border-line hover:border-ink"
    >
      <svg
        viewBox="0 0 16 16"
        className="size-4 dark:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        aria-hidden
      >
        <path d="M13 9.5A5.5 5.5 0 1 1 6.5 3a4.5 4.5 0 0 0 6.5 6.5Z" />
      </svg>
      <svg
        viewBox="0 0 16 16"
        className="hidden size-4 dark:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        aria-hidden
      >
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6 13 13M3 13l1.4-1.4M11.6 4.4 13 3" />
      </svg>
      <span className="sr-only dark:hidden">{t("toDark")}</span>
      <span className="sr-only hidden dark:inline">{t("toLight")}</span>
    </button>
  );
}
