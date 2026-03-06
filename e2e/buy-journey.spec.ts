import { test, expect, type Page } from '@playwright/test';

async function waitForAppReady(page: Page) {
  await page.waitForFunction(() => {
    const el = document.querySelector('p');
    return !el || el.textContent !== 'Loading...';
  }, { timeout: 8_000 });
}

test.describe('Buy Journey — anonymous user', () => {
  test('send buy message → morphs to chat → Yulia responds', async ({ page }) => {
    await page.goto('/buy');
    await waitForAppReady(page);

    const composer = page.locator('textarea').first();
    await composer.fill("I'm looking for HVAC companies in Texas under $5M");
    await composer.press('Enter');

    // Should morph to chat view
    await expect(page.getByText("I'm looking for HVAC companies")).toBeVisible({ timeout: 5_000 });

    // Yulia should respond
    await expect(page.locator('.prose').first()).toBeVisible({ timeout: 15_000 });
  });
});
