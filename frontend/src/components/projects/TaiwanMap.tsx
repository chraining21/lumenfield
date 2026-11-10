"use client";

import { useLocale, useTranslations } from "next-intl";
import { COUNTIES, MAP_INSETS, MAP_SIZE, project } from "@/data/taiwan-map";
import { localized } from "@/lib/localized";
import type { CountyCode } from "@/types";

type Dot = { slug: string; title: string; lat: number; lng: number; countyCode: CountyCode };
type Props = {
  counts: Partial<Record<CountyCode, number>>;
  selected: CountyCode | null;
  dots: Dot[];
  onSelect: (code: CountyCode | null) => void;
  onOpen: (slug: string) => void;
};

// 縣市區塊地圖：有作品的縣市亮起（越多越亮），點選＝篩選；有經緯度的案例另畫光點
export default function TaiwanMap({ counts, selected, dots, onSelect, onOpen }: Props) {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const max = Math.max(1, ...Object.values(counts).map((n) => n ?? 0));
  const insetCodes = new Set<string>(MAP_INSETS.map((i) => i.code));

  return (
    <figure className="border border-ink bg-surface">
      <svg
        viewBox={`0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`}
        className="block w-full"
        role="group"
        aria-label={t("mapHint")}
      >
        {MAP_INSETS.map((i) => (
          <rect
            key={i.code}
            x={i.x}
            y={i.y}
            width={i.w}
            height={i.h}
            className="fill-none stroke-line"
            strokeDasharray="3 3"
          />
        ))}

        {COUNTIES.map((c) => {
          const n = counts[c.code] ?? 0;
          const active = selected === c.code;
          const name = localized(c.name, locale);
          const toggle = () => onSelect(active ? null : c.code);
          return (
            <path
              key={c.code}
              d={c.d}
              strokeWidth={active ? 1.6 : 0.6}
              strokeLinejoin="round"
              fillOpacity={n ? (active ? 1 : 0.35 + (0.5 * n) / max) : 1}
              className={`transition-[fill-opacity] ${active ? "stroke-ink" : "stroke-muted"} ${
                n ? "cursor-pointer fill-brand outline-none hover:[fill-opacity:1] focus-visible:stroke-ink" : "fill-bg"
              }`}
              {...(n && {
                role: "button",
                tabIndex: 0,
                "aria-pressed": active,
                "aria-label": t("mapCount", { name, count: n }),
                onClick: toggle,
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle();
                  }
                },
              })}
            >
              <title>{n ? t("mapCount", { name, count: n }) : name}</title>
            </path>
          );
        })}

        {MAP_INSETS.map((i) => {
          const c = COUNTIES.find((x) => x.code === i.code)!;
          return (
            <text key={i.code} x={i.x + 4} y={i.y + i.h - 4} className="fill-muted font-mono" fontSize="8">
              {localized(c.name, locale)}
            </text>
          );
        })}

        {/* 件數標籤 */}
        {COUNTIES.filter((c) => counts[c.code]).map((c) => (
          <g key={c.code} className="pointer-events-none font-mono" fontSize="10">
            <rect x={c.cx - 9} y={c.cy - 8} width="18" height="14" className="fill-ink" />
            <text x={c.cx} y={c.cy + 3} textAnchor="middle" className="fill-bg">
              {counts[c.code]}
            </text>
          </g>
        ))}

        {/* 案例光點（本島與澎湖） */}
        {dots
          .filter((d) => !insetCodes.has(d.countyCode)) // 金門、連江在小框內，投影不同，先不畫
          .map((d) => {
            const [x, y] = project(d.lng, d.lat);
            return (
              <g
                key={d.slug}
                role="link"
                tabIndex={0}
                aria-label={d.title}
                className="cursor-pointer outline-none"
                onClick={() => onOpen(d.slug)}
                onKeyDown={(e) => e.key === "Enter" && onOpen(d.slug)}
              >
                <title>{d.title}</title>
                <circle cx={x} cy={y} r="10" className="map-pulse fill-brand" />
                <circle cx={x} cy={y} r="4" className="fill-brand stroke-ink" strokeWidth="1.2" />
              </g>
            );
          })}
      </svg>
      <figcaption className="flex flex-wrap gap-x-5 gap-y-1 border-t border-ink px-3 py-2 font-mono text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <i className="inline-block size-2.5 border border-muted bg-brand" />
          {t("legendHas")}
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block size-2.5 rounded-full border border-ink bg-brand" />
          {t("legendDot")}
        </span>
        <span className="ml-auto">{t("mapHint")}</span>
      </figcaption>
    </figure>
  );
}
