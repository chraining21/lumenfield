import type { Metadata } from "next";
import { Suspense } from "react";
import ProjectForm from "@/components/admin/ProjectForm";
import { PageHeader, Placeholder } from "@/components/Wireframe";
import { getAdminProjects } from "@/lib/admin-api";
import { getCategories } from "@/lib/api";

export const metadata: Metadata = { title: "新增案例" };

async function NewProjectForm() {
  const [others, categories] = await Promise.all([getAdminProjects(), getCategories()]);
  return <ProjectForm project={null} others={others} categories={categories} />;
}

export default function NewProjectPage() {
  return (
    <>
      <PageHeader title="新增案例" label="ADMIN / PROJECTS / NEW" />
      <Suspense fallback={<Placeholder code="LOADING" height="h-80" />}>
        <NewProjectForm />
      </Suspense>
    </>
  );
}
