import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import ProjectBrowser, { ProjectBrowserView } from "@/components/projects/ProjectBrowser";
import { PageHeader, PageShell } from "@/components/Wireframe";
import { getCategories, getProjects } from "@/lib/api";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Nav" });
  return { title: t("projects") };
}

export default async function ProjectsPage({ params }: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Nav");
  const [categories, projects] = await Promise.all([getCategories(), getProjects()]);
  const projectCategories = categories.filter((c) => c.type === "PROJECT").sort((a, b) => a.sortOrder - b.sortOrder);
  // 後端已依年份新到舊排序
  const sorted = projects;

  return (
    <PageShell>
      <PageHeader title={t("projects")} label={`PROJECTS / ${String(projects.length).padStart(2, "0")}`} />
      <Suspense fallback={<ProjectBrowserView projects={sorted} categories={projectCategories} />}>
        <ProjectBrowser projects={sorted} categories={projectCategories} />
      </Suspense>
    </PageShell>
  );
}
