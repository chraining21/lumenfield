# 資安測試紀錄（公開 demo 上線前）

日期：2026-11-10
範圍：`frontend/`（Next.js）、`backend/`（Spring Boot）、公開 demo 設定（`demo` profile）
方式：程式碼審查＋本機 demo 環境實際攻擊（Docker 映像＋MySQL，設定同 Render）＋套件弱點掃描
不在範圍：Vercel／Render／TiDB 平台本身、DDoS、社交工程

## 結果總覽

| # | 項目 | 結果 |
|---|---|---|
| 1 | 未登入呼叫後台 API | 通過 |
| 2 | 唯讀帳號寫入 | 通過 |
| 3 | Actuator 管理端點外洩 | 通過 |
| 4 | 路徑穿越讀檔 | 通過 |
| 5 | SQL injection | 通過 |
| 6 | 錯誤訊息外洩 | 通過 |
| 7 | 上傳惡意檔案 | 通過（另修 2 個小問題，見 F5） |
| 8 | 儲存型 XSS | 通過 |
| 9 | 竄改不該改的欄位（mass assignment） | 通過 |
| 10 | 通知信標頭注入 | 通過 |
| 11 | 超大請求 | 通過 |
| 12 | 登入 Session 與 cookie | 通過 |
| 13 | Next middleware 繞過（CVE-2025-29927） | 通過 |
| 14 | 套件已知弱點 | 通過 |
| 15 | 鎖定 demo 帳號讓大家登不進去 | **發現問題 → 已修（F1）** |
| 16 | 洗版詢價塞爆資料庫 | **發現問題 → 已修（F2）** |
| 17 | demo 後台看得到其他訪客的個資 | **發現問題 → 已修（F3）** |
| 18 | 前台缺安全標頭（點擊劫持） | **發現問題 → 已修（F4）** |
| 19 | 繞過前端直接打後端 API | **加強 → 已做（F6）** |

## 測試項目明細

每項列出：做了什麼、預期、實際。

### 1. 未登入呼叫後台 API
- `GET /api/admin/products`、`/api/admin/inquiries`、`/api/admin/me` 不帶 Session
- 預期 401；實際 401
- 前台 `/admin` 沒有 cookie → 307 轉到 `/admin/login`

### 2. 唯讀帳號寫入
- 以 `demo` 登入後 `PUT /api/admin/products/1`、`POST /api/admin/uploads`
- 預期 403；實際 403；`GET` 後台資料 200、登出 204
- 前台按「儲存」顯示「這是唯讀的 demo 帳號…」
- 自動測試：`AdminAuthTests.viewerCanReadButNotWrite`

### 3. Actuator 管理端點
- `/actuator/env`、`/actuator/heapdump` → 404；只開放 `/actuator/health`（只回 UP／DOWN）

### 4. 路徑穿越
- `/api/files/..%2f..%2fetc/passwd`、`/api/files/2026/11/%2e%2e%2f%2e%2e%2fapp.jar`、`/api/files/..;/..;/app.jar`
- 直接打後端與經過前台 `/files/` 都是 400
- 檔名格式不符（`/api/files/2026/11/application.properties`）→ 404
- 原因：Spring Security 防火牆擋編碼斜線；`LocalFileStorage` 只接受自己產生的 UUID 檔名格式

### 5. SQL injection
- `/api/products/x' OR '1'='1`、`/api/projects/1 UNION SELECT 1` → 404
- 全部查詢走 JPA 參數綁定，沒有字串拼接 SQL

### 6. 錯誤訊息外洩
- 壞掉的 JSON → `{"title":"Bad Request","detail":"Failed to read request"}`，無堆疊、無版本號
- 非法字元網址 → Tomcat 400 頁面，不顯示版本號

### 7. 上傳惡意檔案（以可讀寫的管理者登入）
| 檔案 | 結果 |
|---|---|
| `x.php` | 400 不允許的副檔名 |
| `x.svg`（含 onload） | 400（SVG 不在白名單） |
| `x.jpg`：JPEG 檔頭＋HTML | 收下，但以 `image/jpeg`＋`nosniff` 輸出，瀏覽器不會當網頁執行 |
| `x.webp`：只有 `RIFF`＋HTML | 修正前收下 → **修正後 400**（F5） |
| `evil.pdf`：內容是 HTML | 以 `application/pdf` 輸出；**修正後改為下載不在瀏覽器開**（F5） |

### 8. 儲存型 XSS
- 詢價姓名 `<img src=x onerror=alert(1)>`、需求 `<script>…</script>` 送出成功後，後台列表與明細以純文字顯示（React 自動跳脫）
- 全站唯一的 `dangerouslySetInnerHTML` 是固定的主題切換腳本，不含使用者輸入

### 9. 竄改欄位
- 詢價送出夾帶 `"id":1`、`"inquiryNo":"HACKED"` → 被忽略，編號照常由後端產生
- 型號、品名快照由後端依產品資料產生，不信任前端

### 10. 通知信標頭注入
- 姓名填 `Eve\r\nBcc: victim@example.com\r\nX-Injected: yes`
- Mailpit 收到的信：主旨被 RFC 2047 編碼，**沒有**多出 Bcc 或 X-Injected 標頭

### 11. 超大請求
- 101 個品項 → 400（上限 100）
- 20MB 請求內容 → 400，0.1 秒內回應

