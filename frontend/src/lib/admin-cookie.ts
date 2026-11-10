// 後台登入 cookie：內容是後端的 Session ID（JSESSIONID），httpOnly，瀏覽器端 JS 讀不到。
// 獨立成檔是因為 proxy.ts 也要用，不能帶進 next/headers
export const ADMIN_COOKIE = "lf_admin_session";
