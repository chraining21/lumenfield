import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import InquiryLink from "./InquiryLink";
import LocaleSwitcher from "./LocaleSwitcher";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";
import ThemeToggle from "./ThemeToggle";
import { NAV_ITEMS } from "./nav";

export default async function Header() {
  const t = await getTranslations("Nav");
  const labels = Object.fromEntries(NAV_ITEMS.map(({ key }) => [key, t(key)])) as Parameters<
    typeof NavLinks
  >[0]["labels"];

  return (
    <header className="sticky top-0 z-20 border-b border-ink bg-bg">
      <div className="wrap flex h-16 items-center gap-3 min-[900px]:gap-7">
        <Link
          href="/"
          aria-label={t("home")}
          className="flex shrink-0 items-center gap-2 font-bold tracking-wide whitespace-nowrap min-[900px]:gap-2.5 min-[900px]:tracking-[.12em]"
        >
          <Logo />
          {t("brand")}
        </Link>

        <nav aria-label={t("main")} className="ml-auto hidden min-[900px]:block">
          <NavLinks
            labels={labels}
            className="flex text-sm"
            linkClassName="block border-l border-line px-3.5 py-1.5"
          />
        </nav>

        <div className="ml-auto flex items-center gap-2 font-mono text-xs min-[900px]:ml-0 min-[900px]:gap-3">
          <InquiryLink />
          <div className="hidden min-[900px]:block">
            <LocaleSwitcher />
          </div>
          <div className="hidden min-[900px]:block">
            <ThemeToggle />
          </div>
          {/* 手機：語言與亮暗收進選單，讓導覽列放得下 */}
          <MobileMenu labels={labels} openLabel={t("openMenu")} closeLabel={t("closeMenu")}>
            <div className="flex items-center justify-between">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
