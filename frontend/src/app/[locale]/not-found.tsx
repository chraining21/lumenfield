import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/Wireframe";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <PageShell>
      <div className="border border-ink bg-surface p-10 sm:p-16">
        <p className="label-mono">ERR. 404 / PAGE NOT FOUND</p>
        <h1 className="mt-3 text-[clamp(28px,4vw,44px)] font-bold tracking-wide">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("description")}</p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium">
          <Link href="/" className="border-[1.5px] border-ink bg-ink px-5 py-2.5 text-bg hover:border-brand hover:bg-brand hover:text-[#1d1f22]">
            {t("home")} →
          </Link>
          <Link href="/products" className="border-[1.5px] border-ink px-5 py-2.5 hover:border-brand hover:bg-brand hover:text-[#1d1f22]">
            {t("products")}
          </Link>
          <Link href="/projects" className="border-[1.5px] border-ink px-5 py-2.5 hover:border-brand hover:bg-brand hover:text-[#1d1f22]">
            {t("projects")}
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
