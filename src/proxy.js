import { NextResponse } from "next/server";

// Next.js 16 renamed middleware.js to proxy.js (same API, different name/export).
// This runs on the server before any matched route renders, so it's where we
// gate the product pages behind login without each page checking itself.
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  if (pathname === "/") {
    return NextResponse.redirect(new URL(token ? "/products" : "/login", request.url));
  }

  if (pathname.startsWith("/products") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/products/:path*"],
};
