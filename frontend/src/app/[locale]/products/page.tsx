import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import ProductBrowser, { ProductBrowserView } from "@/components/products/ProductBrowser";
import { PageHeader, PageShell } from "@/components/Wireframe";
import { getCategories, getProducts } from "@/lib/api";

export async function generateMetadata({ params }: PageProps<"/[locale]/products">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Nav" });
  return { title: t("products") };
}

export default async function ProductsPage({ params }: PageProps<"/[locale]/products">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Nav");
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const productCategories = categories.filter((c) => c.type !== "PROJECT");

  return (
    <PageShell>
      <PageHeader title={t("products")} label={`PRODUCTS / ${String(products.length).padStart(2, "0")}`} />
      <Suspense fallback={<ProductBrowserView products={products} categories={productCategories} />}>
        <ProductBrowser products={products} categories={productCategories} />
      </Suspense>
    </PageShell>
  );
}