### 12. Session 與 cookie
- 登入成功換新 Session（防 session fixation）
- 前台 cookie `lf_admin_session`：`HttpOnly`、正式環境 `Secure`、`SameSite=Lax`、只送 `/admin`
- 管理者帳號連錯 5 次鎖 15 分鐘（429），正確密碼也擋

### 13. Next middleware 繞過
- 帶 `x-middleware-subrequest` 標頭打 `/admin` → 仍 307 轉登入頁
- 即使繞過，後台資料也都由後端驗證 Session

### 14. 套件弱點
- 前端 `npm audit --omit=dev`：0 個（開發工具 eslint 底下有 7 個 moderate，不會部署出去）
- 後端 104 個執行期套件比對 OSV 弱點資料庫：0 個

## 發現的問題與修正

### F1 任何人都能鎖住 demo 帳號（中）
- 重現：用 `demo` 連續輸錯 5 次 → 正確密碼也回 429，所有訪客 15 分鐘內無法登入 demo
- 修正：設定為 demo 唯讀帳號的使用者名稱不計失敗次數（密碼本來就公開，鎖了沒有保護作用）；其他帳號照樣鎖
- 驗證：demo 輸錯 6 次後正確密碼 200；owner 輸錯 5 次後 429
- 測試：`SecurityHardeningTests.viewerIsNeverLockedButOthersAre`

### F2 詢價沒有數量上限（中）
- 重現：連續送 30 筆全部成功，可無限塞進免費資料庫（5GB 上限）
- 修正：demo 全站每小時最多 30 筆（`app.inquiry.max-per-hour`），超過回 429，表單顯示「目前送出的詢價太多…」
- 驗證：第 31 筆起 429；瀏覽器顯示提示
- 測試：`SecurityHardeningTests.limitsInquiriesPerHour`

### F3 demo 後台看得到其他訪客的個資（中）
- 問題：demo 帳號公開，訪客若填真實 Email、電話，其他人登入 demo 後台都看得到
- 修正：唯讀帳號拿到的詢價資料，聯絡人、Email、電話只留頭尾（`王*明`、`w**g@example.com`）；可讀寫的管理者看完整資料。詢價表單另外顯示「請勿填寫真實個資」
- 驗證：demo 看到遮罩、owner 看到完整
- 測試：`SecurityHardeningTests.viewerSeesMaskedContactDetails`

### F4 前台缺安全標頭（中低）
- 問題：沒有 `X-Frame-Options`，後台可被嵌進其他網站做點擊劫持；回應帶 `X-Powered-By: Next.js`
- 修正：全站加 `X-Frame-Options: DENY`、`Content-Security-Policy: frame-ancestors 'none'`、`X-Content-Type-Options: nosniff`、`Referrer-Policy`、`Permissions-Policy`；關掉 `X-Powered-By`

### F5 上傳檢查小問題（低）
- WebP 只檢查 `RIFF` 開頭 → 改成同時檢查第 8～11 byte 是 `WEBP`
- PDF、ZIP、CAD 會在瀏覽器直接開 → 改成 `Content-Disposition: attachment` 一律下載
- 測試：`AdminProductApiTests.rejectsBadUploads`、`nonImageFilesAreDownloadedNotOpened`

### F6 後端只接受 Next 的請求（加強）
- 問題：Render 的後端網址公開，任何人都能繞過前端（和前端的提示、限制）直接呼叫 API
- 修正：Next 呼叫後端一律帶 `X-Internal-Token`，後端設了 `app.internal-token` 時沒帶或不符就回 403（固定時間比較）；`/api/files/**`、`/actuator/health` 例外
- 驗證：不帶／帶錯 → 403；帶對 → 200；整個網站功能正常
- 測試：`SecurityHardeningTests.apiNeedsInternalToken`、`filesAndHealthStayOpenWithoutToken`

## 剩下的風險（接受）

- **詢價限量是全站總量**：有人洗版時，正常訪客也會暫時送不出去。後端只看得到 Next 伺服器的 IP，無法依訪客限量；作品集 demo 可接受。
- **登入鎖定與詢價限量存在記憶體**：後端重啟就歸零。只有一台後端時足夠。
- **沒有完整的 Content-Security-Policy**：只限制被嵌入（frame-ancestors）。完整 CSP 要處理主題切換的行內腳本，之後再做。
- **管理者上傳的檔案在 Render 會消失**：免費方案限制，見 `DEPLOY.md`。

## 怎麼自己再測一次

本機 demo 環境（設定同正式 demo）：

```bash
cd backend
docker build -t lumenfield-backend:test .
```

啟動後端（要先 `docker compose up -d` 起本機 MySQL，並建立 `lumenfield_demo` 資料庫）：

```bash
docker run -d --name lf-demo-test -p 8081:8080 -e INTERNAL_TOKEN=local-test-token -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/lumenfield_demo -e SPRING_DATASOURCE_USERNAME=light -e SPRING_DATASOURCE_PASSWORD=light-dev-only -e OWNER_USERNAME=owner -e OWNER_PASSWORD=owner-local-test -m 512m lumenfield-backend:test
```

前端 `frontend/.env.local`：

```
API_URL=http://127.0.0.1:8081
NEXT_PUBLIC_DEMO_MODE=1
BACKEND_TOKEN=local-test-token
```

例：不帶密鑰應該 403、帶了應該 200：

```bash
curl -i http://127.0.0.1:8081/api/products
```

```bash
curl -i -H "X-Internal-Token: local-test-token" http://127.0.0.1:8081/api/products
```

自動測試：`cd backend && mvn test`（56 個，含上面列出的資安測試）。
