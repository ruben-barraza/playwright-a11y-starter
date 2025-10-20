import { test, expect } from '@playwright/test';

// Flujo: Login → Inventario → Add to cart → Checkout (overview) → Logout
test('E2E: purchase flow to overview then logout', async ({ page }) => {
  // baseURL lo definimos en playwright.config.ts
  await page.goto('/');

  // Login
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\.html/);

  // Inventario visible
  await expect(page.getByText('Products')).toBeVisible();

  // Add to cart (primer item)
  const firstAdd = page.locator('button:has-text("Add to cart")').first();
  await firstAdd.click();

  // Verifica que el contador marque 1
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

  // Cart
  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page).toHaveURL(/cart\.html/);

  // Checkout
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page).toHaveURL(/checkout-step-one\.html/);
  await page.getByPlaceholder('First Name').fill('John');
  await page.getByPlaceholder('Last Name').fill('Doe');
  await page.getByPlaceholder('Zip/Postal Code').fill('12345');
  await page.getByRole('button', { name: 'Continue' }).click();

  // Overview
  await expect(page).toHaveURL(/checkout-step-two\.html/);
  await expect(page.getByText('Payment Information')).toBeVisible();

  // Logout (desde el menú)
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page).toHaveURL('/');
});
