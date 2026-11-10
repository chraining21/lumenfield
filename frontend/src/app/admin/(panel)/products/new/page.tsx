import type { Metadata } from "next";
import { Suspense } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { PageHeader, Placeholder } from "@/components/Wireframe";
import { getAdminProducts } from "@/lib/admin-api";
import { getCategories } from "@/lib/api";

export const metadata: Metadata = { title: "新增產品" };

async function NewProductForm() {
  const [others, categories] = await Promise.all([getAdminProducts(), getCategories()]);
  return <ProductForm product={null} others={others} categories={categories} />;
}

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="新增產品" label="ADMIN / PRODUCTS / NEW" />
      <Suspense fallback={<Placeholder code="LOADING" height="h-80" />}>
        <NewProductForm />
      </Suspense>
    </>
  );
}
