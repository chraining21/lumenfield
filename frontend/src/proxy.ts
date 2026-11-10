import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "./lib/admin-cookie";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 後台：只有中文、不帶語系。這裡只看有沒有登入 cookie（樂觀檢查），
  // Session 是否有效由後端在每次呼叫時驗證
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname !== "/admin/login" && !req.cookies.has(ADMIN_COOKIE)) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  return intl(req);
}

export const config = {
  // Skip API routes, Next.js internals, files with an extension, uploaded files (/files, rewritten to the backend)
  // and the admin upload route (it checks the login cookie itself; proxy would truncate bodies over 10MB)
  matcher: "/((?!api|_next|_vercel|files/|admin/upload|.*\\..*).*)",
};
