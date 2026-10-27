import { CheckIcon, CopyIcon } from './Icons';

interface CopyButtonProps {
  readonly label: string;
  readonly copied: boolean;
  readonly onCopy: () => void;
}

export function CopyButton({ label, copied, onCopy }: CopyButtonProps) {
  return (
    <button
      type="button"
      className={`copy-button${copied ? ' is-copied' : ''}`}
      aria-label={copied ? `${label}: copiado` : `Copiar ${label}`}
      onClick={onCopy}
    >
      {copied ? <CheckIcon width={15} height={15} /> : <CopyIcon width={15} height={15} />}
      <span aria-hidden="true">{copied ? 'Copiado' : 'Copiar'}</span>
    </button>
  );
}
