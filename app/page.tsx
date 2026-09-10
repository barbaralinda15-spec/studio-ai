'use client';

import { ChangeEvent, useEffect, useState } from 'react';

export default function Home() {
  const [reference, setReference] = useState<string | null>(null);
  const [clientPhotos, setClientPhotos] = useState<string[]>([]);

  useEffect(() => () => {
    if (reference) URL.revokeObjectURL(reference);
    clientPhotos.forEach(URL.revokeObjectURL);
  }, [reference, clientPhotos]);

  function chooseReference(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (reference) URL.revokeObjectURL(reference);
    setReference(URL.createObjectURL(file));
  }

  function chooseClientPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    clientPhotos.forEach(URL.revokeObjectURL);
    setClientPhotos(files.map(file => URL.createObjectURL(file)));
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
          <span className="step">02</span><h2>Fotos da cliente</h2><p>Adicione fotos nítidas para preservar melhor a identidade facial.</p>
          <label className={`upload ${clientPhotos.length ? 'hasPreview' : ''}`}>
            {clientPhotos.length ? <div className="previewGrid">{clientPhotos.map((src, i) => <img className="clientPreview" src={src} alt={`Foto da cliente ${i + 1}`} key={src} />)}</div> : <span>+ Adicionar fotos</span>}
            <input type="file" accept="image/*" multiple onChange={chooseClientPhotos} />
          </label>
          {clientPhotos.length > 0 && <p className="uploadHint">{clientPhotos.length} foto(s) selecionada(s). Clique nas imagens para trocar.</p>}
        </article>
      </section>

      <section className="panel">
        <span className="step">03</span><h2>Tipo de edição</h2>
        <div className="options"><button>Recriar ensaio</button><button>Preservar identidade</button><button>Alterar roupa</button><button>Alterar cenário</button><button>Edição localizada</button></div>
        <label className="promptLabel">Instruções</label>
        <textarea placeholder="Ex.: preserve fielmente a identidade da cliente e use a pose e iluminação da referência." />
        <label className="consent"><input type="checkbox" /> Confirmo que a cliente é adulta e autorizou o uso das imagens.</label>
        <button className="generate">Gerar ensaio</button>
      </section>
    </main>
  );
}
