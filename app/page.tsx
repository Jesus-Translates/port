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
