import OpenAI from 'openai';
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || '');

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function verifyAuth(req: NextRequest) {
  const token = req.cookies.get('port_session')?.value;
  if (!token) {
    return null;
  }
  try {
    await jwtVerify(token, SECRET_KEY);
    return true;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAuth = await verifyAuth(req);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, mode, context } = await req.json();
    const systemPrompt = `You are a warm, witty European Portuguese tutor assisting Kelly, Jenni, and Robert. Context: ${JSON.stringify(context)}`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
    });
    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
