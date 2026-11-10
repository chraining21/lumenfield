import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // 後台上傳的照片與檔案由後端提供；瀏覽器只連 Next，同網址轉給後端
  async rewrites() {
    return [{ source: "/files/:path*", destination: `${process.env.API_URL ?? "http://localhost:8080"}/api/files/:path*` }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
