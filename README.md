# 明野照明 LUMENFIELD — 產品展示與詢價網站

照明公司的雙語官網：產品型錄、設計案例、免登入詢價清單，以及管理者後台。

> 明野照明（LUMENFIELD）是**虛構品牌**。產品、案例與聯絡資訊皆為虛構；案例照片來自 Unsplash，來源見 [`frontend/public/demo/CREDITS.md`](frontend/public/demo/CREDITS.md)。

A bilingual (zh-TW / en) product showcase and inquiry site for a fictional lighting company,
with a Next.js front end and a Spring Boot API.

## 功能

**前台**
- 繁中／英文雙語，網址區分語系（`/zh-TW`、`/en`）
- 產品依燈型、空間分類篩選，規格表、型錄／IES／CAD 下載
- 設計案例：台灣縣市地圖篩選、年份與分類篩選、照片燈箱
- 詢價清單：不需登入，存在瀏覽器；送出後產生詢價編號（`INQ-yyyyMMdd-NNNN`），並寄通知信給業務
- 亮色／暗色主題

**後台**（`/admin`）
- 帳號密碼登入（後端 Session、登入失敗鎖定）
- 產品、案例新增與編輯，照片／檔案上傳、排序
- 詢價列表與明細
- 存檔後前台立即更新（Next.js `updateTag`）

## 技術

| | |
|---|---|
| 前端 | Next.js 16（App Router、Cache Components、Server Actions）、React、TypeScript、Tailwind CSS 4、next-intl |
| 後端 | Spring Boot 4.1、Java 21、Spring Security、Spring Data JPA、Flyway |
| 資料庫 | MySQL 8.4 |
| 測試 | JUnit 5、MockMvcTester、Testcontainers |
| 開發環境 | Docker Compose（MySQL、Mailpit） |

架構：瀏覽器只連 Next.js；Next.js 在伺服器端呼叫 Spring Boot API。權限一律由後端驗證。
選型理由見 [`docs/ADR-001-tech-stack.md`](docs/ADR-001-tech-stack.md)。

## 本機執行

需要 Node.js 24、Java 21、Maven 3.9、Docker Desktop。

```bash
cd backend
mvn spring-boot:run
```

後端在 http://localhost:8080，會自動用 Docker 啟動 MySQL 與 Mailpit，並載入開發用假資料。

```bash
cd frontend
npm install
npm run dev
```

| 網址 | 內容 |
|---|---|
| http://localhost:3000 | 網站 |
| http://localhost:3000/admin | 後台（帳號 `admin`／密碼 `lf-admin-dev-only`，只在開發環境） |
| http://localhost:8025 | Mailpit：查看詢價通知信（不會真的寄出） |

測試：`cd backend && mvn test`（Testcontainers 會另起一個暫時的 MySQL）。

## 文件

| 文件 | 內容 |
|---|---|
| [`docs/SPEC.md`](docs/SPEC.md) | 需求規格 |
| [`docs/SITEMAP.md`](docs/SITEMAP.md) | 網站地圖與頁面內容 |
| [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) | 資料模型 |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | 設計規範 |
| [`docs/ADR-001-tech-stack.md`](docs/ADR-001-tech-stack.md) | 技術選型與決策紀錄 |
