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
    await expect(page.getByText("What's the deal?")).toBeVisible();
    await expect(page.getByText('I want to sell my business')).toBeVisible();
    await expect(page.getByText('Looking to buy a business')).toBeVisible();
  });

  test('/sell → Sell page', async ({ page }) => {
    await page.goto('/sell');
    await waitForAppReady(page);
    await expect(page.getByText('profoundly regret it')).toBeVisible();
  });

  test('/buy → Buy page', async ({ page }) => {
    await page.goto('/buy');
    await waitForAppReady(page);
    await expect(page.getByText('Find the right deal.')).toBeVisible();
  });

  test('/raise → Raise page', async ({ page }) => {
    await page.goto('/raise');
    await waitForAppReady(page);
    await expect(page.getByText('Raise Capital')).toBeVisible();
  });

  test('/integrate → Integrate page', async ({ page }) => {
    await page.goto('/integrate');
    await waitForAppReady(page);
    await expect(page.getByText('Post-Acquisition')).toBeVisible();
  });

  test('/pricing → Pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await waitForAppReady(page);
    await expect(page.getByText('Start free. Stay because it works.')).toBeVisible();
  });

  test('/how-it-works → How It Works page', async ({ page }) => {
    await page.goto('/how-it-works');
    await waitForAppReady(page);
    await expect(page.getByText('Talk to Yulia. She handles')).toBeVisible();
  });

  test('/enterprise → Advisors/Enterprise page', async ({ page }) => {
    await page.goto('/enterprise');
    await waitForAppReady(page);
    await expect(page.getByText('FOR ADVISORS & BROKERS')).toBeVisible();
    await expect(page.getByText('480 hours.')).toBeVisible();
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

test.describe('Home journey chips route to chat', () => {
  test('Sell chip navigates to chat', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    const sellChip = page.getByText('I want to sell my business');
    await expect(sellChip).toBeVisible();
  });

  test('Buy chip navigates to chat', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    const buyChip = page.getByText('Looking to buy a business');
    await expect(buyChip).toBeVisible();
  });

  test('Raise chip navigates to chat', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    const raiseChip = page.getByText('Need to raise capital');
    await expect(raiseChip).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════
   Group 3 — Hash deep links
   ═══════════════════════════════════════════════════════ */

test.describe('Direct journey URLs load correctly', () => {
  test('/sell → Sell page content', async ({ page }) => {
    await page.goto('/sell');
    await waitForAppReady(page);
    await expect(page.getByText('profoundly regret it')).toBeVisible();
  });

  test('/buy → Buy page content', async ({ page }) => {
    await page.goto('/buy');
    await waitForAppReady(page);
    await expect(page.getByText('Find the right deal.')).toBeVisible();
  });

  test('/raise → Raise page content', async ({ page }) => {
    await page.goto('/raise');
    await waitForAppReady(page);
    await expect(page.getByText('Raise Capital')).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════
   Group 4 — Browser back button
   ═══════════════════════════════════════════════════════ */

test.describe('Browser navigation', () => {
  test('/sell → back → returns to home', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await page.goto('/sell');
    await waitForAppReady(page);
    await page.goBack();
    await waitForAppReady(page);
    await expect(page.getByText("What's the deal?")).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════
   Group 5 — Chat entry from dock composer
   ═══════════════════════════════════════════════════════ */

test.describe('Dock composer', () => {
  test('typing and sending shows user message', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    const composer = page.getByPlaceholder('Message Yulia...');
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
    await expect(page.getByText("What's the deal?")).toBeVisible();
  });
});
