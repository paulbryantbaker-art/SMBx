# smbx.ai — Go-Live Checklist & Release Schedule
**Last updated:** 2026-04-07
**Owner:** Paul
**Environment:** Production (Railway) — smbx.ai

---

## Release Phases

### Phase 1: PREVIEW (Let people kick the tires)
People can sign up, talk to Yulia, get real analysis, 90-day Professional trial. No payments, no email delivery, files don't persist across redeploys. Good enough for LinkedIn promotion and early feedback.

### Phase 2: INFRASTRUCTURE (2.5 hours of setup)
S3 for file persistence, Resend for emails, domain security. After this, the product is real — files survive redeploys, users get welcome/verification emails, passkeys work on your domain.

### Phase 3: DAY 1 GO-LIVE (Full launch)
Stripe live, Google OAuth live, monitoring, analytics APIs. Everything works, people can pay, the full product experience.

---

## Phase 1: PREVIEW — Current State

These work RIGHT NOW and are ready for LinkedIn promotion:

- [x] Home page loads on desktop and mobile (warm paper aesthetic)
- [x] New G3 logo family (light/dark/icon) across all pages
- [x] Dark mode toggle works
- [x] 7 journey pages with SEO + interactive calculators
- [x] Anonymous chat works (no login required)
- [x] Yulia responds with deal intelligence (Claude Sonnet 4.6)
- [x] 90-day Professional trial auto-granted on signup
- [x] Email/password registration works
- [x] Admin console at /admin with metrics, users, traffic, issues
- [x] Page view tracking with IP capture for geo
- [x] Interactive financial models (10 models in canvas)
- [x] PDF/DOCX/XLSX export
- [x] Tabbed canvas system
- [x] TEST_MODE=true bypasses all paywalls

### Known Limitations in Preview
- [ ] **Google Sign-In not working** — `GOOGLE_CLIENT_ID` env var not set (see Phase 2)
- [ ] **Uploaded files lost on redeploy** — no S3 yet (see Phase 2)
- [ ] **Emails don't send** — no Resend configured (see Phase 2)
- [ ] **Payments not live** — TEST_MODE=true, Stripe not configured (see Phase 3)

---

## Phase 2: INFRASTRUCTURE — ~2.5 Hours of Setup

Complete these in order. Each step is independent — you can stop after any one and everything before it works.

### Hour 1: S3 (File Persistence — P0 Blocker)

Without S3, uploaded files (tax returns, P&Ls, financials) are lost on every Railway redeploy. This is the #1 infrastructure blocker.

**Steps:**
1. Go to **aws.amazon.com** → create account (or sign in)
2. **S3** → Create bucket → `smbx-uploads` → `us-east-1` → all defaults
3. **IAM** → Create user → `smbx-app` → Attach `AmazonS3FullAccess` → Create access key → **save both keys**
4. **Railway** → set these 4 env vars:
   ```
   S3_BUCKET=smbx-uploads
   S3_REGION=us-east-1
   AWS_ACCESS_KEY_ID=<your access key>
   AWS_SECRET_ACCESS_KEY=<your secret key>
   ```
5. Redeploy
6. **Test:** Upload a file in chat, redeploy again, verify file is still accessible

**Result:** Files persist forever. Users can upload financials and they survive any deployment.

### Hour 2: Resend (Emails Actually Send)

Without Resend, welcome emails, password reset, verification, and deal notifications silently fail.

**Steps:**
1. Go to **resend.com** → create account (free tier = 3,000 emails/month)
2. **Add domain** → `smbx.ai` → add the DNS records they provide (MX, TXT, DKIM)
3. Wait for DNS propagation (usually 5-15 minutes, can take up to 1 hour)
4. **Railway** → set these env vars:
   ```
   RESEND_API_KEY=re_xxxxxxxxx
   EMAIL_FROM=Yulia <yulia@smbx.ai>
   ```
5. Redeploy
6. **Test:** Register a new account → check for welcome email

**Result:** Welcome emails, password reset, email verification, deal notifications all work.

### Hour 2.5: Google OAuth + Domain Security

