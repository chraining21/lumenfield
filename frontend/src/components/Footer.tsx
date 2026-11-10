import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { COMPANY, telHref } from "@/lib/company";
import { NAV_ITEMS } from "./nav";

// 建置時算一次年份（Cache Components 不允許在預渲染時直接呼叫 new Date()）
async function currentYear() {
  "use cache";
  return new Date().getFullYear();
}

export default async function Footer() {
  const t = await getTranslations("Footer");
  const nav = await getTranslations("Nav");
  const year = await currentYear();

  return (
    <footer className="mt-24 border-t-2 border-ink pt-12 pb-8 text-sm">
      <div className="wrap">
        <div className="grid gap-8 min-[900px]:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-bold tracking-[.12em]">{t("company")}</p>
            <p className="label-mono mt-1">{t("companyEn")}</p>
          </div>

          <div>
            <h2 className="label-mono mb-3">{t("contact")}</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="text-muted">{t("phone")}</dt>
              <dd className="font-mono">
                <a href={telHref(COMPANY.phone)} className="hover:underline">
                  {COMPANY.phone}
                </a>
              </dd>
              <dt className="text-muted">{t("fax")}</dt>
              <dd className="font-mono">{COMPANY.fax}</dd>
              <dt className="text-muted">{t("email")}</dt>
              <dd className="break-all">
                <a href={`mailto:${COMPANY.email}`} className="hover:underline">
                  {COMPANY.email}
                </a>
              </dd>
              <dt className="text-muted">{t("address")}</dt>
              <dd>{t("addressValue")}</dd>
            </dl>
          </div>

          <nav aria-label={t("links")}>
            <h2 className="label-mono mb-3">{t("links")}</h2>
            <ul className="space-y-1">
              {NAV_ITEMS.map(({ key, href }) => (
                <li key={key}>
                  <Link href={href} className="hover:underline">
                    {nav(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="label-mono mt-10">
          © {year} {t("company")} · {t("rights")}
        </p>
        <p className="mt-2 text-xs text-muted">{t("disclaimer")}</p>
      </div>
    </footer>
  );
}
