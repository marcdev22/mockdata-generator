import { getIdentityFields } from '../domain/format';
import type { SyntheticIdentity } from '../domain/types';
import { CheckIcon, CopyIcon, SaveIcon, SparkIcon } from './Icons';
import { CopyButton } from './CopyButton';

interface IdentityCardProps {
  readonly identity: SyntheticIdentity;
  readonly isSaved: boolean;
  readonly copiedKey: string | null;
  readonly onCopyField: (key: string, value: string) => void;
  readonly onCopyAll: () => void;
  readonly onSave: () => void;
}

export function IdentityCard({
  identity,
  isSaved,
  copiedKey,
  onCopyField,
  onCopyAll,
  onSave,
}: IdentityCardProps) {
  const fields = getIdentityFields(identity);
  const allCopied = copiedKey === 'all';
  const copiedField = fields.find((field) => field.key === copiedKey);
  const copyAnnouncement =
    copiedKey === 'all'
      ? 'Todos los datos copiados al portapapeles.'
      : copiedField
        ? `${copiedField.label} copiado al portapapeles.`
        : '';

  return (
    <article className="identity-card" aria-labelledby="identity-title">
      <header className="identity-card__bar">
        <div>
          <p className="eyebrow">Generada localmente</p>
          <h2 id="identity-title">Tu identidad</h2>
        </div>
        <span className={`status-chip${isSaved ? ' status-chip--saved' : ''}`}>
          {isSaved ? 'Guardada' : 'Sin guardar'}
        </span>
      </header>

      <div className="identity-card__body">
        <dl className="field-grid">
          {fields.map((field) => (
            <div
              className={`field${field.wide ? ' field--wide' : ''}${
                field.key === 'fullName' ? ' field--name' : ''
              }`}
              key={field.key}
            >
              <dt>{field.label}</dt>
              <dd>
                <span className={`field__value${field.monospace ? ' field__value--mono' : ''}`}>
                  {field.value}
                </span>
                <CopyButton
                  label={field.label}
                  copied={copiedKey === field.key}
                  onCopy={() => onCopyField(field.key, field.value)}
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <footer className="identity-card__footer">
        <p className="disclaimer">
          <SparkIcon width={18} height={18} />
          <span>
            Identidad ficticia para pruebas. CURP y RFC respetan estructura y dígito verificador; el
            NSS usa una validación Luhn no oficial. No uses estos datos como documentos reales.
          </span>
        </p>
        <div className="card-actions">
          <button
            type="button"
            className={`button button--secondary${allCopied ? ' button--success' : ''}`}
            onClick={onCopyAll}
          >
            {allCopied ? <CheckIcon /> : <CopyIcon />}
            {allCopied ? 'Datos copiados' : 'Copiar todos los datos'}
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={onSave}
            disabled={isSaved}
          >
            {isSaved ? <CheckIcon /> : <SaveIcon />}
            {isSaved ? 'Guardada en el historial' : 'Guardar en el historial'}
          </button>
        </div>
      </footer>
      <p className="visually-hidden" role="status" aria-live="polite">
        {copyAnnouncement}
      </p>
    </article>
  );
}