**Google Sign-In (currently broken):**
1. Go to **Google Cloud Console** → APIs & Services → Credentials
2. Create (or find) **OAuth 2.0 Client ID** → type "Web application"
3. Add to **Authorized JavaScript origins:**
   ```
   https://smbx.ai
   https://www.smbx.ai
   ```
4. Add to **Authorized redirect URIs:**
   ```
   https://smbx.ai
   ```
5. Copy the Client ID (`xxxxx.apps.googleusercontent.com`)
6. **Railway** → set:
   ```
   GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxxxx
   ```
7. Redeploy
8. **Test:** Click "Continue with Google" on login page → Google account picker appears

**Domain Security:**
1. Verify these are set in Railway:
   ```
   APP_URL=https://smbx.ai
   JWT_SECRET=<strong random string>
   ```
   Generate JWT_SECRET: run `openssl rand -hex 32` in your terminal
2. Verify SSL works (Railway handles this automatically for custom domains)

**Result:** Google Sign-In works (Face ID/Touch ID on iOS), JWT tokens are secure, domain is hardened.

### STOP HERE FOR PREVIEW LAUNCH

After Phase 2: Yulia responds, files persist, emails send, Google sign-in works, domain is secure. You can promote on LinkedIn and people get a real, complete experience. Everything beyond this is for when you're ready to charge money.

---

## Phase 3: DAY 1 GO-LIVE — When Ready to Charge

### Stripe (Payments Go Live)

**Steps:**
1. Go to **Stripe Dashboard** → switch from test to live mode
2. Create 3 Products + Prices:
   - **Starter:** $49/month, recurring
   - **Professional:** $149/month, recurring (with 30-day free trial)
   - **Enterprise:** $999/month, recurring
3. Create a webhook endpoint: `https://smbx.ai/api/stripe/webhook`
4. Subscribe to events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
5. **Railway** → update env vars:
   ```
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```
6. **Turn off TEST_MODE:**
   ```
   TEST_MODE=false
   ```
7. Redeploy
8. **Test:** Trigger a paywall → Stripe checkout loads → test with a real card

**Result:** Users hit the paywall after their 90-day trial expires (or on premium features if trial is expired). Stripe handles billing, upgrades, cancellations.

### Google Places API (Sourcing Enhancement)

Not required for launch. Enhances the sourcing engine with real business data.

1. **Google Cloud Console** → Enable Places API
2. **Railway** → set:
   ```
   GOOGLE_PLACES_API_KEY=AIzaxxxxx
   ```

### Census API (Market Intelligence Enhancement)

Not required for launch. Enhances market intelligence with demographic data.

1. Request a free key at **api.census.gov**
2. **Railway** → set:
   ```
   CENSUS_API_KEY=xxxxx
   ```

---

## Environment Variables — Complete Reference

### Required (set these first)
| Variable | Purpose | Status |
|----------|---------|--------|
| `DATABASE_URL` | PostgreSQL connection | ✅ Set (Railway auto) |
| `ANTHROPIC_API_KEY` | Yulia (Claude API) | ✅ Set |
| `JWT_SECRET` | Auth token signing | ⚠️ Check — should be 64-char hex |
| `APP_URL` | Base URL for links/emails | ⚠️ Should be `https://smbx.ai` |
| `NODE_ENV` | Environment mode | ✅ `production` |
| `PORT` | Server port | ✅ Set (Railway auto) |

### Phase 2 (infrastructure)
| Variable | Purpose | Status |
|----------|---------|--------|
| `S3_BUCKET` | File storage bucket name | ❌ Not set |
| `S3_REGION` | AWS region | ❌ Not set |
| `AWS_ACCESS_KEY_ID` | AWS credentials | ❌ Not set |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials | ❌ Not set |
| `RESEND_API_KEY` | Email delivery | ❌ Not set |
| `EMAIL_FROM` | From address for emails | ❌ Not set |
| `GOOGLE_CLIENT_ID` | Google Sign-In | ❌ Not set |
| `GOOGLE_CLIENT_SECRET` | Google Sign-In server | ❌ Not set |

