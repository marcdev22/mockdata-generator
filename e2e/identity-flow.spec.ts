import { expect, test, type Page } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

function fieldValue(page: Page, label: string) {
  return page
    .locator('.field')
    .filter({ has: page.locator('dt').filter({ hasText: label }) })
    .locator('.field__value');
}

function historyPanel(page: Page) {
  return page.getByRole('complementary', { name: /Historial/ });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test('generates, copies, saves, and restores an identity after reload', async ({ page }) => {
  const curpField = fieldValue(page, 'CURP');
  const nameField = fieldValue(page, 'Nombre completo');
  const firstCurp = await curpField.innerText();
  const firstCurpPattern = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Identidades mexicanas ficticias',
  );
  await expect(page.getByText('Sin guardar')).toBeVisible();
  await expect(curpField).toHaveText(firstCurpPattern);
  await expect(fieldValue(page, 'RFC')).toHaveText(/^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/);
  await expect(fieldValue(page, 'NSS')).toHaveText(/^\d{11}$/);

  await page.getByRole('button', { name: 'Generar otra identidad' }).click();
  await expect(curpField).not.toHaveText(firstCurp);

  const savedCurp = await curpField.innerText();
  const savedName = await nameField.innerText();

  await page.getByRole('button', { name: 'Copiar CURP' }).click();
  await expect(page.getByRole('button', { name: 'CURP: copiado' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(savedCurp);

  await page.getByRole('button', { name: 'Copiar todos los datos' }).click();
  await expect(page.getByRole('button', { name: 'Datos copiados' })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain(`CURP: ${savedCurp}`);

  await page.getByRole('button', { name: 'Guardar en el historial' }).click();
  await expect(page.getByText('Identidad guardada en el historial.')).toBeVisible();
  await expect(
    historyPanel(page).getByRole('article', { name: `Identidad de ${savedName}` }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Guardada en el historial' })).toBeDisabled();

  await page.reload();

  const restoredCard = historyPanel(page).getByRole('article', {
    name: `Identidad de ${savedName}`,
  });

  await expect(restoredCard).toBeVisible();
  await expect(restoredCard).toContainText(savedCurp);
  await expect(page.getByText('Sin guardar')).toBeVisible();

  await restoredCard.getByRole('button', { name: `Mostrar a ${savedName}` }).click();

  await expect(curpField).toHaveText(savedCurp);
  await expect(page.getByRole('button', { name: 'Guardada en el historial' })).toBeDisabled();
});

test('searches, deletes, and clears saved identities', async ({ page }) => {
  const generate = () => page.getByRole('button', { name: 'Generar otra identidad' }).click();
  const save = () => page.getByRole('button', { name: 'Guardar en el historial' }).click();

  await save();
  const firstName = await fieldValue(page, 'Nombre completo').innerText();
  await generate();
  const secondName = await fieldValue(page, 'Nombre completo').innerText();
  await save();

  const history = historyPanel(page);
  const firstCard = history.getByRole('article', { name: `Identidad de ${firstName}` });
  const secondCard = history.getByRole('article', { name: `Identidad de ${secondName}` });

  await expect(firstCard).toBeVisible();
  await expect(secondCard).toBeVisible();

  await page.getByRole('searchbox', { name: 'Buscar en el historial' }).fill(secondName);
  await expect(secondCard).toBeVisible();
  await expect(firstCard).toHaveCount(0);

  await page.getByRole('searchbox', { name: 'Buscar en el historial' }).fill('');
  await firstCard.getByRole('button', { name: `Eliminar a ${firstName}` }).click();
  await expect(firstCard).toHaveCount(0);
  await expect(secondCard).toBeVisible();

  await page.getByRole('button', { name: 'Borrar todo el historial' }).click();
  await expect(page.getByRole('group', { name: 'Confirmar borrado del historial' })).toBeVisible();
  await page.getByRole('button', { name: 'Sí, borrar' }).click();

  await expect(history.getByText('Aún no hay identidades guardadas')).toBeVisible();
  await expect(page.getByText('Sin guardar')).toBeVisible();
});

test('remains usable without horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  await expect(page.getByRole('button', { name: 'Generar otra identidad' })).toBeVisible();
  await expect(fieldValue(page, 'CURP')).toBeVisible();

  await page.getByRole('button', { name: 'Guardar en el historial' }).click();
  await expect(historyPanel(page).getByText('En pantalla')).toBeVisible();

  const checkOverflow = () =>
    page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);

  expect(await checkOverflow()).toBe(false);

  await page.setViewportSize({ width: 320, height: 720 });

  await expect(page.getByRole('heading', { name: /Historial/ })).toBeVisible();
  expect(await checkOverflow()).toBe(false);
});
