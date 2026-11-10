# ADR-001：技術選型

> 狀態：提議中（待驗收）
> 日期：2026-11-03
> 依據：`docs/SPEC.md` v0.1、`docs/DATA_MODEL.md` v0.1

---

## 1. 背景

明野照明官網需同時滿足：

- **SEO**：產品與案例頁要能被搜尋引擎索引（設計師、採購會用型號搜尋）。
- **動畫**：作品展示風格，參考 artlight.com.tw，動畫清單日後補充。
- **雙語**：繁中 + 英文，網址區分語系。
- **後台**：管理者自行維護產品、查看詢價。
- **團隊**：開發者熟 Spring Boot、前端經驗較少，程式主要由 AI 撰寫。
- **遠期**：線上下單。

## 2. 決策

| 層 | 選擇 | 版本（2026-11 最新穩定） |
|---|---|---|
| 前端框架 | Next.js（App Router）+ React | Next.js 16、React 19 |
| 語言 | TypeScript | 由 create-next-app 決定 |
| 樣式 | Tailwind CSS | 4.x |
| 雙語 | next-intl | 4.x |
| 動畫 | Motion（元件轉場、hover）+ GSAP（捲動敘事 ScrollTrigger） | Motion 14.x、GSAP 3.x |
| 後端 | Spring Boot + Java | Spring Boot 4.x、Java 21 |
| 建置 | Maven | 3.9（本機已安裝） |
| 資料庫 | **MySQL**（2026-11-03 決定） | 8.4 LTS，本機以 Docker 執行 |
| 後台 | 與前台同一個 Next.js 專案，路徑 `/admin` | — |

**架構**

```
瀏覽器
  │
  ▼
Next.js（frontend/）── 前台頁面（SSR/SSG）＋ /admin 後台頁面
  │  REST / JSON
  ▼
Spring Boot（backend/）── /api/**（公開）、/api/admin/**（需登入）
  │
  ▼
資料庫
```

- 前端只負責畫面與 SEO；商業邏輯、資料、權限、寄信都在 Spring Boot。
- 單一 repo（monorepo）：`frontend/`、`backend/`、`docs/`。

## 3. 前端：為何選 Next.js

| 考量 | Next.js 的表現 |
|---|---|
| SEO | 伺服器端產生 HTML（SSR/SSG），產品頁可預先產生；內建 metadata、sitemap 支援 |
| 動畫 | React 生態可直接用 Motion、GSAP，業界展示型網站主流組合 |
| AI 上手 | 訓練資料最多的前端框架之一，AI 產出品質與除錯能力最穩定 |
| 雙語 | next-intl 支援 `/zh-TW/...`、`/en/...` 路由與翻譯檔 |
| 後台 | 同專案可做表單、表格等互動頁面，不需另起專案 |
| 作品集 | 業界主流技術，履歷辨識度高 |

### 備選方案

| 方案 | 優點 | 未採用原因 |
|---|---|---|
| Astro | SEO 與載入速度最佳，適合內容網站 | 詢價清單、後台等互動功能需另外整合 UI 框架，複雜度上升 |
| Nuxt（Vue） | 能力與 Next.js 相當 | AI 熟悉度與生態規模較小，動畫套件選擇較少 |
| 純 React SPA（Vite） | 最簡單 | 無伺服器端渲染，SEO 不足 |
| Thymeleaf（Spring Boot 直接出頁） | 開發者熟悉，單一專案 | 動畫與互動體驗受限，不符作品展示需求 |

## 4. 後端：Spring Boot 4 + Java 21

- 開發者熟悉 Spring Boot，後端品質可自行把關。
- 選 **4.x** 而非 3.x：start.spring.io 目前僅提供 4.x，新專案不宜從即將停止支援的版本開始。
- 4.x 與 3.x 主要差異（開發時注意，AI 可能混用舊寫法）：
  - 基於 Spring Framework 7、Jakarta EE 11
  - JSON 預設改用 Jackson 3（套件名 `tools.jackson`）
  - 自動設定模組化拆分，依賴需按功能加入 starter
- Java 21：本機已安裝，LTS 版本，可用 record、virtual threads。

## 5. 資料庫：MySQL

> **決定（2026-11-03，Mimi）**：採用 **MySQL 8.4 LTS**。台灣主機商普遍支援，部署選擇多；本專案資料量小，功能差異不影響需求。

| 候選 | 優點 |
|---|---|
| PostgreSQL | 功能完整、JSON 支援佳、開源社群主流 |
| MySQL | 主機商普遍支援、資料量小時差異不大 |

本專案資料量小（產品數十至數百款），兩者皆足夠。本機開發以 Docker 執行。

注意事項：
- 字元集一律 `utf8mb4`、排序 `utf8mb4_unicode_ci`（中文與 emoji）。
- 資料表結構由 Flyway migration 管理，不用 Hibernate 自動建表。

## 6. 後台與安全

- 後台路徑 `/admin`，與前台同站；程式放在獨立 route group，日後可拆為子網域。
- 權限一律由後端驗證：`/api/admin/**` 需管理者身分（Spring Security），前端隱藏網址不視為安全措施。
- 密碼以 BCrypt 雜湊；登入失敗次數限制；後台 `noindex`。

## 7. 取捨與風險

| 項目 | 說明 |
|---|---|
| 兩個技術棧 | 前後端分離需維護兩個專案與 API 契約；以 `DATA_MODEL.md` 作為單一依據降低落差 |
| 前端學習曲線 | 開發者前端經驗少；以 AI 撰寫、小任務驗收的方式降低風險 |
| 版本新 | Next.js 16、Spring Boot 4 較新，AI 可能產出舊版寫法；指令中需明確指定版本，驗收時注意 |
| 部署 | Next.js 需 Node.js 執行環境（非純靜態），部署階段需一併考量 |

## 8. 階段 6 補充決定（2026-11-05，Mimi）

| 項目 | 決定 | 做法 |
|---|---|---|
| 前後端連線 | 瀏覽器只連 Next，不直接連後端 | 前台讀資料、送詢價、後台操作都由 Next 伺服器呼叫後端；上傳檔以 `/files/*` rewrite 轉給後端 |
| 前台更新時機 | 後台存檔後馬上更新 | 前台資料以 `"use cache"` 快取；後台存檔的 Server Action 呼叫 `updateTag` 清掉 `products`／`projects` 標籤 |
| 後台登入 | 後端 Session（Spring Security） | 後端的 JSESSIONID 由 Next 存成 httpOnly cookie（path `/admin`）；閒置 2 小時失效；同帳號連續失敗 5 次鎖 15 分鐘 |
| 上傳檔案 | 存在後端主機的資料夾 | `FileStorage` 介面＋本機資料夾實作（`app.upload-dir`）；部署時可換雲端實作 |

已知限制：
- Session 存在後端記憶體，後端重啟後需重新登入；多台後端時要改用共用的 Session 存放。
- 登入失敗計數也在記憶體，重啟後歸零。
- 後台移除的照片／檔案仍留在上傳資料夾，尚未清理。
