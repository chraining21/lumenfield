import type { Metadata } from "next";
import { NotFoundNote } from "@/components/admin/AdminForm";
import ProjectForm from "@/components/admin/ProjectForm";
import { PageHeader } from "@/components/Wireframe";
import { getAdminProject, getAdminProjects } from "@/lib/admin-api";
import { getCategories } from "@/lib/api";

export const metadata: Metadata = { title: "編輯案例" };

// 後台選單用 usePathname()，網址帶 id 時無法預渲染外框；後台不需要即時切換，改為等待載入
export const instant = false;

export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const [project, all, categories] = await Promise.all([
    getAdminProject(Number(id)),
    getAdminProjects(),
    getCategories(),
  ]);
  return (
    <>
      <PageHeader title="編輯案例" label={`ADMIN / PROJECTS / #${id}`} />
      {project ? (
        <ProjectForm project={project} others={all.filter((p) => p.id !== project.id)} categories={categories} />
      ) : (
        <NotFoundNote what="案例" backHref="/admin/projects" />
      )}
    </>
  );
}
