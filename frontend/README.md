# frontend

Next.js 16（App Router、Cache Components）＋ next-intl。前台 `/zh-TW`、`/en`，後台 `/admin`。

設計規範見 `docs/DESIGN_SYSTEM.md`；Next.js 16 寫法與舊版不同，改程式前先看 `node_modules/next/dist/docs/`。

## 需要

- Node.js 24
- **後端要先啟動**（`backend/` 下 `mvn spring-boot:run`）：前台資料從 API 讀，`npm run dev` 與 `npm run build` 都需要

## 指令

| 指令 | 用途 |
|---|---|
| `npm run dev` | 開發，http://localhost:3000 |
| `npm run build` | 正式建置；產品、案例詳細頁在這時從 API 產生 |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | 型別檢查 |

## 資料與快取

- `src/lib/api.ts`：前台讀後端的唯一入口；後端位址由環境變數 `API_URL` 指定，預設 `http://localhost:8080`。
- 資料快取到後台存檔為止：後台存檔後以 `updateTag` 清掉 `products`／`projects`／`categories` 標籤，前台下一個請求就是新資料。
- 開發用的假資料在後端（`backend/src/main/resources/db/dev/R__dev_seed.sql`），只在 dev 載入。
