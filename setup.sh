#!/bin/bash

# Navigate to the correct directory
cd /Users/roberthanson/dev/port.robertjeremiah.com || { echo "Directory not found"; exit 1; }

# Create all necessary directories
mkdir -p lib app/login app/api/auth/login app/api/ai/assist components

# 1. Create seed-data.ts
cat << 'EOF' > lib/seed-data.ts
export const seedData = {
  cozinha: {
    title: "Cozinha",
    verbos: ["limpar", "cozinhar", "arrumar", "comprar", "organizar", "pôr", "colocar", "aquecer", "provar", "guardar"] /*[span_0](start_span)[span_0](end_span)*/,
    especiarias: ["pimenta", "sal", "coentros", "capuchinhas", "ervas aromáticas", "salvia", "salsa", "cidreira", "rúcula", "curcuma", "noz moscada", "hortelã", "erva príncipe", "cominhos", "pimentão (paprika)", "oregãos", "manjericão", "cardomomo", "tomilho", "canela", "alecrim", "piripiri", "anis", "gengibre"] /*[span_1](start_span)[span_1](end_span)*/,
    sementes: [
      { nome: "Chia", beneficio: "Rica em fibras, Auxilia intestino, Mais saciedade" } /*[span_2](start_span)[span_2](end_span)*/,
      { nome: "Linhaça", beneficio: "Fonte de ômega 3, Ajuda coração, Equilibrio hormonal" } /*[span_3](start_span)[span_3](end_span)*/,
      { nome: "Gergelim", beneficio: "Rico em cálcio, Fortalece ossos, Auxilia digestão" } /*[span_4](start_span)[span_4](end_span)*/,
      { nome: "Abóbora", beneficio: "Rica em magnésio, Ajuda imunidade, Saúde muscular" } /*[span_5](start_span)[span_5](end_span)*/,
      { nome: "Girassol", beneficio: "Fonte de vitamina E, Ação antioxidante, Protege células" } /*[span_6](start_span)[span_6](end_span)*/,
      { nome: "Mostarda", beneficio: "Estimula digestão, Rica em minerais, Auxilia metabolismo" } /*[span_7](start_span)[span_7](end_span)*/
    ],
    perguntasERespostas: [
      { q: "alcanças-me o leite por favor?", a: "sim claro" } /*[span_8](start_span)[span_8](end_span)*/,
      { q: "onde está o café?", a: "está dentro do armário" } /*[span_9](start_span)[span_9](end_span)*/,
      { q: "já limpaste o fogão?", a: "vou limpar daqui a 5 minutos" } /*[span_10](start_span)[span_10](end_span)*/,
      { q: "ainda temos batatas?", a: "não, precisamos de comprar" } /*[span_11](start_span)[span_11](end_span)*/
    ]
  },
  servicosLocais: {
    title: "Serviços Locais & Contactos (Silveira)",
    contactos: [
      { nome: "Sapateiro Sapataria Herménio", desc: "Silveira (local amazing quality PT shoe shop)" } /*[span_12](start_span)[span_12](end_span)*/,
      { nome: "Costureira Lurdes", desc: "Arranjos" } /*[span_13](start_span)[span_13](end_span)*/,
      { nome: "Reparação fogão", desc: "contactos nelson tripa, João Rocha 936577206, Nelson Rocha 914268232" } /*[span_14](start_span)[span_14](end_span)*/,
      { nome: "SMAS DIVISAO RESSIDUOS URBANOS", desc: "261 336 541" } /*[span_15](start_span)[span_15](end_span)*/
    ]
  },
  reciclagemSilveira: {
    title: "Ecocentro Móveis 2025 - Freguesia de Silveira",
    datas: [
      "1 a 15 de fevereiro de 2025 | Rua da Fonte (junto aos tanques), Cerca" /*[span_16](start_span)[span_16](end_span)*/,
      "1 a 15 de abril de 2025 | Rua do Moinho, Caixeiros" /*[span_17](start_span)[span_17](end_span)*/,
      "16 a 30 de junho de 2025 | Rua Pedro Alvares Cabral, Santa Cruz" /*[span_18](start_span)[span_18](end_span)*/
    ]
  },
  rotinaMatinal: {
    title: "Como foi a tua manhã?",
    frases: ["Hoje acordei às...", "Depois...", "Entretanto...", "Finalmente..."] /*[span_19](start_span)[span_19](end_span)*/,
    vocabulario: ["reclamar(to complain)", "esquecer (to forget)", "encontrar (find)", "avariar (stop working object)"] /*[span_20](start_span)[span_20](end_span)*/,
    historiaAna: "A Ana saiu de casa cedo porque tinha uma reunião importante. Quando chegou ao carro, percebeu que tinha deixado as chaves dentro de casa. Voltou para trás e encontrou o filho a fazer o pequeno-almoço." /*[span_21](start_span)[span_21](end_span)*/
  }
};
EOF

