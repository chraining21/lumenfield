import type { Metadata } from "next";
import { NotFoundNote } from "@/components/admin/AdminForm";
import ProductForm from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/Wireframe";
import { getAdminProduct, getAdminProducts } from "@/lib/admin-api";
import { getCategories } from "@/lib/api";

export const metadata: Metadata = { title: "編輯產品" };

// 後台選單用 usePathname()，網址帶 id 時無法預渲染外框；後台不需要即時切換，改為等待載入
export const instant = false;

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const [product, all, categories] = await Promise.all([
    getAdminProduct(Number(id)),
    getAdminProducts(),
    getCategories(),
  ]);
  return (
    <>
      <PageHeader title="編輯產品" label={`ADMIN / PRODUCTS / #${id}`} />
      {product ? (
        <ProductForm product={product} others={all.filter((p) => p.id !== product.id)} categories={categories} />
      ) : (
        <NotFoundNote what="產品" backHref="/admin/products" />
      )}
    </>
  );
}
