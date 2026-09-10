'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

type EditMode = 'recreate_shoot' | 'preserve_identity' | 'change_outfit' | 'change_scene' | 'localized_edit';

const modes: { value: EditMode; label: string }[] = [
  { value: 'recreate_shoot', label: 'Recriar ensaio' },
  { value: 'preserve_identity', label: 'Preservar identidade' },
  { value: 'change_outfit', label: 'Alterar roupa' },
  { value: 'change_scene', label: 'Alterar cenário' },
  { value: 'localized_edit', label: 'Edição localizada' },
];

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [clientFiles, setClientFiles] = useState<File[]>([]);
  const [clientPhotos, setClientPhotos] = useState<string[]>([]);
  const [editMode, setEditMode] = useState<EditMode>('recreate_shoot');
  const [instructions, setInstructions] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => () => {
    if (reference) URL.revokeObjectURL(reference);
    clientPhotos.forEach(url => URL.revokeObjectURL(url));
  }, [reference, clientPhotos]);

  function chooseReference(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (reference) URL.revokeObjectURL(reference);
    setReferenceFile(file);
    setReference(URL.createObjectURL(file));
    setMessage('');
  }

  function chooseClientPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 5);
    clientPhotos.forEach(url => URL.revokeObjectURL(url));
    setClientFiles(files);
    setClientPhotos(files.map(file => URL.createObjectURL(file)));
    setMessage(files.length === 5 && (event.target.files?.length ?? 0) > 5 ? 'Use no máximo 5 fotos da cliente.' : '');
  }

  function extension(file: File) {
    const fromName = file.name.split('.').pop()?.toLowerCase();
    if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
    return file.type === 'image/png' ? 'png' : 'jpg';
  }

  async function saveImageRecord(userId: string, projectId: string, file: File, kind: 'reference' | 'client', index = 0) {
    const bucket = kind === 'reference' ? 'reference-images' : 'client-images';
    const path = `${userId}/${projectId}/${kind}-${index}-${crypto.randomUUID()}.${extension(file)}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
    if (uploadError) throw uploadError;

    const { error: imageError } = await supabase.from('project_images').insert({
      user_id: userId,
      project_id: projectId,
      kind,
      storage_path: path,
      mime_type: file.type || null,
    });
    if (imageError) throw imageError;
  }

  async function generateEnsaio() {
    setMessage('');

    if (!referenceFile) return setMessage('Selecione a foto de referência.');
    if (clientFiles.length === 0) return setMessage('Adicione pelo menos uma foto da cliente.');
    if (!consent) return setMessage('Confirme que a cliente é adulta e autorizou o uso das imagens.');

    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        router.push('/login');
        return;
      }

      const userId = userData.user.id;
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          title: 'Novo ensaio',
          edit_mode: editMode,
          instructions: instructions.trim() || null,
          status: 'draft',
          adult_confirmed: true,
          consent_confirmed: true,
          consent_recorded_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (projectError || !project) throw projectError ?? new Error('Não foi possível criar o ensaio.');

      await saveImageRecord(userId, project.id, referenceFile, 'reference');
      for (let i = 0; i < clientFiles.length; i++) {
        await saveImageRecord(userId, project.id, clientFiles[i], 'client', i + 1);
      }

      setMessage('Ensaio salvo com sucesso. As fotos já estão no armazenamento privado. Agora falta conectar o motor de IA para gerar a imagem final.');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Erro inesperado.';
      setMessage(`Não foi possível salvar o ensaio: ${text}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <header><div><span className="badge">STUDIO AI</span><h1>Novo ensaio</h1><p>Use uma fotografia como referência e prepare a edição da sua cliente.</p></div></header>

      <section className="grid">
        <article className="card">
          <span className="step">01</span><h2>Foto de referência</h2><p>Pose, composição, iluminação, figurino ou cenário desejado.</p>
          <label className={`upload ${reference ? 'hasPreview' : ''}`}>
            {reference ? <img className="imagePreview" src={reference} alt="Prévia da foto de referência" /> : <span>+ Selecionar referência</span>}
            <input type="file" accept="image/*" onChange={chooseReference} />
          </label>
          {reference && <p className="uploadHint">Clique na imagem para trocar a referência.</p>}
        </article>

        <article className="card">
          <span className="step">02</span><h2>Fotos da cliente</h2><p>Adicione de 1 a 5 fotos nítidas para preservar melhor a identidade facial.</p>
          <label className={`upload ${clientPhotos.length ? 'hasPreview' : ''}`}>
            {clientPhotos.length ? <div className="previewGrid">{clientPhotos.map((src, i) => <img className="clientPreview" src={src} alt={`Foto da cliente ${i + 1}`} key={src} />)}</div> : <span>+ Adicionar fotos</span>}
            <input type="file" accept="image/*" multiple onChange={chooseClientPhotos} />
          </label>
          {clientPhotos.length > 0 && <p className="uploadHint">{clientPhotos.length} foto(s) selecionada(s). Clique nas imagens para trocar.</p>}
        </article>
      </section>

      <section className="panel">
        <span className="step">03</span><h2>Tipo de edição</h2>
        <div className="options">
          {modes.map(mode => (
            <button type="button" key={mode.value} className={editMode === mode.value ? 'active' : ''} onClick={() => setEditMode(mode.value)}>{mode.label}</button>
          ))}
        </div>
        <label className="promptLabel">Instruções</label>
        <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Ex.: preserve fielmente a identidade da cliente e use a pose e iluminação da referência." />
        <label className="consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> Confirmo que a cliente é adulta e autorizou o uso das imagens.</label>
        {message && <div className="statusMessage" role="status">{message}</div>}
        <button type="button" className="generate" disabled={loading} onClick={generateEnsaio}>{loading ? 'Salvando ensaio...' : 'Gerar ensaio'}</button>
      </section>
    </main>
  );
}