# 2. Create middleware.ts
cat << 'EOF' > middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'santa-cruz-secret-key-123');

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
EOF

# 3. Create Login Page
cat << 'EOF' > app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError('Please complete the bot check.');
      return;
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, turnstileToken }),
    });

    if (res.ok) {
      router.push('/');
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-900">Portuguese Hub 🇵🇹</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500" required />
          </div>

          <div className="flex justify-center my-4">
            <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} onSuccess={(token) => setTurnstileToken(token)} />
          </div>

          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
EOF

# 4. Create AI Tutor Component
cat << 'EOF' > components/ai-tutor.tsx
'use client';

import { useState } from 'react';

export default function AiTutor({ context }: { context: any }) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode: 'tutor', context }),
      });
      const data = await res.json();
      setResponse(data.result);
    } catch (error) {
      setResponse('Desculpe, ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">🤖 GPT-5.6 Luna Tutor</h2>
      <div className="flex gap-2 mb-4">
        <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask a question..." className="flex-1 rounded-md p-3 border focus:ring-blue-500" onKeyDown={(e) => e.key === 'Enter' && askAI()} />
        <button onClick={askAI} disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Pensando...' : 'Ask'}
        </button>
      </div>
      {response && <div className="bg-white p-4 rounded-md shadow-inner text-gray-800 whitespace-pre-wrap">{response}</div>}
    </div>
  );
}
EOF

# 5. Overwrite the main page.tsx
cat << 'EOF' > app/page.tsx
import { seedData } from '@/lib/seed-data';
import AiTutor from '@/components/ai-tutor';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Olá! Welcome</h1>
        <p className="text-lg text-gray-600 mt-2">Your quick reference guide for Silveira & Santa Cruz.</p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <section className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-orange-600">🍳 {seedData.cozinha.title}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {seedData.cozinha.verbos.map((verbo) => (
              <span key={verbo} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">{verbo}</span>
            ))}
          </div>
        </section>
        <section className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">📍 {seedData.servicosLocais.title}</h2>
          <ul className="text-sm space-y-4 text-gray-600">
            {seedData.servicosLocais.contactos.map((contacto) => (
              <li key={contacto.nome}><strong className="block text-gray-900">{contacto.nome}</strong><br/>{contacto.desc}</li>
            ))}
          </ul>
        </section>
      </main>
      <div className="mt-12"><AiTutor context={seedData} /></div>
    </div>
  );
}
EOF

# 6. Create Auth Route
cat << 'EOF' > app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const VALID_USERS = ['Kelly', 'Jenni', 'Robert'];
const VALID_PASSWORD = 'SantaCruz';
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'santa-cruz-secret-key-123');

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const matchedUser = VALID_USERS.find((u) => u.toLowerCase() === username.trim().toLowerCase());

  if (!matchedUser || password !== VALID_PASSWORD) {
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  const token = await new SignJWT({ user: matchedUser })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET_KEY);

  const response = NextResponse.json({ success: true });
  response.cookies.set('port_session', token, { httpOnly: true, path: '/' });
  return response;
}
EOF

# 7. Create AI Route
cat << 'EOF' > app/api/ai/assist/route.ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt, mode, context } = await req.json();
    const systemPrompt = `You are a warm, witty European Portuguese tutor assisting Kelly, Jenni, and Robert. Context: ${JSON.stringify(context)}`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
    });
    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF

# 8. Setup Environment Variables
cat << 'EOF' > .env.local
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
JWT_SECRET=SantaCruzSuperSecretKey2026
OPENAI_API_KEY=your_openai_api_key_here
EOF

echo "✅ All files generated successfully."

