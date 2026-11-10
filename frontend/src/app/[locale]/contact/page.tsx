import { getTranslations, setRequestLocale } from "next-intl/server";
import SectionHead from "@/components/SectionHead";
import { PageHeader, PageShell } from "@/components/Wireframe";
import { Link } from "@/i18n/navigation";
import { COMPANY, telHref } from "@/lib/company";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Nav" });
  return { title: t("contact") };
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const nav = await getTranslations("Nav");
  const t = await getTranslations("Contact");
  const footer = await getTranslations("Footer");

  const rows = [
    { label: footer("phone"), code: "TEL", value: COMPANY.phone, href: telHref(COMPANY.phone), mono: true },
    { label: footer("fax"), code: "FAX", value: COMPANY.fax, mono: true },
    { label: footer("email"), code: "MAIL", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
    { label: footer("address"), code: "ADDR", value: footer("addressValue") },
  ];
  const btn =
    "inline-flex border-[1.5px] border-ink px-5.5 py-3 text-sm font-medium transition-colors hover:border-brand hover:bg-brand hover:text-[#1d1f22]";

  return (
    <PageShell>
      <PageHeader title={nav("contact")} label="CONTACT" />
      <p className="mb-16 max-w-2xl text-lg text-muted">{t("intro")}</p>

      <div className="grid gap-10 min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section>
          <SectionHead title={t("infoTitle")} label="INFO" />
          <dl className="border border-ink bg-bg">
            {rows.map((r) => (
              <div
                key={r.code}
                className="grid gap-1 border-t border-line p-5 first:border-t-0 min-[640px]:grid-cols-[140px_1fr] min-[640px]:items-baseline"
              >
                <dt className="text-sm text-muted">
                  <span className="mr-2 font-mono text-[11px] tracking-widest">{r.code}</span>
                  {r.label}
                </dt>
                <dd className={`text-lg break-all ${r.mono ? "font-mono" : ""}`}>
                  {r.href ? (
                    <a href={r.href} className="underline-offset-4 hover:underline">
                      {r.value}
                    </a>
                  ) : (
                    r.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="h-fit border border-ink bg-surface p-8">
          <p className="label-mono">QUOTE</p>
          <h2 className="mt-2 text-[clamp(22px,2.6vw,30px)] font-bold tracking-wide">{t("quoteTitle")}</h2>
          <p className="mt-3 text-muted">{t("quoteText")}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/products" className={`${btn} bg-ink text-bg`}>
              {t("toProducts")} →
            </Link>
            <Link href="/inquiry" className={btn}>
              {t("toInquiry")}
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
