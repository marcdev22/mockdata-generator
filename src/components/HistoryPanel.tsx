import { useMemo, useState } from 'react';

import { formatSavedAt } from '../domain/format';
import type { SavedIdentity } from '../domain/types';
import { CheckIcon, ClockIcon, CopyIcon, EyeIcon, SearchIcon, TrashIcon } from './Icons';

interface HistoryPanelProps {
  readonly identities: readonly SavedIdentity[];
  readonly currentId: string;
  readonly copiedKey: string | null;
  readonly onSelect: (identity: SavedIdentity) => void;
  readonly onCopy: (identity: SavedIdentity) => void;
  readonly onRemove: (id: string) => void;
  readonly onClear: () => void;
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es-MX');
}

export function HistoryPanel({
  identities,
  currentId,
  copiedKey,
  onSelect,
  onCopy,
  onRemove,
  onClear,
}: HistoryPanelProps) {
  const [query, setQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const copiedIdentity = identities.find((identity) => copiedKey === `saved-${identity.id}`);

  const filteredIdentities = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query.trim());

    if (!normalizedQuery) {
      return identities;
    }

    return identities.filter((identity) =>
      normalizeSearchValue(
        `${identity.fullName} ${identity.curp} ${identity.rfc} ${identity.nss}`,
      ).includes(normalizedQuery),
    );
  }, [identities, query]);

  const handleClear = () => {
    onClear();
    setConfirmClear(false);
    setQuery('');
  };

  return (
    <aside className="history-panel" aria-labelledby="history-title">
      <header className="history-panel__header">
        <div className="history-panel__title-row">
          <div>
            <p className="eyebrow">Guardadas en este navegador</p>
            <h2 id="history-title">
              Historial <span className="count-badge">{identities.length}</span>
            </h2>
          </div>
          {identities.length > 0 ? (
            <button
              type="button"
              className="icon-button icon-button--danger"
              aria-label="Borrar todo el historial"
              onClick={() => setConfirmClear(true)}
            >
              <TrashIcon />
            </button>
          ) : null}
        </div>

        {identities.length > 0 ? (
          <div className="search-field">
            <SearchIcon width={18} height={18} />
            <label htmlFor="history-search" className="visually-hidden">
              Buscar en el historial
            </label>
            <input
              id="history-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar nombre, CURP, RFC o NSS"
              autoComplete="off"
            />
          </div>
        ) : null}

        {confirmClear ? (
          <div
            className="confirm-strip"
            role="group"
            aria-label="Confirmar borrado del historial"
            aria-live="polite"
          >
            <p>¿Borrar las {identities.length} identidades guardadas?</p>
            <div className="confirm-strip__actions">
              <button
                type="button"
                className="mini-button mini-button--danger"
                onClick={handleClear}
              >
                Sí, borrar
              </button>
              <button type="button" className="mini-button" onClick={() => setConfirmClear(false)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <div className="history-panel__body">
        {identities.length === 0 ? (
          <div className="history-empty">
            <span className="history-empty__mark" aria-hidden="true">
              +50
            </span>
            <h3>Aún no hay identidades guardadas</h3>
            <p>Usa “Guardar en el historial” para conservar una identidad en este navegador.</p>
          </div>
        ) : filteredIdentities.length === 0 ? (
          <div className="history-empty history-empty--compact">
            <h3>Sin resultados</h3>
            <p>Prueba con otro nombre, CURP, RFC o NSS.</p>
          </div>
        ) : (
          <ul className="history-list">
            {filteredIdentities.map((identity) => {
              const isCurrent = identity.id === currentId;
              const copyKey = `saved-${identity.id}`;
              const copied = copiedKey === copyKey;

              return (
                <li key={identity.id}>
                  <article
                    className={`saved-card${isCurrent ? ' saved-card--current' : ''}`}
                    aria-label={`Identidad de ${identity.fullName}`}
                  >
                    <div className="saved-card__top">
                      <h3>{identity.fullName}</h3>
                      {isCurrent ? <span className="current-chip">En pantalla</span> : null}
                    </div>
                    <p className="saved-card__curp">{identity.curp}</p>
                    <p className="saved-card__meta">
                      <ClockIcon width={13} height={13} />
                      {formatSavedAt(identity.savedAt)}
                    </p>
                    <div className="saved-card__actions">
                      <button
                        type="button"
                        className="mini-button"
                        aria-label={`Mostrar a ${identity.fullName}`}
                        onClick={() => onSelect(identity)}
                      >
                        <EyeIcon width={14} height={14} />
                        Ver
                      </button>
                      <button
                        type="button"
                        className={`mini-button${copied ? ' mini-button--success' : ''}`}
                        aria-label={
                          copied
                            ? `Datos copiados de ${identity.fullName}`
                            : `Copiar datos de ${identity.fullName}`
                        }
                        onClick={() => onCopy(identity)}
                      >
                        {copied ? (
                          <CheckIcon width={14} height={14} />
                        ) : (
                          <CopyIcon width={14} height={14} />
                        )}
                        {copied ? 'Copiado' : 'Copiar'}
                      </button>
                      <button
                        type="button"
                        className="icon-button icon-button--danger icon-button--small"
                        aria-label={`Eliminar a ${identity.fullName}`}
                        onClick={() => onRemove(identity.id)}
                      >
                        <TrashIcon width={15} height={15} />
                      </button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <footer className="history-panel__footer">
        <p>Máximo 50 identidades. Se guardan solo en este navegador.</p>
      </footer>
      <p className="visually-hidden" role="status" aria-live="polite">
        {copiedIdentity ? `Datos de ${copiedIdentity.fullName} copiados al portapapeles.` : ''}
      </p>
    </aside>
  );
}
