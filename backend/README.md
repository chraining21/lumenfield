# backend

Spring Boot 4.1 + Java 21 API。

技術選型見 `docs/ADR-001-tech-stack.md`，資料模型見 `docs/DATA_MODEL.md`。

## 需要

- Java 21、Maven 3.9（不使用 Maven Wrapper，避免下載到 C 槽）
- Docker Desktop（本機 MySQL 與測試都用它）

## 指令（在 `backend/` 下執行）

| 指令 | 用途 |
|---|---|
| `mvn spring-boot:run` | 啟動 API（http://localhost:8080），自動用 `compose.yaml` 啟動 MySQL 8.4 與 Mailpit |
| `docker compose up -d` | 手動啟動 compose 全部服務。compose 裡只要有任一服務已在執行，`spring-boot:run` 就不會再啟動其他服務；新增服務後要跑一次 |
| `mvn test` | 測試；Testcontainers 另起一個暫時的 MySQL，跑完即刪 |
| `docker compose down` | 停掉本機 MySQL（資料保留在 `mysql-data` volume） |

健康檢查：http://localhost:8080/actuator/health

## 檔案放在 E 槽

- Maven 套件：`.mvn/maven.config` 指定存到 `backend/.m2/`（不進 git）。一定要在 `backend/` 下執行 mvn。
- Testcontainers 設定檔：測試時家目錄指到 `target/test-home/`（見 `pom.xml` 的 surefire 設定）。
  從 IDE 直接執行 `TestLightBackendApplication` 不會套用，會寫到 C 槽的家目錄。
- Docker 映像與資料：放在 Docker Desktop 預設位置（C 槽），2026-11-04 Mimi 同意。

## 本機 MySQL

| 項目 | 值 |
|---|---|
| 主機 | localhost:3306 |
| 資料庫 | light |
| 帳號／密碼 | light / light-dev-only（僅限本機） |
| 字元集 | utf8mb4 / utf8mb4_unicode_ci |

## 詢價通知信

- 新詢價在背景寄信給 `app.inquiry.notify-to`（逗號分隔）；Reply-To 是客人信箱。寄信失敗只記錄，不影響詢價存檔。
- 開發環境寄到 Mailpit，信不會真的寄出：http://localhost:8025 查看。
- 正式環境：收件人待確認（SPEC §10）；寄信伺服器 `spring.mail.*` 與寄件人 `app.mail.from` 在部署階段設定。沒設定時不寄。

## 資料表與種子資料（Flyway）

| 位置 | 內容 | 何時載入 |
|---|---|---|
| `db/migration/V1__create_schema.sql` | 全部資料表 | 正式、開發都會 |
| `db/migration/V2__seed_categories.sql` | 14 個分類（後台沒有分類管理） | 正式、開發都會 |
| `db/migration/V3__admin_user_role.sql` | 管理者角色（ADMIN／VIEWER） | 正式、開發都會 |
| `db/sample/R__sample_data.sql` | 8 產品、3 案例、6 詢價 | dev、demo |
| `db/dev/R__dev_admin.sql` | 開發用管理者 | 只有 dev |

- 資料表結構只能用新的 migration 修改，不要改已經執行過的 V 檔。
- `R__` 開頭的檔案內容改了會重跑，但已存在的列不會被覆蓋；要整個重來就 `docker compose down -v` 清掉資料庫。
- 時間一律以 UTC 存。

開發用管理者（只在 dev）：

| 帳號 | 密碼 |
|---|---|
| admin | lf-admin-dev-only |
