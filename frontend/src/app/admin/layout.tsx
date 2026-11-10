import type { Metadata } from "next";
import AdminIntl from "@/components/admin/AdminIntl";
import InlineScript from "@/components/InlineScript";
import { fontVariables } from "@/lib/fonts";
import { themeScript } from "@/lib/theme";
import "../globals.css";

// 後台：只有中文、網址不帶語系；不給搜尋引擎收錄
export const metadata: Metadata = {
  title: { default: "明野後台", template: "%s | 明野後台" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="zh-TW" data-theme="light" suppressHydrationWarning className={`${fontVariables} h-full antialiased`}>
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="min-h-full">
        {/* 共用元件（亮暗開關）需要的文字 */}
        <AdminIntl>{children}</AdminIntl>
      </body>
    </html>
  );
}
