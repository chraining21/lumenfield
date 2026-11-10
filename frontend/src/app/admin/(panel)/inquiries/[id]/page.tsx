import type { Metadata } from "next";
import Link from "next/link";
import { NotFoundNote } from "@/components/admin/AdminForm";
import { PageHeader } from "@/components/Wireframe";
import { formatDateTime, LOCALE_LABEL, totalQuantity } from "@/lib/inquiry";
import { getAdminInquiry } from "@/lib/admin-api";

export const metadata: Metadata = { title: "詢價明細" };

// 後台選單用 usePathname()，網址帶 id 時無法預渲染外框；後台不需要即時切換，改為等待載入
export const instant = false;

function SectionTitle({ code, title, extra }: { code: string; title: string; extra?: string }) {
  return (
    <h2 className="mb-4 flex items-baseline gap-3 border-b border-ink pb-2 font-bold">
      <span className="label-mono">{code}</span>
      {title}
      {extra && <span className="label-mono ml-auto">{extra}</span>}
    </h2>
  );
}

export default async function InquiryDetailPage({ params }: PageProps<"/admin/inquiries/[id]">) {
  const { id } = await params;
  const inq = await getAdminInquiry(Number(id));

  if (!inq) {
    return (
      <>
        <PageHeader title="詢價明細" label="ADMIN / INQUIRIES" />
        <NotFoundNote what="詢價" backHref="/admin/inquiries" />
      </>
    );
  }

  const contact = [
    { k: "聯絡人", v: inq.contactName },
    { k: "公司", v: inq.companyName },
    {
      k: "Email",
      v: (
        <a href={`mailto:${inq.email}`} className="underline">
          {inq.email}
        </a>
      ),
    },
    {
      k: "電話",
      v: inq.phone && (
        <a href={`tel:${inq.phone.replace(/[^\d+]/g, "")}`} className="underline">
          {inq.phone}
        </a>
      ),
    },
    { k: "送出時間", v: formatDateTime(inq.createdAt) },
    { k: "填寫語系", v: `${LOCALE_LABEL[inq.locale]}（回覆時用這個語言）` },
  ];

  return (
    <>
      <PageHeader title={inq.inquiryNo} label={`ADMIN / INQUIRIES / #${inq.id}`} />
      <div className="grid max-w-4xl gap-10">
        <section>
          <SectionTitle code="A" title="聯絡資訊" />
          <dl className="grid border border-ink text-sm min-[640px]:grid-cols-[8rem_minmax(0,1fr)]">
            {contact.map((c) => (
              <div key={c.k} className="contents">
                <dt className="border-b border-line bg-surface px-3 pt-2 font-mono text-xs text-muted min-[640px]:py-2.5">
                  {c.k}
                </dt>
                <dd className="border-b border-line px-3 py-2.5 break-all max-[639px]:bg-surface max-[639px]:pt-1">
                  {c.v || <span className="text-muted">—</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <SectionTitle code="B" title="需求說明" />
          <p className="border border-ink p-4 text-sm whitespace-pre-line">
            {inq.message || <span className="text-muted">（未填寫）</span>}
          </p>
        </section>

        <section>
          <SectionTitle code="C" title="詢價產品" extra={`${inq.items.length} 項 · 共 ${totalQuantity(inq)} 件`} />
          <div className="overflow-x-auto border border-ink">
            <table className="w-full text-sm">
              <thead className="border-b border-ink bg-surface text-left">
                <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-mono [&>th]:text-xs [&>th]:font-normal [&>th]:whitespace-nowrap">
                  <th>型號</th>
                  <th>名稱</th>
                  <th className="text-right">數量</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {inq.items.map((it) => (
                  <tr key={it.id} className="[&>td]:px-3 [&>td]:py-2.5 [&>td]:align-top">
                    <td className="font-mono whitespace-nowrap">
                      {it.productId ? (
                        <Link href={`/admin/products/${it.productId}`} className="underline">
                          {it.modelNoSnapshot}
                        </Link>
                      ) : (
                        it.modelNoSnapshot
                      )}
                    </td>
                    <td className="min-w-48">
                      {it.productNameSnapshot.zh}
                      <span className="block text-xs text-muted">{it.productNameSnapshot.en}</span>
                      {!it.productId && <span className="label-mono mt-1 block">此產品已從網站移除</span>}
                    </td>
                    <td className="text-right font-mono">{it.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">型號與名稱是客人送出當下的資料，之後修改產品不會影響這裡。</p>
        </section>

        <Link href="/admin/inquiries" className="font-mono text-sm hover:underline">
          ← 回詢價列表
        </Link>
      </div>
    </>
  );
}
