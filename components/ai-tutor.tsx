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
