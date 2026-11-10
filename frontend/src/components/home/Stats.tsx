"use client";

import { useEffect, useRef } from "react";

type Stat = { value: number; suffix?: string; label: string };

// 進入畫面時數字由 0 往上跳；伺服器輸出最終數字，沒有 JS 也看得到
export default function Stats({ items }: { items: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nums = [...ref.current!.querySelectorAll<HTMLElement>("[data-n]")];
    nums.forEach((n) => (n.textContent = "0"));
    let raf = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / 1400);
          nums.forEach((n) => (n.textContent = String(Math.round(+n.dataset.n! * (1 - (1 - k) ** 3)))));
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(ref.current!);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-3 divide-x divide-ink border border-ink bg-bg">
      {items.map((s) => (
        <div key={s.label} className="p-4 min-[900px]:px-7 min-[900px]:py-6">
          <b className="block font-mono text-[clamp(28px,4vw,48px)] leading-tight font-medium">
            <span data-n={s.value}>{s.value}</span>
            {s.suffix}
          </b>
          <span className="label-mono">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
