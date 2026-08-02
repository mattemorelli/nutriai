import { useState, useEffect } from 'react';

const NOMI_GIORNO_ESTESI = {
  Lun: 'Lunedì', Mar: 'Martedì', Mer: 'Mercoledì', Gio: 'Giovedì',
  Ven: 'Venerdì', Sab: 'Sabato', Dom: 'Domenica',
};

// Ordine logico del pasto nella giornata: colazione, primo, contorno, spuntino, secondo, contorno.
// Il primo "contorno" incontrato nell'elenco originale va dopo il primo, il secondo va dopo il secondo —
// non dipende dal testo esatto del campo "pasto", quindi funziona anche se quel valore varia.
function ordinaPasti(pasti) {
  const PRIORITA_BASE = { colazione: 0, primo: 1, spuntino: 3, secondo: 4 };
  let contorniVisti = 0;

  const conPriorita = pasti.map((p, indiceOriginale) => {
    let priorita;
    if (p.slot === 'contorno') {
      priorita = contorniVisti === 0 ? 2 : 5;
      contorniVisti += 1;
    } else {
      priorita = PRIORITA_BASE[p.slot] ?? 10 + indiceOriginale;
    }
    return { ...p, __priorita: priorita, __indiceOriginale: indiceOriginale };
  });

  return conPriorita.sort((a, b) =>
    a.__priorita - b.__priorita || a.__indiceOriginale - b.__indiceOriginale
  );
}

