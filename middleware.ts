import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Autoriser explicitement la page de login et l'API de login
  if (path === "/admin/login" || path === "/api/admin/login") {
    return NextResponse.next();
  }

  // Si l'URL commence par /admin, on vérifie le cookie de session
  if (path.startsWith("/admin")) {
    const session = request.cookies.get("admin_session");
    
    if (!session || session.value !== "authenticated") {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};