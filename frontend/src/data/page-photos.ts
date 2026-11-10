// 關於、服務頁的裝飾照片：Unsplash 免費授權照片（來源見 public/demo/CREDITS.md），和案例資料分開
const photo = (path: string) => ({ url: `/demo/${path}` });

export const PAGE_PHOTOS = {
  bridgePanorama: photo("projects/riverside-footbridge-2026-3.jpg"),
  bridgeWalkway: photo("projects/riverside-footbridge-2026-2.jpg"),
  facadeProjection: photo("projects/harbor-light-festival-2024-2.jpg"),
  festival: photo("projects/harbor-light-festival-2024-1.jpg"),
  stoneAlley: photo("pages/stone-alley.jpg"),
};
