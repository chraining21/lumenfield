import { getTranslations, setRequestLocale } from "next-intl/server";
import InquiryPanel from "@/components/inquiry/InquiryPanel";
import { PageHeader, PageShell } from "@/components/Wireframe";
import { getCategories, getProducts } from "@/lib/api";

export async function generateMetadata({ params }: PageProps<"/[locale]/inquiry">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return { title: t("inquiry") };
}

export default async function InquiryPage({ params }: PageProps<"/[locale]/inquiry">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");
  const i = await getTranslations("Inquiry");
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <PageShell>
      <PageHeader title={t("inquiry")} label="INQUIRY" />
      <p className="mb-10 max-w-2xl text-muted">{i("intro")}</p>
      <InquiryPanel products={products} categories={categories} />
    </PageShell>
  );
}
