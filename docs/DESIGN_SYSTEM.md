# 設計規範（DESIGN_SYSTEM）

> 版本：v0.1（階段 3-1）
> 來源：風格 3「技術藍圖」`design/styles/3-blueprint.html`，亮暗可切換。
> 程式位置：`frontend/src/app/globals.css`（色彩 token）、`frontend/src/app/[locale]/layout.tsx`（字體）。

---

## 1. 亮暗切換

- `<html data-theme="dark">` 為暗色；沒有屬性或 `light` 為亮色。
- 所有元件**只用 token**（`bg-bg`、`text-ink`…），換主題時自動跟著變，不需逐一寫 `dark:`。
- 少數非換色不可的地方才用 Tailwind 的 `dark:` 前綴（已綁定 `data-theme`）。
- 開關按鈕在導覽列（`ThemeToggle`），選擇存在 localStorage `theme`；沒選過時跟隨系統設定。`<head>` 內的 inline script（`lib/theme.ts`）在畫面出現前套用，不會閃。

## 2. 色彩 token

| Token | Tailwind | 亮色 | 暗色 | 用途 |
|---|---|---|---|---|
| `--brand` | `brand` | `#F8B62B` | `#F8B62B` | Logo 黃。詢價按鈕、標記底線、hover 底色 |
| `--bg` | `bg` | `#F3F3EF` | `#121416` | 頁面底色 |
| `--surface` | `surface` | `#FBFBF8` | `#1A1D20` | 圖框、表格等浮在格線上的面 |
| `--ink` | `ink` | `#1D1F22` | `#E8E6DF` | 主要文字、粗框線、主要按鈕底 |
| `--muted` | `muted` | `#5F636A` | `#9A9EA4` | 次要文字、小字英文標籤 |
| `--line` | `line` | `#C9CBC6` | `#34383D` | 細分隔線、虛線 |
| `--grid` | — | ink 6% | ink 5% | 背景格線 |
| `--highlight` | `highlight` | 黃 18% | 黃 14% | 表格列 hover |

**對比度（WCAG AA 需 ≥ 4.5）**

| 組合 | 亮色 | 暗色 |
|---|---|---|
| ink / bg | 14.85 | 14.78 |
| muted / bg | 5.43 | 6.86 |
| ink / brand（黃底黑字按鈕） | 9.22 | — |
| brand / bg（黃字） | **1.61 ✗** | 10.30 |

規則：

- **亮色版不可用黃色當文字**，黃色只當底色、底線、色塊。黃字只在暗色版出現。
- 黃底上的字一律用 `#1D1F22`（亮暗都一樣），不用 `ink` token，否則暗色版會變成黃底白字。
- `muted` 比原型的 `#6B6F75` 加深一點（原型 4.54 剛好壓線，小字放在 surface 上會不合格）。

## 3. 字體

| 用途 | 字體 | Tailwind | 字重 |
|---|---|---|---|
| 內文、標題 | Noto Sans TC | `font-sans`（預設） | 可變字重，常用 400／500／700 |
| 型號、規格、英文標籤、數字 | IBM Plex Mono | `font-mono` | 400／500 |

- 以 `next/font/google` 自架，不連 Google 伺服器。中文字依 unicode-range 分片，只下載頁面用到的字。
- 內文 16px、行高 1.75。
- 標題：粗體 700，字距 `tracking-wide`；大標用 `clamp()` 隨螢幕縮放（3-4 實作）。

## 4. 版面與裝飾

| 項目 | 規格 | 寫法 |
|---|---|---|
| 內容寬 | 最寬 1200px，左右各留 24px | `wrap` |
| 背景格線 | 24px 方格，`--grid` 色 | `body` 預設 |
| 英文小標籤 | Mono 12px、字距 .08em、大寫、muted | `label-mono` |
| 區塊標題 | 大標＋右側小標籤（如 `SERVICES / 05`），下方 2px ink 粗線 | 3-2 元件化 |
| 框線 | 主要 1px ink；分隔 1px line；表格內虛線 | `border-ink`、`border-line` |
| 圓角 | 無（藍圖感，直角） | — |
| 斷點 | 900px 以下改單欄、導覽收合 | Tailwind `max-[900px]:` 或 `md`/`lg` |

## 5. 動態

- 線條繪製（`stroke-dashoffset`）、數字跳動、進場滑入，皆需支援 `prefers-reduced-motion`。
- 各動畫在 3-4 之後隨頁面實作。

## 6. TODO

- [ ] 暗色版實際頁面上看過後再微調（3-4 首頁完成後）
- [ ] 區塊標題、按鈕、表格等元件化（3-2～3-5）
