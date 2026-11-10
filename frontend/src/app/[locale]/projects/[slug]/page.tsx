import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PhotoViewer from "@/components/projects/PhotoViewer";
import SectionHead from "@/components/SectionHead";
import { PageHeader, PageShell } from "@/components/Wireframe";
import { COUNTIES } from "@/data/taiwan-map";
import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/localized";
import { getCategories, getProjects } from "@/lib/api";

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { locale, slug } = await params;
  const project = (await getProjects()).find((p) => p.slug === slug);
  return project ? { title: localized(project.title, locale) } : {};
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  // 上一個／下一個依列表順序（後端已依年份新到舊排序）
  const [ordered, categories] = await Promise.all([getProjects(), getCategories()]);
  const i = ordered.findIndex((p) => p.slug === slug);
  if (i < 0) notFound();
  const project = ordered[i];
  const prev = ordered[i - 1];
  const next = ordered[i + 1];
  const t = await getTranslations("Projects");
  const pages = await getTranslations("Pages");

  const title = localized(project.title, locale);
  const county = COUNTIES.find((c) => c.code === project.countyCode)!;
  const projectCategories = categories.filter((c) => project.categoryIds.includes(c.id));

  return (
    <PageShell>
      <PageHeader title={title} label={`${project.year} · ${project.countyCode}`} />

      <div className="relative aspect-[16/9] overflow-hidden border border-ink min-[900px]:aspect-[21/9]">
        <Image src={project.images[0].url} alt={title} fill priority sizes="100vw" className="object-cover" />
      </div>

      {/* 基本資料＋介紹 */}
      <section className="mt-10 grid gap-10 min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <table className="h-fit w-full border border-ink bg-bg text-sm">
          <tbody className="[&_th]:w-28 [&_th]:bg-surface [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-mono [&_th]:text-[11px] [&_th]:font-normal [&_th]:tracking-widest [&_th]:text-muted [&_td]:px-4 [&_td]:py-3 [&_tr+tr]:border-t [&_tr+tr]:border-line">
            <tr>
              <th>YEAR</th>
              <td className="font-mono">{project.year}</td>
            </tr>
            <tr>
              <th>LOCATION</th>
              <td>{localized(project.location, locale)}</td>
            </tr>
            <tr>
              <th>COUNTY</th>
              <td>
                <Link
                  href={{ pathname: "/projects", query: { county: county.code } }}
                  className="underline-offset-4 hover:underline"
                >
                  {localized(county.name, locale)}
                </Link>{" "}
                <span className="font-mono text-xs text-muted">{county.code}</span>
              </td>
            </tr>
            <tr>
              <th>CATEGORY</th>
              <td>
                <ul className="flex flex-wrap gap-2 font-mono text-xs">
                  {projectCategories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={{ pathname: "/projects", query: { category: c.slug } }}
                        className="block border border-ink px-2.5 py-1 hover:bg-ink hover:text-bg"
                      >
                        {localized(c.name, locale)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
        {project.description && (
          <p className="text-[17px] leading-loose whitespace-pre-line">{localized(project.description, locale)}</p>
        )}
      </section>

      {/* 照片：全部在同一頁，點了放大 */}
      <section className="mt-24">
        <SectionHead title={t("photos")} label={`PHOTOS / ${String(project.images.length).padStart(2, "0")}`} />
        <PhotoViewer photos={project.images} alt={title} />
      </section>

      {/* 案例導覽 */}
      <nav className="mt-24 grid border-y-2 border-ink min-[640px]:grid-cols-2">
        {prev ? (
          <Link href={`/projects/${prev.slug}`} className="block p-5 hover:bg-highlight">
            <span className="label-mono">← {t("prev")}</span>
            <span className="mt-1 block font-medium">{localized(prev.title, locale)}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/projects/${next.slug}`}
            className="block border-line p-5 text-right hover:bg-highlight max-[639px]:border-t min-[640px]:border-l"
          >
            <span className="label-mono">{t("next")} →</span>
            <span className="mt-1 block font-medium">{localized(next.title, locale)}</span>
          </Link>
        )}
      </nav>

      <Link href="/projects" className="label-mono mt-8 inline-block hover:text-ink">
        ← {pages("backToProjects")}
      </Link>
    </PageShell>
  );
}
