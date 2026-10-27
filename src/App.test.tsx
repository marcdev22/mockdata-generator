import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { IDENTITY_STORAGE_KEY, saveSavedIdentities } from './services/identityStorage';
import { createTestIdentity } from './test/fixtures';

function getFieldValue(label: string): string {
  const labelElement = screen.getByText(label, { selector: 'dt' });
  const field = labelElement.closest('.field');

  return field?.querySelector('.field__value')?.textContent ?? '';
}

function getHistory(): HTMLElement {
  return screen.getByRole('complementary', { name: /Historial/ });
}

function createSavedFixture(id = 'saved-fixture') {
  return {
    ...createTestIdentity({ id }),
    savedAt: '2026-10-26T12:05:00.000Z',
  };
}

afterEach(() => {
  Reflect.deleteProperty(navigator, 'clipboard');
});

describe('App', () => {
  it('renders a generated, unsaved identity with all synthetic fields', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Identidades mexicanas ficticias/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sin guardar')).toBeInTheDocument();

    for (const label of [
      'Nombre completo',
      'Fecha de nacimiento',
      'Sexo',
      'Entidad de nacimiento',
      'CURP',
      'RFC',
      'NSS',
    ]) {
      expect(screen.getByText(label, { selector: 'dt' })).toBeInTheDocument();
    }

    expect(getFieldValue('CURP')).toMatch(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/);
    expect(getFieldValue('RFC')).toMatch(/^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/);
    expect(getFieldValue('NSS')).toMatch(/^\d{11}$/);
    expect(screen.getByText(/Identidad ficticia para pruebas/)).toBeInTheDocument();
    expect(screen.getByText(/Aún no hay identidades guardadas/)).toBeInTheDocument();
  });

  it('generates a different identity on demand', async () => {
    const user = userEvent.setup();
    render(<App />);
    const firstCurp = getFieldValue('CURP');

    await user.click(screen.getByRole('button', { name: 'Generar otra identidad' }));

    expect(getFieldValue('CURP')).not.toBe(firstCurp);
    expect(screen.getByRole('button', { name: 'Guardar en el historial' })).toBeEnabled();
  });

  it('saves the current identity, updates history, and persists it', async () => {
    const user = userEvent.setup();
    render(<App />);
    const curp = getFieldValue('CURP');
    const fullName = getFieldValue('Nombre completo');

    await user.click(screen.getByRole('button', { name: 'Guardar en el historial' }));

    expect(screen.getByRole('button', { name: 'Guardada en el historial' })).toBeDisabled();
    expect(screen.getByText('Identidad guardada en el historial.')).toBeInTheDocument();
    expect(within(getHistory()).getByText(fullName, { selector: 'h3' })).toBeInTheDocument();
    expect(within(getHistory()).getByText(curp)).toBeInTheDocument();
    expect(within(getHistory()).getByText('En pantalla')).toBeInTheDocument();

    const stored = JSON.parse(window.localStorage.getItem(IDENTITY_STORAGE_KEY) ?? '{}') as {
      version?: number;
      identities?: Array<Record<string, unknown>>;
    };

    expect(stored.version).toBe(1);
    expect(stored.identities).toHaveLength(1);
    expect(stored.identities?.[0]?.curp).toBe(curp);
    expect(stored.identities?.[0]?.isSynthetic).toBe(true);
  });

  it('loads a saved identity from history back into the main card', async () => {
    const user = userEvent.setup();
    render(<App />);
    const savedCurp = getFieldValue('CURP');
    const savedName = getFieldValue('Nombre completo');

    await user.click(screen.getByRole('button', { name: 'Guardar en el historial' }));
    await user.click(screen.getByRole('button', { name: 'Generar otra identidad' }));

    expect(getFieldValue('CURP')).not.toBe(savedCurp);

    await user.click(within(getHistory()).getByRole('button', { name: `Mostrar a ${savedName}` }));

    expect(getFieldValue('CURP')).toBe(savedCurp);
    expect(screen.getByRole('button', { name: 'Guardada en el historial' })).toBeDisabled();
  });

  it('removes an identity and marks the current one as unsaved', async () => {
    const user = userEvent.setup();
    render(<App />);
    const fullName = getFieldValue('Nombre completo');

    await user.click(screen.getByRole('button', { name: 'Guardar en el historial' }));
    await user.click(within(getHistory()).getByRole('button', { name: `Eliminar a ${fullName}` }));

    expect(within(getHistory()).getByText(/Aún no hay identidades guardadas/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar en el historial' })).toBeEnabled();
    expect(screen.getByText('Sin guardar')).toBeInTheDocument();
  });

  it('requires confirmation before clearing the entire history', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Guardar en el historial' }));
    await user.click(screen.getByRole('button', { name: 'Borrar todo el historial' }));

    expect(
      screen.getByRole('group', { name: 'Confirmar borrado del historial' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sí, borrar' }));

    expect(within(getHistory()).getByText(/Aún no hay identidades guardadas/)).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Confirmar borrado del historial' })).toBeNull();
    expect(screen.getByText('Sin guardar')).toBeInTheDocument();
  });

  it('copies a field and all data with accessible feedback', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    render(<App />);
    const curp = getFieldValue('CURP');

    await user.click(screen.getByRole('button', { name: 'Copiar CURP' }));

    expect(writeText).toHaveBeenCalledWith(curp);
    expect(screen.getByRole('button', { name: 'CURP: copiado' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Copiar todos los datos' }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining(`CURP: ${curp}`));
    expect(screen.getByRole('button', { name: 'Datos copiados' })).toBeInTheDocument();
  });

  it('restores persisted history on load', () => {
    const saved = createSavedFixture();

    saveSavedIdentities([saved]);
    render(<App />);

    expect(within(getHistory()).getByText(saved.fullName, { selector: 'h3' })).toBeInTheDocument();
    expect(within(getHistory()).getByText(saved.curp)).toBeInTheDocument();
    expect(screen.getByText('Sin guardar')).toBeInTheDocument();
  });
});
