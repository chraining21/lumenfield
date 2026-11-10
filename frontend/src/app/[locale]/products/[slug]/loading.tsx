import { PageShell, Placeholder } from "@/components/Wireframe";

// 未列在 generateStaticParams 的網址在請求時才渲染，先顯示這個骨架
export default function Loading() {
  return (
    <PageShell>
      <Placeholder code="LOADING" height="h-[420px]" />
    </PageShell>
  );
}
