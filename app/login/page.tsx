'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      });
      if (error) setMessage(error.message);
      else setMessage('Cadastro realizado. Confira seu e-mail se a confirmação estiver habilitada.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage('Não foi possível entrar. Confira e-mail e senha.');
      else router.push('/studio');
    }
    setLoading(false);
  }

  return (
    <main className="authPage">
      <section className="authCard">
        <span className="badge">STUDIO AI</span>
        <h1>{mode === 'login' ? 'Entrar' : 'Criar conta'}</h1>
        <p>Seu espaço profissional para criar e gerenciar ensaios com IA.</p>
        <form onSubmit={submit}>
          {mode === 'signup' && <input required placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />}
          <input required type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
          <input required minLength={6} type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="generate" disabled={loading}>{loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}</button>
        </form>
        {message && <p className="authMessage">{message}</p>}
        <button className="authSwitch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>
          {mode === 'login' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}
        </button>
      </section>
    </main>
  );
}
