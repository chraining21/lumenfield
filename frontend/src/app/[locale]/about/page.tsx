import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SectionHead from "@/components/SectionHead";
import { PageHeader, PageShell } from "@/components/Wireframe";
import { COMPANY } from "@/lib/company";
import { PAGE_PHOTOS } from "@/data/page-photos";

const FEATURE_KEYS = ["f01", "f02", "f03", "f04"] as const;
const HISTORY = [
  { year: "2014", key: "h1" },
  { year: "2017", key: "h2" },
  { year: "2020", key: "h3" },
  { year: "2024", key: "h4" },
] as const;

export async function generateMetadata({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Nav" });
  return { title: t("about") };
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const nav = await getTranslations("Nav");
  const t = await getTranslations("About");
  const footer = await getTranslations("Footer");

  return (
    <PageShell>
      <PageHeader title={nav("about")} label="ABOUT / EST. 2014" />

      {/* 理念：大字引言疊在夜景照片上 */}
      <section className="relative overflow-hidden border border-ink">
        <Image src={PAGE_PHOTOS.bridgePanorama.url} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="relative bg-gradient-to-r from-black/85 via-black/60 to-black/20 p-8 text-[#f3f3ef] min-[900px]:p-16">
          <p className="font-mono text-xs tracking-widest text-[#f8b62b] uppercase">{t("philosophy")} · PHILOSOPHY</p>
          <blockquote className="mt-4 max-w-2xl text-[clamp(22px,3vw,34px)] leading-relaxed font-bold">
            「{t("quote")}」
          </blockquote>
        </div>
      </section>

      {/* 沿革 */}
      <section className="mt-24">
        <SectionHead title={t("historyTitle")} label="HISTORY" />
        <p className="mb-8 max-w-2xl text-muted">{t("historyIntro")}</p>
        <ol className="grid border border-ink bg-bg min-[900px]:grid-cols-4">
          {HISTORY.map((h, i) => (
            <li
              key={h.key}
              className={`relative p-5 max-[899px]:border-t max-[899px]:first:border-t-0 min-[900px]:border-l min-[900px]:first:border-l-0 border-line ${
                i === HISTORY.length - 1 ? "bg-brand text-[#1d1f22]" : ""
              }`}
            >
              <span className="block font-mono text-3xl font-medium">{h.year}</span>
              <span className="mt-2 block text-sm">{t(h.key)}</span>
              {i < HISTORY.length - 1 && (
                <span aria-hidden className="absolute top-5 right-4 font-mono text-muted max-[899px]:hidden">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* 專業與服務特色 */}
      <section className="mt-24">
        <SectionHead title={t("featuresTitle")} label={`EXPERTISE / ${String(FEATURE_KEYS.length).padStart(2, "0")}`} />
        <ul className="grid gap-6 min-[640px]:grid-cols-2">
          {FEATURE_KEYS.map((key, i) => (
            <li key={key} className="slide border border-ink bg-bg p-6">
              <span className="font-mono text-[13px] text-muted">F-{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-lg font-medium">{t(`${key}.title`)}</h3>
              <p className="mt-2 text-sm text-muted">{t(`${key}.desc`)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 公司資訊 */}
      <section className="mt-24">
        <SectionHead title={t("companyTitle")} label="COMPANY" />
        <table className="w-full border border-ink bg-bg text-sm">
          <tbody className="[&_td]:px-4 [&_td]:py-3 [&_th]:w-1/3 [&_th]:bg-surface [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-normal [&_th]:text-muted [&_tr+tr]:border-t [&_tr+tr]:border-line">
            <tr>
              <th>{t("companyName")}</th>
              <td>
                {footer("company")}
                <span className="ml-2 font-mono text-xs text-muted">{footer("companyEn")}</span>
              </td>
            </tr>
            <tr>
              <th>{footer("phone")}</th>
              <td className="font-mono">{COMPANY.phone}</td>
            </tr>
            <tr>
              <th>{footer("fax")}</th>
              <td className="font-mono">{COMPANY.fax}</td>
            </tr>
            <tr>
              <th>{footer("email")}</th>
              <td className="break-all">{COMPANY.email}</td>
            </tr>
            <tr>
              <th>{footer("address")}</th>
              <td>{footer("addressValue")}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </PageShell>
  );
}