### Phase 3 (go-live)
| Variable | Purpose | Status |
|----------|---------|--------|
| `STRIPE_SECRET_KEY` | Payments | ⚠️ Test key set |
| `STRIPE_PUBLISHABLE_KEY` | Client payments | ⚠️ Test key set |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification | ⚠️ Check |
| `TEST_MODE` | Bypass paywalls | ✅ `true` (switch to `false` at go-live) |

### Optional (enhance but don't block)
| Variable | Purpose | Status |
|----------|---------|--------|
| `GOOGLE_PLACES_API_KEY` | Sourcing Stage 2+ | ❌ Not set |
| `CENSUS_API_KEY` | Market intelligence | ❌ Not set |
| `GOOGLE_AI_API_KEY` | Gemini (secondary AI) | Optional |
| `OPENAI_API_KEY` | OpenAI (tertiary AI) | Optional |

---

## Test Plan Checklist

### Core Experience (Preview)
- [ ] Home page loads on desktop (warm paper bg, logo, H1, chat pill)
- [ ] Home page loads on mobile (Grok-like layout, pill at bottom)
- [ ] Dark mode toggle works
- [ ] Journey pages load (sell, buy, raise, integrate, how-it-works, advisors, pricing)
- [ ] Interactive calculators work on journey pages (sliders, results update)
- [ ] Chat pill + button opens tools popup
- [ ] Typing and sending a message works
- [ ] Yulia responds with real deal intelligence

### Authentication
- [ ] Email/password signup works (90-day trial auto-granted)
- [ ] Email/password login works
- [ ] Google OAuth works (after GOOGLE_CLIENT_ID is set)
- [ ] Logout returns to home
- [ ] Session migration preserves anonymous conversations
- [ ] Admin console accessible at /admin for admin users

### Conversation Quality
Test these openers — grade A/B/C/F:

| # | Opener | Grade |
|---|--------|-------|
| 1 | "I want to sell my HVAC business doing $2M revenue in Atlanta" | |
| 2 | "What's my business worth? I have a landscaping company doing $400K SDE" | |
| 3 | "I want to buy an HVAC company in the Southeast doing $1M-$3M EBITDA" | |
| 4 | "I'm a search fund operator looking for my first acquisition" | |
| 5 | "I need to raise capital for my SaaS company" | |

### Deal & Deliverables
- [ ] Deal created when user provides business info
- [ ] Deal appears in sidebar
- [ ] Free deliverable generates (ValueLens, VRR, thesis)
- [ ] Deliverable renders in canvas tab
- [ ] PDF export downloads and opens
- [ ] Interactive models open and respond to slider input

### Mobile
- [ ] iOS Safari: no address bar overlap
- [ ] iOS Safari: keyboard doesn't break layout
- [ ] No horizontal scroll anywhere
- [ ] Touch targets 44px+
- [ ] Text readable without zoom

### Admin Console
- [ ] /admin loads for admin user
- [ ] Overview tab shows KPI cards and charts
- [ ] Users tab shows user list with search
- [ ] Traffic tab shows page views and visitors
- [ ] Issues tab shows support issues

---

## Post-Launch Enhancements (Weeks 2-4)

These are NOT blockers. Add them incrementally after launch:

- [ ] Apple Sign-In (requires Apple Developer account)
- [ ] Passkey-based login (discoverable credential flow)
- [ ] Google Places integration for sourcing
- [ ] Census API for market intelligence
- [ ] Error monitoring (Sentry or similar)
- [ ] Uptime monitoring
- [ ] CDN for static assets
- [ ] Rate limiting on API endpoints
- [ ] CSRF protection
- [ ] Content Security Policy headers
- [ ] Database backups (verify Railway auto-backup)
- [ ] Load testing
- [ ] SEO: Open Graph images for social sharing
- [ ] SEO: Industry-specific pages (/industries/hvac, etc.)
- [ ] LinkedIn post → page view tracking correlation in admin

---

## Auto-Migration Note

The server runs all pending SQL migrations on startup (`server/index.ts`). No manual database work is ever needed. Just deploy and the schema updates automatically.

Current migrations through: `048_early_access_trial.sql`
