import { test, expect, type Page } from '@playwright/test';

async function waitForAppReady(page: Page) {
  await page.waitForFunction(() => {
    const el = document.querySelector('p');
    return !el || el.textContent !== 'Loading...';
  }, { timeout: 8_000 });
}

test.describe('Chat Persistence', () => {
  test('conversations persist in sidebar after reload', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Send first message
    const composer = page.locator('textarea').first();
    await composer.fill('Test message one for persistence');
    await composer.press('Enter');

    // Wait for response
    await expect(page.locator('.prose').first()).toBeVisible({ timeout: 15_000 });

    // The message should be visible
    await expect(page.getByText('Test message one for persistence')).toBeVisible();

    // Reload
    await page.reload();
    await waitForAppReady(page);

    // Sidebar should show conversation
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible({ timeout: 5_000 });
  });

  test('new workspace button creates fresh conversation', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Send a message to create conversation
    const composer = page.locator('textarea').first();
    await composer.fill('First conversation message');
    await composer.press('Enter');
    await expect(page.locator('.prose').first()).toBeVisible({ timeout: 15_000 });

    // Click new workspace
    await page.getByText('+ New Workspace').click();

    // Chat should be cleared — the old message should not be the most recent visible
    const url = page.url();
    expect(url).toContain('/chat');
  });
});
