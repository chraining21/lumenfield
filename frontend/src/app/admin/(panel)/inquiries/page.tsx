import type { Metadata } from "next";
import { Suspense } from "react";
import InquiryList from "@/components/admin/InquiryList";
import { PageHeader, Placeholder } from "@/components/Wireframe";
import { getAdminInquiries } from "@/lib/admin-api";

export const metadata: Metadata = { title: "詢價" };

// 要帶登入 Session 向後端拿資料（每次請求才知道），所以放在 Suspense 裡串流
async function Inquiries() {
  return <InquiryList inquiries={await getAdminInquiries()} />;
}

export default function AdminInquiriesPage() {
  return (
    <>
      <PageHeader title="詢價" label="ADMIN / INQUIRIES" />
      <Suspense fallback={<Placeholder code="LOADING" height="h-80" />}>
        <Inquiries />
      </Suspense>
    </>
  );
}
