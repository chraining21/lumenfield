"use client";

import { useState, type ReactNode } from "react";
import NavLinks from "./NavLinks";

type Props = {
  labels: Parameters<typeof NavLinks>[0]["labels"];
  openLabel: string;
  closeLabel: string;
  children: ReactNode;
};

// 900px 以下：漢堡按鈕，選單從導覽列下方展開
export default function MobileMenu({ labels, openLabel, closeLabel, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-[900px]:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? closeLabel : openLabel}
        className="grid size-8 place-items-center border border-ink"
      >
        <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
          {open ? <path d="M3 3l10 10M13 3 3 13" /> : <path d="M2 4h12M2 8h12M2 12h12" />}
        </svg>
      </button>
      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 top-full border-b border-ink bg-bg">
          <NavLinks
            labels={labels}
            onNavigate={() => setOpen(false)}
            className="wrap divide-y divide-line"
            linkClassName="block px-2 py-3"
          />
          <div className="wrap border-t border-line py-3 font-mono text-xs">{children}</div>
        </div>
      )}
    </div>
  );
}
