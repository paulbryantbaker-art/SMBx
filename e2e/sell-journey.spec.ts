import { test, expect, type Page } from '@playwright/test';

async function waitForAppReady(page: Page) {
  await page.waitForFunction(() => {
    const el = document.querySelector('p');
    return !el || el.textContent !== 'Loading...';
  }, { timeout: 8_000 });
}

test.describe('Sell Journey — anonymous user', () => {
  test('send sell message → morphs to chat → Yulia responds', async ({ page }) => {
    await page.goto('/sell');
    await waitForAppReady(page);

    // Type a sell message
    const composer = page.locator('textarea').first();
    await composer.fill('I want to sell my pest control business doing $1.8M revenue in Dallas');
    await composer.press('Enter');

    // Should morph to chat view
    await expect(page.getByText('I want to sell my pest control business')).toBeVisible({ timeout: 5_000 });

    // Yulia should respond (streaming appears within 15s)
    await expect(page.locator('.prose').first()).toBeVisible({ timeout: 15_000 });
  });

  test('chat persists across page reload', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Send a message
    const composer = page.locator('textarea').first();
    await composer.fill('Tell me about selling a business');
    await composer.press('Enter');

    // Wait for response
    await expect(page.locator('.prose').first()).toBeVisible({ timeout: 15_000 });

    // Reload
    await page.reload();
    await waitForAppReady(page);

    // Conversation should be in sidebar
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Tell me about')).toBeVisible({ timeout: 5_000 });
  });
});
