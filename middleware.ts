import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('port_session')?.value;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login');

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      if (isAuthPage) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    } catch {
      if (!isAuthPage) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
