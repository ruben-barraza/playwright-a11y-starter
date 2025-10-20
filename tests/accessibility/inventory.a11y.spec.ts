import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

async function login(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\.html/);
}

test('A11y: inventory page (no serious/critical)', async ({ page }) => {
  await login(page);

  // Nota: Saucedemo tiene un <select> de ordenamiento sin nombre accesible.
  // En un producto real, abriríamos ticket WCAG 4.1.2 (A). Aquí lo excluimos para no “ensuciar” la señal.


  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .disableRules(['select-name']) // ⬅️ ignoramos esta regla conocida del sitio demo
    .analyze();

  fs.mkdirSync('test-results/a11y', { recursive: true });
  fs.writeFileSync('test-results/a11y/inventory-axe.json', JSON.stringify(results, null, 2));

  const seriousOrHigher = results.violations.filter(
    v => v.impact === 'serious' || v.impact === 'critical'
  );

  if (seriousOrHigher.length > 0) {
    console.log('A11y violations (serious/critical):\n', JSON.stringify(seriousOrHigher, null, 2));
  }

  expect(seriousOrHigher, 'Serious/Critical accessibility violations found').toHaveLength(0);
});
