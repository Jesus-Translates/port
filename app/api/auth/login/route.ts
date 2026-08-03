import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const VALID_USERS = (process.env.VALID_USERS || 'Kelly,Jenni,Robert').split(',').map(u => u.trim());
const VALID_PASSWORD = process.env.VALID_PASSWORD || 'SantaCruz';
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || '');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const matchedUser = VALID_USERS.find((u) => u.toLowerCase() === username.trim().toLowerCase());

  if (!matchedUser || password !== VALID_PASSWORD) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await new SignJWT({ user: matchedUser })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET_KEY);

  const response = NextResponse.json({ success: true });
  response.cookies.set('port_session', token, { httpOnly: true, path: '/', sameSite: 'strict' });
  return response;
}
