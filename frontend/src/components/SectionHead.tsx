import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Props = {
  title: ReactNode;
  label: string;
  href?: ComponentProps<typeof Link>["href"];
};

// 區塊標題：大標＋右側小標籤（可當連結），下方粗線
export default function SectionHead({ title, label, href }: Props) {
  return (
    <div className="mb-10 flex items-baseline gap-4 border-b-2 border-ink pb-3">
      <h2 className="text-[clamp(26px,3.2vw,38px)] font-bold tracking-wide">{title}</h2>
      {href ? (
        <Link href={href} className="label-mono ml-auto hover:text-ink">
          {label}
        </Link>
      ) : (
        <span className="label-mono ml-auto">{label}</span>
      )}
    </div>
  );
}
