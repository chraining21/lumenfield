import type { Metadata } from "next";
import { Suspense } from "react";
import ProjectList from "@/components/admin/ProjectList";
import { PageHeader, Placeholder } from "@/components/Wireframe";
import { getAdminProjects } from "@/lib/admin-api";
import { getCategories } from "@/lib/api";

export const metadata: Metadata = { title: "案例" };

// 要帶登入 Session 向後端拿資料（每次請求才知道），所以放在 Suspense 裡串流
async function Projects() {
  const [projects, categories] = await Promise.all([getAdminProjects(), getCategories()]);
  return <ProjectList projects={projects} categories={categories} />;
}

export default function AdminProjectsPage() {
  return (
    <>
      <PageHeader title="案例管理" label="ADMIN / PROJECTS" />
      <Suspense fallback={<Placeholder code="LOADING" height="h-80" />}>
        <Projects />
      </Suspense>
    </>
  );
}
