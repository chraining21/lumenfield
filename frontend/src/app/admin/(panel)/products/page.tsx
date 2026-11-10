import type { Metadata } from "next";
import { Suspense } from "react";
import ProductList from "@/components/admin/ProductList";
import { PageHeader, Placeholder } from "@/components/Wireframe";
import { getAdminProducts } from "@/lib/admin-api";
import { getCategories } from "@/lib/api";

export const metadata: Metadata = { title: "產品" };

// 要帶登入 Session 向後端拿資料（每次請求才知道），所以放在 Suspense 裡串流
async function Products() {
  const [products, categories] = await Promise.all([getAdminProducts(), getCategories()]);
  return <ProductList products={products} categories={categories} />;
}

export default function AdminProductsPage() {
  return (
    <>
      <PageHeader title="產品管理" label="ADMIN / PRODUCTS" />
      <Suspense fallback={<Placeholder code="LOADING" height="h-80" />}>
        <Products />
      </Suspense>
    </>
  );
}
