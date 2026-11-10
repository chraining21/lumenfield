# 部署（公開 demo）

免費方案組合：前端 Vercel、後端 Render、資料庫 TiDB Cloud Starter（相容 MySQL）。

```
瀏覽器 ──> Vercel（Next.js） ──> Render（Spring Boot，Docker） ──> TiDB Cloud Starter
```

## 已知限制（免費方案）

| 限制 | 影響 |
|---|---|
| Render 免費主機閒置 15 分鐘會休眠，喚醒約 30～60 秒 | 前台頁面是建置時產生並快取的，不受影響；詢價送出與後台第一次開啟要等後端醒來 |
| Render 檔案系統不保存 | 管理者上傳的照片、檔案在重新部署或休眠後會消失；demo 帳號本來就不能上傳 |
| Session 存在後端記憶體 | 後端休眠或重新部署後要重新登入 |
| TiDB 不檢查 `CHECK` 限制 | 同樣的規則後端驗證也會檔，不影響 |
| 不寄通知信 | 沒設 `app.inquiry.notify-to`，詢價只存進資料庫 |

## 帳號

| 帳號 | 權限 | 密碼放哪 |
|---|---|---|
| `demo` | 唯讀（VIEWER）：看得到後台全部畫面，存檔、上傳回 403 | `application-demo.properties`（公開） |
| 管理者 | 可讀寫（ADMIN） | 只放在 Render 的環境變數 `OWNER_USERNAME`／`OWNER_PASSWORD` |

帳號在後端啟動時建立（`AdminAccountsInitializer`），已存在就不動。

## 1. TiDB Cloud Starter（資料庫）

1. 到 https://tidbcloud.com 註冊，建立一個 **Starter** 叢集（免費）。
2. 叢集頁按 **Connect**：
   - Connect With 選 **General**，按 **Generate Password** 產生密碼（只顯示一次，先存好）。
   - 記下 **Host**、**Port**（4000）、**User**（形如 `xxxx.root`）。
3. 在 SQL Editor 執行：`CREATE DATABASE lumenfield;`

JDBC 網址（Render 要用）：

```
jdbc:mysql://<Host>:4000/lumenfield?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3
```

資料表由 Flyway 在後端第一次啟動時建立，並載入範例資料（`db/sample`）。

## 2. Render（後端）

1. 到 https://render.com 用 GitHub 登入，**New → Web Service**，選 `lumenfield` repo。
2. 設定：

   | 欄位 | 值 |
   |---|---|
   | Language | Docker |
   | Root Directory | `backend` |
   | Instance Type | Free |
   | Health Check Path | `/actuator/health` |

3. Environment Variables：

   | 名稱 | 值 |
   |---|---|
   | `SPRING_DATASOURCE_URL` | 上面的 JDBC 網址 |
   | `SPRING_DATASOURCE_USERNAME` | TiDB 的 User |
   | `SPRING_DATASOURCE_PASSWORD` | TiDB 的密碼 |
   | `OWNER_USERNAME` | 自己的管理者帳號 |
   | `OWNER_PASSWORD` | 自己的管理者密碼（夠長、不要和其他地方共用） |

4. 部署完成後打開 `https://<服務名稱>.onrender.com/api/products`，看得到 JSON 就成功。

## 3. Vercel（前端）

1. 到 https://vercel.com 用 GitHub 登入，**Add New → Project**，選 `lumenfield` repo。
2. **Root Directory** 選 `frontend`（Framework 會自動偵測為 Next.js）。
3. Environment Variables：

   | 名稱 | 值 |
   |---|---|
   | `API_URL` | Render 網址，例如 `https://lumenfield-api.onrender.com`（結尾不要 `/`） |
   | `NEXT_PUBLIC_DEMO_MODE` | `1`（登入頁顯示 demo 帳號、詢價表單顯示「勿填真實資料」） |

4. **Deploy 前先打開一次 Render 網址把後端叫醒**：建置時會向後端讀產品、案例來產生頁面。

之後 push 到 `main`，Vercel 與 Render 都會自動重新部署。
