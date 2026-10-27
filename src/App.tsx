import { useEffect, useMemo, useState } from 'react';

import { HistoryPanel } from './components/HistoryPanel';
import { CloseIcon, ShuffleIcon, SparkIcon } from './components/Icons';
import { IdentityCard } from './components/IdentityCard';
import { formatIdentityForClipboard } from './domain/format';
import { NssUniquenessError } from './domain/errors';
import { generateSyntheticIdentity } from './domain/identity';
import type { SavedIdentity, SyntheticIdentity } from './domain/types';
import { useClipboard } from './hooks/useClipboard';
import { useSavedIdentities } from './hooks/useSavedIdentities';

function App() {
  const {
    identities,
    storageError,
    saveIdentity,
    removeIdentity,
    clearIdentities,
    dismissStorageError,
  } = useSavedIdentities();
  const { copiedKey, copyError, copy, dismissCopyError } = useClipboard();
  const existingNss = useMemo(
    () => new Set(identities.map((identity) => identity.nss)),
    [identities],
  );
  const [identity, setIdentity] = useState<SyntheticIdentity>(() =>
    generateSyntheticIdentity({ existingNss }),
  );
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isCurrentSaved = identities.some((saved) => saved.id === identity.id);
  const hasAlerts = Boolean(generationError || storageError || copyError);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = window.setTimeout(() => setNotice(null), 2800);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  const handleGenerate = () => {
    try {
      setIdentity(generateSyntheticIdentity({ existingNss }));
      setGenerationError(null);
      setNotice(null);
    } catch (error) {
      setGenerationError(
        error instanceof NssUniquenessError
          ? 'No quedan NSS únicos disponibles. Elimina alguna identidad del historial e inténtalo de nuevo.'
          : 'No se pudo generar la identidad. Inténtalo de nuevo.',
      );
    }
  };

  const handleSave = () => {
    if (saveIdentity(identity)) {
      setNotice('Identidad guardada en el historial.');
    }
  };

  const handleRemove = (id: string) => {
    if (removeIdentity(id)) {
      setNotice('Identidad eliminada del historial.');
    }
  };

  const handleClear = () => {
    if (clearIdentities()) {
      setNotice('Historial borrado.');
    }
  };

  const handleSelect = (saved: SavedIdentity) => {
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setIdentity(saved);
    setNotice(null);
    document.getElementById('identity-panel')?.scrollIntoView?.({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const handleCopySaved = (saved: SavedIdentity) => {
    void copy(`saved-${saved.id}`, formatIdentityForClipboard(saved));
  };

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <div className="app-shell">
        <header className="site-header">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">
              AD
            </span>
            <span>
              <strong>Datos de Prueba</strong>
              <small>Identidades sintéticas</small>
            </span>
          </div>
          <div className="header-badges">
            <span className="pill">Solo navegador</span>
            <span className="pill pill--accent">100% sintético</span>
          </div>
        </header>

        <main id="contenido">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero__copy">
              <p className="kicker">
                <SparkIcon width={16} height={16} />
                Generador de datos de prueba
              </p>
              <h1 id="hero-title">
                Identidades mexicanas <span className="highlight">ficticias</span>, listas para
                probar.
              </h1>
              <p className="hero__lede">
                Genera nombres, fechas de nacimiento, CURP, RFC y NSS coherentes en un clic. Todo se
                crea en tu navegador, sin cuentas, servidores ni datos reales.
              </p>
              <div className="hero__actions">
                <button
                  type="button"
                  className="button button--primary button--large"
                  onClick={handleGenerate}
                >
                  <ShuffleIcon />
                  Generar otra identidad
                </button>
                <span className="hero__hint">
                  CURP y RFC con dígito verificador · NSS Luhn no oficial
                </span>
              </div>
            </div>

            <div className="hero__visual" aria-hidden="true">
              <div className="stamp">
                <span>Test data</span>
                <strong>TEST</strong>
                <span>No real</span>
              </div>
              <div className="hero__ticker">
                <span>CURP</span>
                <span>RFC</span>
                <span>NSS</span>
              </div>
            </div>
          </section>

          {hasAlerts ? (
            <div className="alert-stack">
              {generationError ? (
                <div className="alert alert--error" role="alert">
                  <p>{generationError}</p>
                  <button
                    type="button"
                    className="alert__close"
                    aria-label="Cerrar aviso de generación"
                    onClick={() => setGenerationError(null)}
                  >
                    <CloseIcon width={16} height={16} />
                  </button>
                </div>
              ) : null}
              {copyError ? (
                <div className="alert alert--error" role="alert">
                  <p>{copyError}</p>
                  <button
                    type="button"
                    className="alert__close"
                    aria-label="Cerrar aviso de copiado"
                    onClick={dismissCopyError}
                  >
                    <CloseIcon width={16} height={16} />
                  </button>
                </div>
              ) : null}
              {storageError ? (
                <div className="alert alert--warning" role="alert">
                  <p>{storageError}</p>
                  <button
                    type="button"
                    className="alert__close"
                    aria-label="Cerrar aviso de almacenamiento"
                    onClick={dismissStorageError}
                  >
                    <CloseIcon width={16} height={16} />
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="workspace">
            <div id="identity-panel">
              <IdentityCard
                key={identity.id}
                identity={identity}
                isSaved={isCurrentSaved}
                copiedKey={copiedKey}
                onCopyField={(key, value) => void copy(key, value)}
                onCopyAll={() => void copy('all', formatIdentityForClipboard(identity))}
                onSave={handleSave}
              />
            </div>

            <HistoryPanel
              identities={identities}
              currentId={identity.id}
              copiedKey={copiedKey}
              onSelect={handleSelect}
              onCopy={handleCopySaved}
              onRemove={handleRemove}
              onClear={handleClear}
            />
          </div>
        </main>

        <footer className="site-footer">
          <p>Datos de Prueba · Identidades ficticias para QA, demos y desarrollo.</p>
          <p>Nada sale de tu navegador.</p>
        </footer>
      </div>

      {notice ? (
        <div className="toast" role="status" aria-live="polite">
          {notice}
        </div>
      ) : null}
    </>
  );
}

export default App;