export default function PianoSettimanale({ planId }) {
  const [piano, setPiano] = useState(null);
  const [giornoAttivo, setGiornoAttivo] = useState(0);
  const [stato, setStato] = useState('carico');

  useEffect(() => {
    fetch(`http://localhost:3000/piano/${planId}`)
      .then(res => {
        if (!res.ok) throw new Error('Piano non trovato');
        return res.json();
      })
      .then(data => {
        setPiano(data);
        setStato('pronto');
      })
      .catch(() => setStato('errore'));
  }, [planId]);

  if (stato === 'carico') {
    return (
      <div className="ns-wrap">
        <style>{STILE}</style>
        <p className="ns-caricamento">Preparo il tuo piano…</p>
      </div>
    );
  }

  if (stato === 'errore') {
    return (
      <div className="ns-wrap">
        <style>{STILE}</style>
        <div className="ns-errore">
          <p>Non riesco a trovare questo piano.</p>
          <p className="ns-errore-dettaglio">
            Controlla che il server sia acceso (<code>node server.js</code>) e che l'indirizzo del piano sia corretto.
          </p>
        </div>
      </div>
    );
  }

  const giorno = piano[giornoAttivo];

  return (
    <div className="ns-wrap">
      <style>{STILE}</style>

      <header className="ns-header">
        <span className="ns-eyebrow">La tua settimana</span>
        <h1 className="ns-titolo">Piano pasti</h1>
      </header>

      <nav className="ns-giorni" aria-label="Giorni della settimana">
        {piano.map((g, i) => {
          const attivo = i === giornoAttivo;
          const conforme = g.verifica.saturi === 'OK' && g.verifica.sale === 'OK' && g.verifica.fibra === 'OK';
          return (
            <button
              key={g.giorno}
              className={`ns-giorno-tab ${attivo ? 'ns-giorno-tab--attivo' : ''}`}
              onClick={() => setGiornoAttivo(i)}
              aria-pressed={attivo}
            >
              <span className="ns-giorno-tab-nome">{g.giorno}</span>
              <span className={`ns-giorno-tab-puntino ${conforme ? 'ns-puntino--ok' : 'ns-puntino--attenzione'}`} />
            </button>
          );
        })}
      </nav>

      <section className="ns-giorno-dettaglio">
        <h2 className="ns-giorno-titolo">{NOMI_GIORNO_ESTESI[giorno.giorno] || giorno.giorno}</h2>

        <div className="ns-pasti">
          {ordinaPasti(giorno.pasti).map((p, i) => (
            <article key={i} className="ns-pasto-card">
              <span className="ns-pasto-slot">{p.slot}</span>
              <h3 className="ns-pasto-nome">{p.piatto}</h3>
              <span className="ns-pasto-kcal">{p.kcal} kcal</span>
            </article>
          ))}
        </div>

        <div className="ns-etichetta">
          <span className="ns-etichetta-titolo">Totale giornata</span>
          <div className="ns-etichetta-righe">
            <RigaEtichetta label="Energia" valore={`${giorno.totale_giorno.kcal} kcal`} />
            <RigaEtichetta
              label="Grassi saturi"
              valore={`${giorno.totale_giorno.saturi_g} g`}
              stato={giorno.verifica.saturi}
            />
            <RigaEtichetta
              label="Fibra"
              valore={`${giorno.totale_giorno.fibra_g} g`}
              stato={giorno.verifica.fibra === 'OK' ? 'OK' : 'SFORA'}
            />
            <RigaEtichetta
              label="Sale"
              valore={`${giorno.totale_giorno.sale_g} g`}
              stato={giorno.verifica.sale}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function RigaEtichetta({ label, valore, stato }) {
  const classe = !stato ? '' : stato === 'OK' ? 'ns-riga--ok' : 'ns-riga--attenzione';
  return (
    <div className={`ns-etichetta-riga ${classe}`}>
      <span className="ns-etichetta-label">{label}</span>
      <span className="ns-etichetta-valore">{valore}</span>
    </div>
  );
}

const STILE = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

.ns-wrap {
  --carta: #FBF9F4;
  --carta-scura: #F1ECE1;
  --inchiostro: #1F3A2E;
  --inchiostro-tenue: #4A5D52;
  --pomodoro: #C1462F;
  --senape: #D9A441;
  --testo: #2B2620;
  --riga-ok: #3C7A5A;
  --riga-attenzione: #C1462F;

  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
  background: var(--carta);
  color: var(--testo);
  font-family: 'Inter', sans-serif;
}

.ns-caricamento, .ns-errore { padding: 3rem 0; text-align: center; color: var(--inchiostro-tenue); }
.ns-errore-dettaglio { font-size: 0.85rem; margin-top: 0.5rem; }
.ns-errore code { background: var(--carta-scura); padding: 0.15rem 0.4rem; border-radius: 3px; }

.ns-header { margin-bottom: 1.75rem; }
.ns-eyebrow {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--pomodoro);
  margin-bottom: 0.35rem;
}
.ns-titolo {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 2.4rem;
  color: var(--inchiostro);
  margin: 0;
  line-height: 1.05;
}

.ns-giorni {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 0.75rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--carta-scura);
}
.ns-giorno-tab {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.55rem 0.9rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--inchiostro-tenue);
  cursor: pointer;
  transition: background 0.15s ease;
}
.ns-giorno-tab:hover { background: var(--carta-scura); }
.ns-giorno-tab--attivo {
  background: var(--inchiostro);
  color: var(--carta);
}
.ns-giorno-tab-puntino { width: 5px; height: 5px; border-radius: 50%; }
.ns-puntino--ok { background: var(--riga-ok); }
.ns-puntino--attenzione { background: var(--senape); }
.ns-giorno-tab--attivo .ns-puntino--ok { background: #7FD9AC; }
.ns-giorno-tab--attivo .ns-puntino--attenzione { background: var(--senape); }

.ns-giorno-titolo {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: var(--inchiostro);
  margin: 0 0 1.1rem;
}

.ns-pasti { display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.75rem; }
.ns-pasto-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: white;
  border: 1px solid var(--carta-scura);
  border-radius: 10px;
}
.ns-pasto-slot {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--pomodoro);
}
.ns-pasto-nome {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  margin: 0;
  color: var(--testo);
}
.ns-pasto-kcal {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: var(--inchiostro-tenue);
  white-space: nowrap;
}

.ns-etichetta {
  border: 2px solid var(--inchiostro);
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  background: white;
}
.ns-etichetta-titolo {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--inchiostro-tenue);
  margin-bottom: 0.6rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--carta-scura);
}
.ns-etichetta-righe { display: flex; flex-direction: column; gap: 0.45rem; }
.ns-etichetta-riga {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}
.ns-etichetta-label { color: var(--testo); }
.ns-etichetta-valore {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
}
.ns-riga--ok .ns-etichetta-valore { color: var(--riga-ok); }
.ns-riga--attenzione .ns-etichetta-valore { color: var(--riga-attenzione); }

@media (max-width: 480px) {
  .ns-titolo { font-size: 1.9rem; }
  .ns-pasto-card { grid-template-columns: 1fr; gap: 0.2rem; }
}
`;