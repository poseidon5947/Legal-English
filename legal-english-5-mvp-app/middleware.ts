import { NextResponse, type NextRequest } from "next/server";

/** Persist ?hl=en|es so a first visit via hreflang opens in that language. */
export function middleware(request: NextRequest) {
  const hl = request.nextUrl.searchParams.get("hl");
  const response = NextResponse.next();
  if (hl === "en" || hl === "es") {
    response.cookies.set("le5_locale", hl, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|.*\\..*).*)"],
};
