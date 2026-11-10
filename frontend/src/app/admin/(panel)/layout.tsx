import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { getCurrentAdmin } from "@/lib/admin-api";

// 每次進後台都向後端確認 Session；過期或無效就回登入頁（getCurrentAdmin 內處理）
async function CurrentAdmin() {
  const me = await getCurrentAdmin();
  return <>{me.username}</>;
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
