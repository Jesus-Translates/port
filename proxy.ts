import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  // The front door: a stranger has to be able to reach these signed out.
  "/registar",
  "/api/auth/signup",
  // Next metadata routes — these have no file extension, so the matcher below
  // doesn't skip them. Social/link previews and the iOS home-screen icon must
  // be fetchable without a session.
  "/opengraph-image",
  "/twitter-image",
  "/apple-icon",
  "/icon",
  // Listen & Speak podcast: fetched by podcast apps, which send no cookies.
  // These routes authenticate with a signed ?t= token instead (lib/ls.ts).
  "/api/ls/feed",
  "/api/ls/audio",
];

/**
 * Routes that were retired, and where their traffic goes now.
 *
 * A server-component redirect() lost to the sibling /practice/[id] dynamic
 * segment, which matched "verbos" as a quiz id first and 404'd. Handling it
 * here settles it before routing runs, and issues a real 308 rather than
 * rendering React to say "go somewhere else".
 */
const RETIRED: Record<string, string> = {
  "/practice/verbos": "/verbos?tab=treinar",
  "/ouvir": "/escutar",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const movedTo = RETIRED[pathname];
  if (movedTo) {
    const url = new URL(movedTo, request.nextUrl);
    // Carry the unit context through, or a course step would land adrift.
    for (const [k, v] of request.nextUrl.searchParams) {
      if (!url.searchParams.has(k)) url.searchParams.set(k, v);
    }
    return NextResponse.redirect(url, 308);
  }

  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.nextUrl);
    if (pathname !== "/") loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Everything except static assets and files with an extension.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
