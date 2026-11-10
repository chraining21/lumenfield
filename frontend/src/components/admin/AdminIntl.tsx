"use client";

import { NextIntlClientProvider } from "next-intl";
import messages from "../../../messages/zh-TW.json";

// 後台只有中文：在瀏覽器端直接提供固定的語系與文字，
// 不經過伺服器端 next-intl 設定（那會讀取 request，讓頁面無法預渲染）
export default function AdminIntl({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="zh-TW" timeZone="Asia/Taipei" messages={{ Theme: messages.Theme }}>
      {children}
    </NextIntlClientProvider>
  );
}
