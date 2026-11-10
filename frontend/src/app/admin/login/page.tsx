import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "登入" };

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <LoginForm />
    </main>
  );
}
