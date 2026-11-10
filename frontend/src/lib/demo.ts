// 公開 demo 站（Vercel 設 NEXT_PUBLIC_DEMO_MODE=1）：顯示 demo 帳號與「勿填真實資料」提醒
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1";
