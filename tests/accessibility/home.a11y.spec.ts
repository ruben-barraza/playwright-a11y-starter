import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

test('A11y: login page (no serious/critical)', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    // Limitamos a WCAG 2 A/AA (lo más pedido en empresa)
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  // Guardar JSON para CI
  fs.mkdirSync('test-results/a11y', { recursive: true });
  fs.writeFileSync('test-results/a11y/login-axe.json', JSON.stringify(results, null, 2));

  // Política: fallar solo con violaciones serias/críticas (recomendado en CI)
  const seriousOrHigher = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
  if (seriousOrHigher.length > 0) {
    console.log('A11y violations (serious/critical):\n', JSON.stringify(seriousOrHigher, null, 2));
  }
  expect(seriousOrHigher, 'Serious/Critical accessibility violations found').toHaveLength(0);
});
