import { IBM_Plex_Mono, Noto_Sans_TC } from "next/font/google";

// 前台與後台共用；中文字依 unicode-range 分片，瀏覽器只下載用到的字
const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const fontVariables = `${notoSansTC.variable} ${plexMono.variable}`;
