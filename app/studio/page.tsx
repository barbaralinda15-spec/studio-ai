'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function StudioPage() {
  const router = useRouter();
  const supabase = createClient();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/login');
      else setReady(true);
    });
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (!ready) return <main className="container"><p>Carregando Studio AI...</p></main>;

  return (
    <main className="container">
      <header className="studioHeader">
        <div><span className="badge">STUDIO AI</span><h1>Meus ensaios</h1><p>Crie um novo projeto ou continue uma edição.</p></div>
        <button className="secondaryButton" onClick={logout}>Sair</button>
      </header>
      <section className="panel emptyState">
        <h2>Seu estúdio está pronto.</h2>
        <p>Na próxima etapa, vamos conectar o envio privado das fotos e a criação de ensaios.</p>
        <button className="generate" onClick={() => router.push('/')}>+ Novo ensaio</button>
      </section>
    </main>
  );
}
