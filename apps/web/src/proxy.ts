import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const companyDomains: Record<string, string> = {
  "renacimiento.cl": "renacimiento",
  "www.renacimiento.cl": "renacimiento",
  "vidager.cl": "vidager",
  "www.vidager.cl": "vidager",
}

const LANDING_SLUGS = new Set(Object.values(companyDomains))

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? ""
  const cleanHost = hostname.replace(/:\d+$/, "").toLowerCase()
  const slug = companyDomains[cleanHost]

  if (slug) {
    const { pathname } = request.nextUrl

    if (!pathname.startsWith(`/${slug}`)) {
      const url = new URL(`/${slug}${pathname}`, request.url)
      url.search = request.nextUrl.search
      return NextResponse.rewrite(url)
    }
  }

  if (!slug && process.env.NODE_ENV === "production") {
    const { pathname } = request.nextUrl
    const firstSegment = pathname.split("/")[1]
    if (firstSegment && LANDING_SLUGS.has(firstSegment)) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|favicon.ico).*)"],
}
