import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/localized";
import type { Category, Project } from "@/types";

type Props = { project: Project; categories: Category[]; locale: string };

// 案例卡片：封面、縣市標籤、分類、標題、年份／地點表
export default function ProjectCard({ project: p, categories, locale }: Props) {
  const cat = categories.find((c) => c.id === p.categoryIds[0]);

  return (
    <Link href={`/projects/${p.slug}`} className="group block h-full border border-ink bg-bg">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-ink">
        <Image
          src={p.images[0].url}
          alt={localized(p.title, locale)}
          fill
          sizes="(min-width: 900px) 33vw, 100vw"
          className="object-cover transition-transform duration-600 group-hover:scale-105"
        />
        <span className="absolute top-2.5 left-2.5 bg-brand px-2 py-0.5 font-mono text-[11px] text-[#1d1f22]">
          {p.countyCode}
        </span>
      </div>
      <div className="px-4.5 pt-4 pb-5">
        {cat && <span className="label-mono">{localized(cat.name, locale)}</span>}
        <h3 className="my-1.5 text-[17px] font-medium">{localized(p.title, locale)}</h3>
        <table className="w-full font-mono text-xs text-muted">
          <tbody>
            <tr className="border-t border-dashed border-line">
              <td className="py-0.75">YEAR</td>
              <td className="text-right text-ink">{p.year}</td>
            </tr>
            <tr className="border-t border-dashed border-line">
              <td className="py-0.75">LOCATION</td>
              <td className="text-right text-ink">{localized(p.location, locale)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Link>
  );
}
