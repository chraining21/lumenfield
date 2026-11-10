import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/Wireframe";
import { getAdminInquiries, getAdminProducts, getAdminProjects } from "@/lib/admin-api";

export const metadata: Metadata = { title: "總覽" };

const CARDS = [
  { href: "/admin/products", code: "01", label: "產品", load: getAdminProducts },
  { href: "/admin/projects", code: "02", label: "案例", load: getAdminProjects },
  { href: "/admin/inquiries", code: "03", label: "詢價", load: getAdminInquiries },
];

// 筆數要帶登入 Session 向後端拿，各自串流進來
async function Count({ load }: { load: () => Promise<unknown[]> }) {
  return <>{(await load()).length}</>;
}

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="總覽" label="ADMIN / DASHBOARD" />
      <ul className="grid gap-4 min-[640px]:grid-cols-3">
        {CARDS.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="group block border border-ink bg-bg p-5 hover:bg-highlight">
              <span className="label-mono">
                {c.code} / {c.label}
              </span>
              <b className="mt-2 block font-mono text-[clamp(32px,4vw,48px)] leading-tight font-medium">
                <Suspense fallback="—">
                  <Count load={c.load} />
                </Suspense>
              </b>
              <span className="font-mono text-xs text-muted group-hover:text-ink">管理 →</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
