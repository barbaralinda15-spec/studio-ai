export default function Home() {
  return (
    <main className="container">
      <header>
        <div>
          <span className="badge">STUDIO AI</span>
          <h1>Novo ensaio</h1>
          <p>Use uma fotografia como referência e prepare a edição da sua cliente.</p>
        </div>
      </header>

      <section className="grid">
        <article className="card">
          <span className="step">01</span>
          <h2>Foto de referência</h2>
          <p>Pose, composição, iluminação, figurino ou cenário desejado.</p>
          <label className="upload">+ Selecionar referência<input type="file" accept="image/*" /></label>
        </article>

        <article className="card">
          <span className="step">02</span>
          <h2>Fotos da cliente</h2>
          <p>Adicione fotos nítidas para preservar melhor a identidade facial.</p>
          <label className="upload">+ Adicionar fotos<input type="file" accept="image/*" multiple /></label>
        </article>
      </section>

      <section className="panel">
        <span className="step">03</span>
        <h2>Tipo de edição</h2>
        <div className="options">
          <button>Recriar ensaio</button><button>Preservar identidade</button>
          <button>Alterar roupa</button><button>Alterar cenário</button>
          <button>Edição localizada</button>
        </div>
        <label className="promptLabel">Instruções</label>
        <textarea placeholder="Ex.: preserve fielmente a identidade da cliente e use a pose e iluminação da referência." />
        <label className="consent"><input type="checkbox" /> Confirmo que a cliente é adulta e autorizou o uso das imagens.</label>
        <button className="generate">Gerar ensaio</button>
      </section>
    </main>
  );
}
