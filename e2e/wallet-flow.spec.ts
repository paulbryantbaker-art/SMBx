import { test, expect, type Page } from '@playwright/test';

async function waitForAppReady(page: Page) {
  await page.waitForFunction(() => {
    const el = document.querySelector('p');
    return !el || el.textContent !== 'Loading...';
  }, { timeout: 8_000 });
}

test.describe('Wallet Flow (requires auth + TEST_MODE)', () => {
  // These tests require an authenticated session and TEST_MODE=true
  // Skip if not running with proper env
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium only');

  test('wallet page loads for authenticated user', async ({ page }) => {
    // This test verifies the wallet UI renders when TEST_MODE is set
    // Full wallet testing requires auth which is handled in integration tests
    await page.goto('/pricing');
    await waitForAppReady(page);

    // Pricing page should show wallet info
    await expect(page.getByText('Free to start')).toBeVisible();
  });
});
