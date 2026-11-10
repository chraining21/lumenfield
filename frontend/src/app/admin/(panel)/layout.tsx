import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { getCurrentAdmin } from "@/lib/admin-api";

// 每次進後台都向後端確認 Session；過期或無效就回登入頁（getCurrentAdmin 內處理）
async function CurrentAdmin() {
  const me = await getCurrentAdmin();
  return (
    <>
      {me.username}
      {me.role === "VIEWER" && <span className="ml-2 bg-brand px-1.5 py-0.5 text-[#1d1f22]">唯讀</span>}
    </>
  );
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell
      user={
        <Suspense fallback="…">
          <CurrentAdmin />
        </Suspense>
      }
    >
      {children}
    </AdminShell>
  );
}
