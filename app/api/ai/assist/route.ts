import OpenAI from 'openai';
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || '');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const { prompt, mode, context } = await req.json();
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
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
