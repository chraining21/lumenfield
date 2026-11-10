import { getTranslations, setRequestLocale } from "next-intl/server";
import BeamDrawing from "@/components/home/BeamDrawing";
import LampArt from "@/components/LampArt";
import Stats from "@/components/home/Stats";
import AddToInquiry from "@/components/products/AddToInquiry";
import ProjectCard from "@/components/projects/ProjectCard";
import SectionHead from "@/components/SectionHead";
import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/localized";
import { getCategories, getProducts, getProjects } from "@/lib/api";
import { formatPrice, lightTypeOf } from "@/lib/product";

const SERVICE_KEYS = ["s01", "s02", "s03", "s04", "s05"] as const;
// TODO: 首頁精選產品的挑選方式待後台設計時決定，暫時手動指定
const FEATURED_PRODUCTS = ["lf-dl-090", "lf-fl-120", "lf-ln-al25", "lf-pd-ring"];
const PROJECT_COUNT = 40;

const btn =
  "inline-flex gap-2.5 border-[1.5px] border-ink px-5.5 py-3 text-sm font-medium transition-colors hover:border-brand hover:bg-brand hover:text-[#1d1f22]";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HomePage");
  const s = await getTranslations("Services");

  const [categories, products, projects] = await Promise.all([getCategories(), getProducts(), getProjects()]);
  const lightTypes = categories.filter((c) => c.type === "LIGHT_TYPE");
  const featured = FEATURED_PRODUCTS.flatMap((slug) => products.filter((p) => p.slug === slug));

  return (
    <main className="wrap flex-1">
      {/* 主視覺：剖面圖＋光束 */}
      <section className="grid items-center gap-12 pt-10 pb-14 min-[900px]:grid-cols-[1fr_1.1fr] min-[900px]:pt-18">
        <div>
          <p className="label-mono">{t("eyebrow")}</p>
          <h1 className="mt-3 text-[clamp(38px,5.4vw,72px)] leading-[1.2] font-bold tracking-[.02em]">
            {t.rich("heroTitle", {
              mark: (c) => (
                <mark className="bg-transparent bg-[linear-gradient(transparent_62%,var(--brand)_62%)] text-inherit">
                  {c}
                </mark>
              ),
              br: () => <br />,
            })}
          </h1>
          <p className="mt-6 mb-8 max-w-[440px] text-muted">{t("heroText")}</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/products" className={`${btn} bg-ink text-bg`}>
              {t("ctaProducts")} →
            </Link>
            <Link href="/projects" className={btn}>
              {t("ctaProjects")}
            </Link>
          </div>
        </div>
        <BeamDrawing caption="DWG. LF-FL-120 / SECTION A-A" />
      </section>

      <div className="mb-18 min-[900px]:mb-30">
        <Stats
          items={[
            { value: 2014, label: t("statFounded") },
            { value: PROJECT_COUNT, suffix: "+", label: t("statProjects") },
            { value: SERVICE_KEYS.length, label: t("statServices") },
          ]}
        />
      </div>

      {/* 服務：規格表式 */}
      <section className="pb-30">
        <SectionHead
          title={t("servicesTitle")}
          label={`SERVICES / ${String(SERVICE_KEYS.length).padStart(2, "0")}`}
          href="/services"
        />
        <ul>
          {SERVICE_KEYS.map((key, i) => (
            <li key={key} className="slide">
              <Link
                href="/services"
                className="grid grid-cols-[44px_1fr] items-center gap-x-5 border-b border-line py-5 transition-colors hover:bg-highlight min-[900px]:grid-cols-[70px_1.1fr_1.4fr_90px]"
              >
                <span className="font-mono text-[13px]">S-{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-lg font-medium">{s(`${key}.title`)}</h3>
                <p className="col-start-2 text-sm text-muted min-[900px]:col-start-auto">{s(`${key}.desc`)}</p>
                <span className="hidden text-right font-mono min-[900px]:block">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 工程實績：帶座標標籤的卡片 */}
      <section className="pb-30">
        <SectionHead title={t("projectsTitle")} label={t("projectsAll")} href="/projects" />
        <ul className="grid gap-6 min-[900px]:grid-cols-3">
          {projects.map((p) => (
            <li key={p.slug} className="slide">
              <ProjectCard project={p} categories={categories} locale={locale} />
            </li>
          ))}
        </ul>
      </section>

      {/* 產品規格：燈型入口＋規格表 */}
      <section className="pb-30">
        <SectionHead title={t("productsTitle")} label={t("productsAll")} href="/products" />
        <ul className="mb-4 flex flex-wrap gap-2 font-mono text-xs">
          {lightTypes.map((c) => (
            <li key={c.slug}>
              <Link
                href={{ pathname: "/products", query: { tab: "type", category: c.slug } }}
                className="block border border-ink px-3 py-1.5 hover:bg-ink hover:text-bg"
              >
                {localized(c.name, locale)}
              </Link>
            </li>
          ))}
        </ul>
        <div className="overflow-x-auto">
          <table className="w-full border border-ink bg-bg text-[15px]">
            <thead className="bg-ink text-left font-mono text-[11px] tracking-widest text-bg">
              <tr className="[&>th]:p-2 [&>th]:font-normal min-[900px]:[&>th]:px-4 min-[900px]:[&>th]:py-3">
                <th className="max-[899px]:hidden" aria-label="—" />
                <th>MODEL</th>
                <th>{t("colName")}</th>
                <th className="max-[899px]:hidden">POWER</th>
                <th className="max-[899px]:hidden">CCT</th>
                <th className="max-[899px]:hidden">IP</th>
                <th>PRICE</th>
                <th aria-label="—" />
              </tr>
            </thead>
            <tbody>
              {featured.map((p) => (
                <tr
                  key={p.slug}
                  className="border-t border-line transition-colors hover:bg-highlight [&>td]:p-2 min-[900px]:[&>td]:px-4 min-[900px]:[&>td]:py-3.5"
                >
                  <td className="max-[899px]:hidden">
                    <div className="h-12 w-16">
                      <LampArt lightTypeId={lightTypeOf(p, categories)} />
                    </div>
                  </td>
                  <td className="font-mono text-[13px] whitespace-nowrap">{p.modelNo}</td>
                  <td>
                    <Link href={`/products/${p.slug}`} className="hover:underline">
                      {localized(p.name, locale)}
                    </Link>
                  </td>
                  <td className="font-mono text-[13px] max-[899px]:hidden">{p.wattage}</td>
                  <td className="font-mono text-[13px] max-[899px]:hidden">{p.colorTemperature}</td>
                  <td className="font-mono text-[13px] max-[899px]:hidden">{p.ipRating}</td>
                  <td className="font-mono whitespace-nowrap">{formatPrice(p) ?? t("priceAsk")}</td>
                  <td>
                    <AddToInquiry slug={p.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 行動呼籲：黃底，亮暗主題都用固定深色字 */}
      <div className="flex flex-wrap items-center justify-between gap-6 border-2 border-ink bg-brand p-8 text-[#1d1f22] min-[900px]:p-14">
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold">{t("ctaTitle")}</h2>
        <Link
          href="/inquiry"
          className="inline-flex border-[1.5px] border-[#1d1f22] bg-[#1d1f22] px-5.5 py-3 text-sm font-medium text-[#f3f3ef] hover:bg-transparent hover:text-[#1d1f22]"
        >
          {t("ctaButton")}
        </Link>
      </div>
    </main>
  );
}
