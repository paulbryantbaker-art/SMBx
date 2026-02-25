import { test, expect, type Page } from '@playwright/test';

/* ── Helper: wait for React to finish the auth-loading spinner ── */
async function waitForAppReady(page: Page) {
  await page.waitForFunction(() => {
    const el = document.querySelector('p');
    return !el || el.textContent !== 'Loading...';
  }, { timeout: 5_000 });
}

/* ═══════════════════════════════════════════════════════
   Group 1 — Public route pages render correct content
   ═══════════════════════════════════════════════════════ */

test.describe('Public route pages', () => {
  test('/ → Home landing', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await expect(page.getByText('Sell a business.')).toBeVisible();
    await expect(page.getByText('Buy a business.')).toBeVisible();
    await expect(page.getByText('Raise capital.')).toBeVisible();
  });

  test('/sell → Sell page', async ({ page }) => {
    await page.goto('/sell');
    await waitForAppReady(page);
    await expect(page.getByText('Sell Your Business')).toBeVisible();
    await expect(page.getByText('own the exit.')).toBeVisible();
  });

  test('/buy → Buy page', async ({ page }) => {
    await page.goto('/buy');
    await waitForAppReady(page);
    await expect(page.getByText('Buy a Business')).toBeVisible();
    await expect(page.getByText('Find the right deal.')).toBeVisible();
  });

  test('/raise → Raise page', async ({ page }) => {
    await page.goto('/raise');
    await waitForAppReady(page);
    await expect(page.getByRole('main').getByText('Raise Capital')).toBeVisible();
    await expect(page.getByText('Raise smart.')).toBeVisible();
  });

  test('/integrate → Integrate page', async ({ page }) => {
    await page.goto('/integrate');
    await waitForAppReady(page);
    await expect(page.getByText('Post-Acquisition')).toBeVisible();
  });

  test('/pricing → Pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await waitForAppReady(page);
    await expect(page.getByText('before you start.')).toBeVisible();
  });

  test('/how-it-works → How It Works page', async ({ page }) => {
    await page.goto('/how-it-works');
    await waitForAppReady(page);
    await expect(page.getByText('Talk to Yulia. She handles')).toBeVisible();
  });

  test('/enterprise → Enterprise page', async ({ page }) => {
    await page.goto('/enterprise');
    await waitForAppReady(page);
    await expect(page.getByText('For Professionals')).toBeVisible();
    await expect(page.getByText('horsepower.')).toBeVisible();
  });

  test('/login → Login page', async ({ page }) => {
    await page.goto('/login');
    await waitForAppReady(page);
    await expect(page.getByText('Sign in to your account')).toBeVisible();
  });

  test('/signup → Signup page', async ({ page }) => {
    await page.goto('/signup');
    await waitForAppReady(page);
    await expect(page.getByText('Create your account')).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════
   Group 2 — Home inline journey navigation (pushState)
   Catches the bug where pushState('/sell') collided with
   wouter's <Route path="/sell">
   ═══════════════════════════════════════════════════════ */

test.describe('Home inline journey cards', () => {
  test('Sell card → shows SELL-SIDE inline, not /sell page', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await page.getByText('Sell my business').click();
    await expect(page.getByText('SELL-SIDE')).toBeVisible();
    expect(page.url()).toContain('/#sell');
    // The standalone Sell page's hero should NOT be present
    await expect(page.getByText('Sell Your Business')).not.toBeVisible();
  });

  test('Buy card → shows BUY-SIDE inline, not /buy page', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await page.locator('.home-acard', { hasText: 'Buy a business' }).click();
    await expect(page.getByText('BUY-SIDE')).toBeVisible();
    expect(page.url()).toContain('/#buy');
    await expect(page.getByText('Buy a Business')).not.toBeVisible();
  });

  test('Raise card → shows RAISE CAPITAL inline, not /raise page', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await page.locator('.home-acard', { hasText: 'Raise capital' }).click();
    await expect(page.getByText('RAISE CAPITAL')).toBeVisible();
    expect(page.url()).toContain('/#raise');
  });
});

/* ═══════════════════════════════════════════════════════
   Group 3 — Hash deep links
   ═══════════════════════════════════════════════════════ */

test.describe('Hash deep links', () => {
  test('/#sell → SELL-SIDE inline journey', async ({ page }) => {
    await page.goto('/#sell');
    await waitForAppReady(page);
    await expect(page.getByText('SELL-SIDE')).toBeVisible();
  });

  test('/#buy → BUY-SIDE inline journey', async ({ page }) => {
    await page.goto('/#buy');
    await waitForAppReady(page);
    await expect(page.getByText('BUY-SIDE')).toBeVisible();
  });

  test('/#raise → RAISE CAPITAL inline journey', async ({ page }) => {
    await page.goto('/#raise');
    await waitForAppReady(page);
    await expect(page.getByText('RAISE CAPITAL')).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════
   Group 4 — Browser back button
   ═══════════════════════════════════════════════════════ */

test.describe('Browser back', () => {
  test('click sell card → back → returns to landing', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await page.getByText('Sell my business').click();
    await expect(page.getByText('SELL-SIDE')).toBeVisible();
    await page.goBack();
    await expect(page.getByText('Sell a business.')).toBeVisible();
    await expect(page.getByText('SELL-SIDE')).not.toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════
   Group 5 — Chat entry from dock composer
   ═══════════════════════════════════════════════════════ */

test.describe('Dock composer', () => {
  test('typing and sending shows user message', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    const composer = page.getByPlaceholder('Tell Yulia about your deal...');
    await composer.fill('I own an HVAC company');
    await composer.press('Enter');
    await expect(page.getByText('I own an HVAC company')).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════
   Group 6 — Catch-all redirect
   ═══════════════════════════════════════════════════════ */

test.describe('Catch-all redirect', () => {
  test('/nonexistent → redirects to Home', async ({ page }) => {
    await page.goto('/nonexistent');
    await waitForAppReady(page);
    await expect(page.getByText('Sell a business.')).toBeVisible();
  });
});
