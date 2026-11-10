"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { NAV_ITEMS } from "./nav";

type Props = {
  labels: Record<(typeof NAV_ITEMS)[number]["key"], string>;
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
};

export default function NavLinks({ labels, className, linkClassName, onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <ul className={className}>
      {NAV_ITEMS.map(({ key, href }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={key}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`${linkClassName} ${active ? "bg-ink text-bg" : "hover:bg-ink hover:text-bg"}`}
            >
              {labels[key]}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
