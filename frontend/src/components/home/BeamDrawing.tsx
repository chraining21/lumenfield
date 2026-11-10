"use client";

import { useEffect, useRef } from "react";

const W = 400;
const ORIGIN = { x: 200, y: 70 }; // 燈具出光點（viewBox 座標）
const MAX_AIM = 0.87; // ±50°
const HALF_BEAM = 0.31; // 光束半角 ≈ 18°
const FLOOR_Y = 300; // 地板線
const LENGTH = 700; // 夠長，最斜時也能碰到地板；超出部分由 clipPath 裁掉

// 燈具剖面圖：線條畫出後，光束跟著滑鼠轉向；閒置 3 秒自動擺動
export default function BeamDrawing({ caption }: { caption: string }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<SVGPolygonElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const area = areaRef.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target: { x: number; y: number } | null = null;
    let pos: { x: number; y: number } | null = null;
    let lastMove = -Infinity;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = area.getBoundingClientRect();
      target = { x: e.clientX - r.left, y: e.clientY - r.top };
      lastMove = performance.now();
    };

    const frame = (t: number) => {
      const r = area.getBoundingClientRect();
      if (!pos || !target) pos = target = { x: r.width / 2, y: r.height / 2 };
      if (t - lastMove > 3000 && !reduce) {
        target = {
          x: r.width * (0.5 + 0.3 * Math.sin(t / 2600)),
          y: r.height * (0.5 + 0.25 * Math.sin(t / 1900)),
        };
      }
      const ease = reduce ? 1 : 0.12;
      pos = { x: pos.x + (target.x - pos.x) * ease, y: pos.y + (target.y - pos.y) * ease };

      // 換算成 viewBox 座標後算角度
      const sx = (pos.x / r.width) * W;
      const sy = (pos.y / r.height) * 320;
      const a = Math.max(-MAX_AIM, Math.min(MAX_AIM, Math.atan2(sx - ORIGIN.x, Math.max(20, sy - ORIGIN.y))));
      const p = (k: number) => `${ORIGIN.x + Math.sin(k) * LENGTH},${ORIGIN.y + Math.cos(k) * LENGTH}`;
      beamRef.current?.setAttribute("points", `${ORIGIN.x},${ORIGIN.y} ${p(a - HALF_BEAM)} ${p(a + HALF_BEAM)}`);
      if (labelRef.current) labelRef.current.textContent = `AIM θ = ${Math.round((-a * 180) / Math.PI)}° · BEAM 36°`;
      raf = requestAnimationFrame(frame);
    };

    addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(frame);
    return () => {
      removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={areaRef} className="relative aspect-[4/3.2] border border-ink bg-surface/60">
      <span className="label-mono absolute top-0 left-0 px-2.5 py-2 text-[11px]">{caption}</span>
      <span ref={labelRef} className="label-mono absolute right-0 bottom-0 px-2.5 py-2 text-[11px]">
        AIM θ = 0° · BEAM 36°
      </span>
      <svg viewBox="0 0 400 320" className="draw block size-full text-ink" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
        <defs>
          {/* 以出光點到地板為範圍，光到地板仍留一點亮度 */}
          <linearGradient id="beamGrad" gradientUnits="userSpaceOnUse" x1="0" y1={ORIGIN.y} x2="0" y2={FLOOR_Y}>
            <stop offset="0" stopColor="#F8B62B" stopOpacity=".75" />
            <stop offset="1" stopColor="#F8B62B" stopOpacity=".25" />
          </linearGradient>
          <clipPath id="beamClip">
            <rect x="0" y="0" width={W} height={FLOOR_Y} />
          </clipPath>
        </defs>
        <polygon
          ref={beamRef}
          className="beam"
          points={`200,70 140,${FLOOR_Y} 260,${FLOOR_Y}`}
          fill="url(#beamGrad)"
          stroke="none"
          clipPath="url(#beamClip)"
        />
        <line x1="40" y1="30" x2="360" y2="30" />
        <line className="d2" x1="200" y1="30" x2="200" y2="44" />
        <rect className="d2" x="176" y="44" width="48" height="26" rx="3" />
        <path className="d2" d="M182 70 L188 78 H212 L218 70" />
        <circle className="d3" cx="200" cy="57" r="5" />
        <g className="text-muted" strokeWidth=".8">
          <path className="d3" d="M120 44 H160 M120 70 H160 M130 44 V70" />
          <path className="d3" d="M176 96 H224 M176 90 V102 M224 90 V102" />
        </g>
        <path className="d3" d={`M30 ${FLOOR_Y} H370`} strokeDasharray="4 4" />
        <g className="fill-muted font-mono" fontSize="9" stroke="none">
          <text x="104" y="60">H 26</text>
          <text x="189" y="114">W 48</text>
        </g>
      </svg>
    </div>
  );
}
