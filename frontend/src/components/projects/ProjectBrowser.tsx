"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { COUNTIES } from "@/data/taiwan-map";
import { Link, useRouter } from "@/i18n/navigation";
import { localized } from "@/lib/localized";
import type { Category, CountyCode, Project } from "@/types";
import ProjectCard from "./ProjectCard";
import TaiwanMap from "./TaiwanMap";

type Filters = { category: string | null; year: string | null; county: string | null };
type Props = { projects: Project[]; categories: Category[] };

// 網址參數 ?category=&year=&county=；地圖、篩選列、列表三者連動
export default function ProjectBrowser(props: Props) {
  const params = useSearchParams();
  return (
    <ProjectBrowserView
      {...props}
      filters={{ category: params.get("category"), year: params.get("year"), county: params.get("county") }}
    />
  );
}

// 預渲染時（還拿不到網址參數）也用這個，先輸出全部案例
export function ProjectBrowserView({
  projects,
  categories,
  filters = { category: null, year: null, county: null },
}: Props & { filters?: Filters }) {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const router = useRouter();

  const category = categories.find((c) => c.slug === filters.category);
  const county = COUNTIES.find((c) => c.code === filters.county);
  const years = [...new Set(projects.map((p) => p.year))].sort((a, b) => b - a);
  const year = years.find((y) => String(y) === filters.year);

  // 地圖件數只套用分類、年份；列表再加上縣市
  const byCategoryYear = projects.filter(
    (p) => (!category || p.categoryIds.includes(category.id)) && (!year || p.year === year),
  );
  const list = byCategoryYear.filter((p) => !county || p.countyCode === county.code);
  const counts: Partial<Record<CountyCode, number>> = {};
  byCategoryYear.forEach((p) => (counts[p.countyCode] = (counts[p.countyCode] ?? 0) + 1));

  const href = (change: Partial<Filters>) => {
    const next = { category: category?.slug, year: year && String(year), county: county?.code, ...change };
    const query = Object.fromEntries(Object.entries(next).filter(([, v]) => v)) as Record<string, string>;
    return { pathname: "/projects" as const, query };
  };
  const chip = (active: boolean) =>
    `block border border-ink px-3 py-1.5 ${active ? "bg-ink text-bg" : "hover:bg-ink hover:text-bg"}`;
  const hasFilter = category || year || county;

  return (
    <div className="grid gap-10 min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="min-[900px]:sticky min-[900px]:top-24 min-[900px]:self-start">
        <div className="mx-auto max-w-[280px] min-[640px]:max-w-[360px] min-[900px]:max-w-none">
          <TaiwanMap
            counts={counts}
            selected={county?.code ?? null}
            dots={list
              .filter((p) => p.latitude != null && p.longitude != null)
              .map((p) => ({
                slug: p.slug,
                title: localized(p.title, locale),
                lat: p.latitude!,
                lng: p.longitude!,
                countyCode: p.countyCode,
              }))}
            onSelect={(code) => router.push(href({ county: code ?? undefined }), { scroll: false })}
            onOpen={(slug) => router.push(`/projects/${slug}`)}
          />
        </div>
      </div>

      <div>
        <div className="mb-8 grid gap-3 font-mono text-xs">
          <FilterRow label={t("category")}>
            <li>
              <Link href={href({ category: undefined })} scroll={false} className={chip(!category)}>
                {t("all")}
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={href({ category: c.slug })} scroll={false} className={chip(category?.id === c.id)}>
                  {localized(c.name, locale)}
                </Link>
              </li>
            ))}
          </FilterRow>
          <FilterRow label={t("year")}>
            <li>
              <Link href={href({ year: undefined })} scroll={false} className={chip(!year)}>
                {t("all")}
              </Link>
            </li>
            {years.map((y) => (
              <li key={y}>
                <Link href={href({ year: String(y) })} scroll={false} className={chip(year === y)}>
                  {y}
                </Link>
              </li>
            ))}
          </FilterRow>
          {county && (
            <FilterRow label={t("county")}>
              <li>
                <Link href={href({ county: undefined })} scroll={false} className={chip(true)}>
                  {localized(county.name, locale)} ×
                </Link>
              </li>
            </FilterRow>
          )}
        </div>

        <div className="mb-4 flex items-baseline justify-between border-b border-ink pb-2">
          <span className="label-mono">{t("count", { count: list.length })}</span>
          {hasFilter && (
            <Link href="/projects" scroll={false} className="label-mono hover:text-ink">
              {t("clear")} ×
            </Link>
          )}
        </div>

        {list.length ? (
          <ul className="grid gap-6 min-[640px]:grid-cols-2">
            {list.map((p) => (
              <li key={p.slug}>
                <ProjectCard project={p} categories={categories} locale={locale} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="border border-dashed border-muted p-10 text-center">
            <p className="text-muted">{t("empty")}</p>
            <Link href="/projects" scroll={false} className="label-mono mt-3 inline-block hover:text-ink">
              {t("clear")} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-2 min-[640px]:grid-cols-[64px_1fr]">
      <span className="label-mono pt-1.5">{label}</span>
      <ul className="flex flex-wrap gap-2">{children}</ul>
    </div>
  );
}
