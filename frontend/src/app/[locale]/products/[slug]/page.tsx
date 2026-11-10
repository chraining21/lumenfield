import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AddToInquiry from "@/components/products/AddToInquiry";
import ProductGallery from "@/components/products/ProductGallery";
import ProductVisual from "@/components/products/ProductVisual";
import SectionHead from "@/components/SectionHead";
import { PageHeader, PageShell } from "@/components/Wireframe";
import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/localized";
import { getCategories, getProduct, getProducts } from "@/lib/api";
import { fileSize, formatPrice, lightTypeOf } from "@/lib/product";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/products/[slug]">) {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  return product ? { title: `${product.modelNo} ${localized(product.name, locale)}` } : {};
}

export default async function ProductPage({ params }: PageProps<"/[locale]/products/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [product, categories] = await Promise.all([getProduct(slug), getCategories()]);
  if (!product) notFound();
  const t = await getTranslations("Products");
  const pages = await getTranslations("Pages");

  const lightType = lightTypeOf(product, categories);
  const productCategories = categories.filter((c) => product.categoryIds.includes(c.id));
  const specs = [
    { label: t("wattage"), value: product.wattage },
    { label: t("cct"), value: product.colorTemperature },
    { label: t("dimensions"), value: product.dimensions },
    { label: t("ip"), value: product.ipRating },
  ].filter((s) => s.value);

  return (
    <PageShell>
      <PageHeader title={localized(product.name, locale)} label={product.modelNo} />

      {/* 圖片＋基本資訊＋加入詢價 */}
      <section className="grid gap-10 min-[900px]:grid-cols-[1.2fr_1fr]">
        <ProductGallery images={product.images} lightTypeId={lightType} photoLabel={t("photo")} />
        <div className="flex flex-col gap-8">
          <div>
            <p className="label-mono mb-2">{t("categories")}</p>
            <ul className="flex flex-wrap gap-2 font-mono text-xs">
              {productCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={{
                      pathname: "/products",
                      query: { tab: c.type === "SPACE" ? "space" : "type", category: c.slug },
                    }}
                    className="block border border-ink px-3 py-1.5 hover:bg-ink hover:text-bg"
                  >
                    {localized(c.name, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-y border-ink py-5">
            <p className="label-mono">PRICE</p>
            <p className="mt-1 font-mono text-[clamp(26px,3vw,36px)] font-medium">
              {formatPrice(product) ?? t("ask")}
            </p>
          </div>
          <AddToInquiry slug={product.slug} withQty />
        </div>
      </section>

      {/* 規格表 */}
      <section className="mt-24">
        <SectionHead title={t("specs")} label="SPEC" />
        <table className="w-full border border-ink bg-bg">
          <tbody>
            {specs.map((s) => (
              <tr key={s.label} className="border-t border-line first:border-t-0 hover:bg-highlight">
                <th className="w-1/3 bg-surface px-4 py-3 text-left text-sm font-normal text-muted">{s.label}</th>
                <td className="px-4 py-3 font-mono">{s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 檔案下載 */}
      {product.files.length > 0 && (
        <section className="mt-24">
          <SectionHead title={t("downloads")} label={`FILES / ${String(product.files.length).padStart(2, "0")}`} />
          {/* TODO: mock 檔案不存在，下載會 404；階段 4 接上後台上傳的檔案 */}
          <ul className="border border-ink bg-bg">
            {product.files.map((f) => (
              <li key={f.id} className="border-t border-line first:border-t-0">
                <a
                  href={f.url}
                  download={f.fileName}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-highlight min-[900px]:grid-cols-[180px_1fr_90px_auto]"
                >
                  <span className="text-sm">{t(f.kind)}</span>
                  <span className="col-start-1 font-mono text-[13px] text-muted min-[900px]:col-start-auto">
                    {f.fileName}
                  </span>
                  <span className="hidden font-mono text-xs text-muted min-[900px]:block">{fileSize(f.sizeBytes)}</span>
                  <span className="col-start-2 row-span-2 row-start-1 font-mono text-xs min-[900px]:col-start-auto min-[900px]:row-span-1">
                    DOWNLOAD ↓
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 應用實景：沒有照片就整區隱藏 */}
      {product.applicationImages.length > 0 && (
        <section className="mt-24">
          <SectionHead
            title={t("application")}
            label={`APPLICATION / ${String(product.applicationImages.length).padStart(2, "0")}`}
          />
          <ul className="grid gap-6 min-[640px]:grid-cols-2 min-[900px]:grid-cols-3">
            {product.applicationImages.map((img, i) => (
              <li key={img.id}>
                <ProductVisual
                  src={img.url}
                  lightTypeId={lightType}
                  caption={`APPLICATION ${String(i + 1).padStart(2, "0")}`}
                  className="border border-ink"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link href="/products" className="label-mono mt-12 inline-block hover:text-ink">
        ← {pages("backToProducts")}
      </Link>
    </PageShell>
  );
}
