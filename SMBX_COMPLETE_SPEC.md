# SMBX.AI — COMPLETE BUILD SPECIFICATION FOR CLAUDE CODE
## Fresh Build from Scratch | February 18, 2026

**Repository:** github.com/[owner]/SMBx (private)
**Domain:** smbx.ai
**Document Version:** 1.0
**Source Documents:** BUILD_PLAN_v4.pdf + Methodology_V17_Combined.md
**Design Reference:** claude.ai / anthropic.com (mirror exactly)

---

## TABLE OF CONTENTS

1. [Product Overview](#1-product-overview)
2. [Design System — Mirror Claude.ai](#2-design-system)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [Authentication](#6-authentication)
7. [Pricing Engine — Pure Wallet + Menu](#7-pricing-engine)
8. [Four Journeys × Six Gates](#8-journeys-and-gates)
9. [AI Orchestration](#9-ai-orchestration)
10. [Yulia — The AI Advisor](#10-yulia)
11. [The Math Engine](#11-math-engine)
12. [League Governance](#12-league-governance)
13. [GTM Feature Suite](#13-gtm-features)
14. [API Routes](#14-api-routes)
15. [Frontend Pages & Components](#15-frontend)
16. [Security & Data Sovereignty](#16-security)
17. [Deployment — Railway](#17-deployment)
18. [Build Phases & Task Order](#18-build-phases)
19. [Environment Variables](#19-env-vars)
20. [CLAUDE.md for Repo](#20-claude-md)

---

## 1. PRODUCT OVERVIEW

**What:** AI-powered M&A platform for SMB through mega-cap deals.

**AI Advisor:** Yulia — conversational AI that guides users through their entire M&A journey. She asks questions, produces deliverables, and advances them through gates.

**Experience:** Chat-first. Users talk to Yulia, not dashboards. The entire UX mirrors claude.ai — a left sidebar with conversation history, a centered chat area, and a clean input composer at the bottom.

**Core Mandate:** "Data is Commodity; Workflow is the Moat."

**Brand:** smbx.ai (formerly sbsmb / sellbuysmb)

**Messaging Rule:** Never say "AI-powered." Say "instant," "smart," or just describe the outcome. Yulia is presented as an expert advisor, never as "an AI chatbot."

---

## 2. DESIGN SYSTEM — MIRROR CLAUDE.AI EXACTLY

This is the most critical section. The UI/UX must be visually indistinguishable from claude.ai in layout, typography, color, spacing, and interaction patterns. After extensive testing with drawers, bottom sheets, and other mobile configurations, mirroring Claude's proven interface is the winning approach. **Mobile browser first, then adapt to desktop.**

### 2.1 Color Tokens

```css
:root {
  /* === LIGHT MODE (default) === */
  --bg-primary: #F5F5F0;           /* Warm cream — main canvas */
  --bg-secondary: #FFFFFF;          /* White — composer, cards */
  --bg-sidebar: #EDEDEA;            /* Slightly darker cream — sidebar */
  --bg-sidebar-hover: #E5E5E0;     /* Sidebar item hover */
  --bg-sidebar-active: #DCDCD7;    /* Active/selected conversation */
  
  --text-primary: #1A1A18;          /* Near-black — body text */
  --text-secondary: #6B6B65;        /* Muted — timestamps, meta */
  --text-tertiary: #9B9B95;         /* Lighter — placeholders */
  
  --accent-primary: #DA7756;        /* Terra cotta — brand accent */
  --accent-hover: #C96A4B;          /* Darker terra cotta */
  --accent-secondary: #D4A574;      /* Warm gold — secondary accent */
  
  --border-light: rgba(0,0,0,0.08); /* Subtle borders */
  --border-medium: rgba(0,0,0,0.15);
  
  --shadow-composer: 0 0.25rem 1.25rem rgba(0,0,0,0.035);
  --shadow-card: 0 1px 3px rgba(0,0,0,0.05);
  --shadow-dropdown: 0 4px 12px rgba(0,0,0,0.1);
  
  /* === DARK MODE === */
  --bg-primary-dark: #2B2A27;
  --bg-secondary-dark: #1F1E1B;
  --bg-sidebar-dark: #252420;
  --text-primary-dark: #EEEEEE;
  --text-secondary-dark: #A0A09A;
}
```

### 2.2 Typography

```css
:root {
  /* Font stack — matches claude.ai exactly */
  --font-serif: 'Copernicus', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace;
  
  /* Scale */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
}
```

**Usage rules:**
- Body text: `font-serif` (ui-serif stack), 16px, `--text-primary`
- Chat messages (Yulia responses): `font-serif`, natural prose
- User messages: `font-serif`, slightly different bg
- UI chrome (buttons, labels, sidebar): `font-sans`, 14px
- Code blocks: `font-mono`
- Headings in deliverables: `font-serif`, bold

### 2.3 Layout — Mirrors Claude.ai Exactly

```
┌──────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────┐│
│ │           │ │                                  ││
│ │  SIDEBAR  │ │         CHAT AREA                ││
│ │           │ │                                  ││
│ │ • New Chat│ │   max-w-3xl mx-auto              ││
│ │ • History │ │                                  ││
│ │ • History │ │   [Yulia message]                ││
│ │ • History │ │   [User message]                 ││
│ │           │ │   [Yulia message]                ││
│ │           │ │                                  ││
│ │           │ │                                  ││
│ │           │ │ ┌──────────────────────────────┐ ││
│ │  [Wallet] │ │ │  Composer Input  [Send]      │ ││
│ │  [Settings│ │ │  [Attach] [Model] ...        │ ││
│ │           │ │ └──────────────────────────────┘ ││
│ └──────────┘ └──────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

**Mobile (< 768px):**
- Sidebar hidden by default, slides in from left via hamburger (exactly like Claude mobile)
- Chat area is full-width
- Composer sticks to bottom (above keyboard on iOS)
- No bottom nav bar — sidebar handles everything
- Touch-friendly: 44px minimum tap targets

**Desktop (≥ 768px):**
- Sidebar always visible (collapsible)
- Sidebar width: ~260px
- Chat area fills remaining space
- Composer centered at max-w-3xl

### 2.4 Sidebar (Mirrors Claude.ai)

```
┌─────────────────┐
│  [☰] smbx.ai    │  ← Brand + collapse toggle
│                  │
│  [+ New Chat]    │  ← Primary action button
│                  │
│  ─── Today ───   │  ← Date grouping
│  Chat title...   │
│  Chat title...   │
│                  │
│  ── Yesterday ── │
│  Chat title...   │
│                  │
│  ── Previous 7d ─│
│  Chat title...   │
│                  │
│  ┈┈┈┈┈┈┈┈┈┈┈┈┈  │
│  [💰 $125.00]   │  ← Wallet balance (smbx addition)
│  [⚙ Settings]   │
│  [👤 Account]   │
└─────────────────┘
```

- Conversations grouped by: Today, Yesterday, Previous 7 Days, Previous 30 Days, Older
- Each item shows truncated title, hover reveals delete/rename
- Right-click context menu: Rename, Delete, Archive
- **smbx addition:** Wallet balance displayed at sidebar bottom

### 2.5 Chat Messages

**Yulia (assistant) messages:**
- No background, left-aligned within max-w-3xl container
- Serif font, natural prose
- Markdown rendering (bold, italic, code, lists, tables)
- Deliverable cards render inline as special components

**User messages:**
- Slight background tint (`bg-[#F0EDE6]` light / `bg-[#353430]` dark)
- Right-aligned text block
- Rounded corners: `rounded-2xl`

**Composer:**
- White background / dark mode dark bg
- Rounded: `rounded-2xl`
- Shadow: `--shadow-composer`
- Placeholder: "Ask Yulia anything about your deal..."
- Bottom row: [Attach files] [Journey: SELL ▾] [Send ↑]
- Auto-grows with content, max 200px height
- Send button: terra cotta accent when active

### 2.6 Component Library (Radix UI + Tailwind)

All components use Radix UI primitives styled with Tailwind to match Claude's aesthetic:

| Component | Radix Primitive | Notes |
|-----------|----------------|-------|
| Button | — | Ghost style default, terra cotta for primary CTA |
| Dialog/Modal | Dialog | Frosted glass backdrop, rounded-2xl |
| Dropdown | DropdownMenu | Shadow-dropdown, clean item hover |
| Tooltip | Tooltip | Dark bg, 12px text, 8px rounded |
| Tabs | Tabs | Underline-style active indicator |
| Toast | Toast | Bottom-right, subtle entrance animation |
| Sheet (mobile sidebar) | Dialog | Slides from left, full height |
| ScrollArea | ScrollArea | Custom thin scrollbar |

### 2.7 Animations & Transitions

- Page transitions: fade 150ms ease
- Sidebar slide: 200ms ease-out
- Message appear: fade-up 200ms
- Composer focus: subtle border color transition
- Button hover: 100ms color transition
- Toast enter: slide-in from right 200ms
- **No flashy animations.** Claude's UI is calm and professional.

### 2.8 Responsive Breakpoints

```javascript
const breakpoints = {
  sm: '640px',    // Small mobile
  md: '768px',    // Tablet / sidebar breakpoint
  lg: '1024px',   // Desktop
  xl: '1280px',   // Wide desktop
};
```

### 2.9 Glassmorphism (Selective Use)

Per BUILD_PLAN_v4, the design language includes glassmorphism — frosted glass panels, subtle gradients. Apply this sparingly:

- Modal/dialog backdrops: `backdrop-blur-sm bg-black/20`
- Dropdown menus: `backdrop-blur-md bg-white/90`
- Wallet card: `backdrop-blur-lg bg-white/80 border border-white/20`
- **Do NOT apply glassmorphism to the main chat area or sidebar.** Those stay solid like Claude.

---

## 3. TECH STACK

| Layer | Technology | Notes |
|-------|-----------|-------|
| Runtime | Node.js 20+ + Express (ESM) | ES modules throughout |
| Frontend | React 19 + Vite 7 + Tailwind CSS 4 | SPA, mobile-first |
| UI Primitives | Radix UI | Unstyled, accessible |
| Routing (client) | wouter | Lightweight, ~1.5kb |
| Database | PostgreSQL via Drizzle ORM | Type-safe schema |
| AI (primary) | Anthropic Claude API | Claude Sonnet 4.5 for chat |
| AI (secondary) | Google Gemini 2.5 | Flash for extraction, Pro for reasoning |
| AI (tertiary) | OpenAI | Fallback only |
| Payments | Stripe | Wallet top-ups, webhooks |
| Auth | Google OAuth + local (bcrypt) + sessions | express-session |
| Deployment | Railway | PostgreSQL + Node.js service |
| Repo | GitHub (private) | SMBx |

### Key Dependencies

```json
{
  "dependencies": {
    "express": "^4.21",
    "drizzle-orm": "^0.35",
    "@anthropic-ai/sdk": "^0.39",
    "@google/generative-ai": "^0.21",
    "stripe": "^17",
    "bcrypt": "^5",
    "express-session": "^1.18",
    "connect-pg-simple": "^9",
    "passport": "^0.7",
    "passport-google-oauth20": "^2",
    "zod": "^3.23",
    "cors": "^2.8",
    "helmet": "^8",
    "compression": "^1.7"
  },
  "devDependencies": {
    "vite": "^7",
    "tailwindcss": "^4",
    "@radix-ui/react-dialog": "^1",
    "@radix-ui/react-dropdown-menu": "^2",
    "@radix-ui/react-tooltip": "^1",
    "@radix-ui/react-scroll-area": "^1",
    "@radix-ui/react-toast": "^1",
    "@radix-ui/react-tabs": "^1",
    "wouter": "^3",
    "react": "^19",
    "react-dom": "^19",
    "react-markdown": "^9",
    "typescript": "^5.7",
    "esbuild": "^0.24",
    "drizzle-kit": "^0.30"
  }
}
```

---

## 4. PROJECT STRUCTURE

```
SMBx/
├── CLAUDE.md                          # Claude Code reads this first
├── METHODOLOGY_V17.md                 # Full methodology (in repo)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── railway.json
├── drizzle.config.ts
├── .env.example
├── .gitignore
│
├── scripts/
│   └── build.ts                       # esbuild config for server
│
├── shared/                            # Shared between client & server
│   ├── schema.ts                      # Drizzle ORM schema (all tables)
│   ├── types.ts                       # Shared TypeScript types
│   ├── gateRegistry.ts                # 22 gates: S0-S5, B0-B5, R0-R5, PMI0-PMI3
│   ├── sidebarRules.ts                # Progressive disclosure by gate
│   ├── constants.ts                   # League ranges, safe harbor, etc.
│   └── validation.ts                  # Zod schemas for API payloads
│
├── server/
│   ├── index.ts                       # Express server entry point
│   ├── routes.ts                      # All API routes
│   ├── ai.ts                          # AI orchestration layer
│   ├── middleware/
│   │   ├── auth.ts                    # Session + passport middleware
│   │   ├── walletGuard.ts             # Check wallet balance before generation
│   │   └── rateLimiter.ts             # API rate limiting
│   │
│   └── services/
│       ├── walletService.ts           # Wallet CRUD, balance, auto-refill
│       ├── menuCatalogService.ts      # Menu items, blocks, packages
│       ├── leagueRouter.ts            # League detection + multipliers
│       ├── gateReadinessService.ts    # Gate advancement logic
│       ├── complexityPreflightService.ts  # Wagyu Rule surcharge
│       ├── deliverableCatalogService.ts   # Deliverable definitions
│       ├── deliverableGenerationService.ts # AI generation orchestration
│       ├── chatService.ts             # Chat history, conversations
│       ├── dealService.ts             # Deal lifecycle management
│       ├── documentService.ts         # File upload/storage
│       ├── stripeService.ts           # Stripe integration
│       ├── livingCimService.ts        # Dynamic CIM builder
│       ├── ghostNotificationService.ts # Ghost profile alerts
│       ├── dayPassService.ts          # Temporary advisor access
│       ├── transactionTokenService.ts # Success fee tracking
│       ├── dealVelocityService.ts     # Pipeline analytics
│       ├── escrowService.ts           # Escrow/earnout management
│       ├── groundTruthService.ts      # Verified financials feedback
│       └── networkDensityService.ts   # Deal room participants
│
├── client/
│   ├── index.html
│   └── src/
│       ├── App.tsx                    # Route definitions (wouter)
│       ├── main.tsx                   # React entry
│       ├── index.css                  # Tailwind imports + CSS vars
│       │
│       ├── hooks/
│       │   ├── useWallet.ts           # Wallet state + actions
│       │   ├── useChat.ts             # Chat messages + streaming
│       │   ├── useAuth.ts             # Auth state
│       │   ├── useDeal.ts             # Current deal context
│       │   └── useGate.ts             # Current gate + progression
│       │
│       ├── layouts/
│       │   ├── AppLayout.tsx          # Sidebar + main area (Claude mirror)
│       │   └── PublicLayout.tsx       # Landing pages layout
│       │
│       ├── components/
│       │   ├── sidebar/
│       │   │   ├── Sidebar.tsx        # Full sidebar (Claude mirror)
│       │   │   ├── ConversationList.tsx
│       │   │   ├── ConversationItem.tsx
│       │   │   ├── SidebarFooter.tsx  # Wallet + settings + account
│       │   │   └── NewChatButton.tsx
│       │   │
│       │   ├── chat/
│       │   │   ├── ChatArea.tsx        # Message list + composer
│       │   │   ├── MessageList.tsx
│       │   │   ├── Message.tsx         # Single message (user or Yulia)
│       │   │   ├── Composer.tsx        # Input + attachments + send
│       │   │   ├── TypingIndicator.tsx
│       │   │   └── WelcomeScreen.tsx   # Empty state with journey cards
│       │   │
│       │   ├── deliverables/
│       │   │   ├── DeliverableCard.tsx  # Inline deliverable in chat
│       │   │   ├── DeliverablePreview.tsx
│       │   │   └── PurchaseModal.tsx    # Buy deliverable flow
│       │   │
│       │   ├── wallet/
│       │   │   ├── WalletBadge.tsx     # Balance indicator
│       │   │   ├── TopUpModal.tsx      # Stripe checkout
│       │   │   ├── TransactionHistory.tsx
│       │   │   └── AutoRefillSettings.tsx
│       │   │
│       │   ├── gates/
│       │   │   ├── GateProgress.tsx    # Visual gate indicator
│       │   │   └── GateBlocker.tsx     # Paywall interstitial
│       │   │
│       │   └── ui/                     # Base components (Radix + Tailwind)
│       │       ├── Button.tsx
│       │       ├── Dialog.tsx
│       │       ├── Dropdown.tsx
│       │       ├── Toast.tsx
│       │       ├── ScrollArea.tsx
│       │       └── Input.tsx
│       │
│       └── pages/
│           ├── public/
│           │   ├── Home.tsx            # smbx.ai landing
│           │   ├── Sell.tsx            # Seller value prop
│           │   ├── Buy.tsx             # Buyer value prop
│           │   ├── Raise.tsx           # Capital raise value prop
│           │   ├── HowItWorks.tsx      # Wallet + menu explanation
│           │   ├── Enterprise.tsx      # Volume pricing
│           │   ├── Login.tsx           # Auth page
│           │   └── Signup.tsx
│           │
│           └── app/
│               ├── Chat.tsx            # Main chat view (THE primary page)
│               ├── Wallet.tsx          # Wallet dashboard
│               ├── Menu.tsx            # Browse deliverables
│               ├── DealRoom.tsx        # Deal-specific document view
│               ├── Settings.tsx        # User settings
│               └── Profile.tsx         # Account management
```

---

## 5. DATABASE SCHEMA (Core Tables)

The full schema has 214 tables from the v3 codebase. Below are the critical tables for the fresh build, organized by domain.

### 5.1 Users & Auth

```typescript
// shared/schema.ts (Drizzle ORM)

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  googleId: varchar('google_id', { length: 255 }).unique(),
  role: varchar('role', { length: 50 }).default('user'), // user, admin, broker
  league: varchar('league', { length: 10 }), // L1-L6, set after onboarding
  journeyType: varchar('journey_type', { length: 20 }), // sell, buy, raise, pmi
  onboardingComplete: boolean('onboarding_complete').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### 5.2 Wallet & Payments

```typescript
export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  balanceCents: integer('balance_cents').default(0).notNull(), // Store in cents
  autoRefillEnabled: boolean('auto_refill_enabled').default(false),
  autoRefillThresholdCents: integer('auto_refill_threshold_cents').default(5000), // $50
  autoRefillAmountCents: integer('auto_refill_amount_cents').default(25000), // $250
  createdAt: timestamp('created_at').defaultNow(),
});

export const walletTransactions = pgTable('wallet_transactions', {
  id: serial('id').primaryKey(),
  walletId: integer('wallet_id').references(() => wallets.id).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // topup, purchase, refund, bonus
  amountCents: integer('amount_cents').notNull(), // positive = credit, negative = debit
  balanceAfterCents: integer('balance_after_cents').notNull(),
  description: text('description'),
  menuItemId: varchar('menu_item_id', { length: 100 }), // if purchase
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const walletBlocks = pgTable('wallet_blocks', {
  id: varchar('id', { length: 50 }).primaryKey(), // 'starter', 'builder', etc.
  name: varchar('name', { length: 100 }).notNull(),
  priceCents: integer('price_cents').notNull(),
  bonusCents: integer('bonus_cents').default(0),
  totalCreditsCents: integer('total_credits_cents').notNull(),
  discountPercent: integer('discount_percent').default(0),
  sortOrder: integer('sort_order').default(0),
});
```

### 5.3 Conversations & Messages

```typescript
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  dealId: integer('deal_id').references(() => deals.id),
  title: varchar('title', { length: 255 }).default('New conversation'),
  journeyType: varchar('journey_type', { length: 20 }),
  currentGate: varchar('current_gate', { length: 20 }),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'user', 'assistant', 'system'
  content: text('content').notNull(),
  metadata: jsonb('metadata'), // gate transitions, deliverables generated, etc.
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 5.4 Deals

```typescript
export const deals = pgTable('deals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  journeyType: varchar('journey_type', { length: 20 }).notNull(), // sell, buy, raise, pmi
  league: varchar('league', { length: 10 }),
  currentGate: varchar('current_gate', { length: 20 }).default('S0'),
  
  // Business basics
  businessName: varchar('business_name', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  location: varchar('location', { length: 255 }),
  yearsInOperation: integer('years_in_operation'),
  
  // Financials
  annualRevenue: integer('annual_revenue'), // cents
  sde: integer('sde'), // cents
  ebitda: integer('ebitda'), // cents
  adjustedEbitda: integer('adjusted_ebitda'), // cents
  
  // Valuation
  valuationLow: integer('valuation_low'), // cents
  valuationMid: integer('valuation_mid'),
  valuationHigh: integer('valuation_high'),
  multipleUsed: decimal('multiple_used'),
  metricUsed: varchar('metric_used', { length: 20 }), // SDE or EBITDA
  
  // Status
  status: varchar('status', { length: 20 }).default('active'), // active, closed, paused
  complexityFlags: jsonb('complexity_flags'), // Wagyu Rule triggers
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### 5.5 Menu Catalog

```typescript
export const menuItems = pgTable('menu_items', {
  id: varchar('id', { length: 100 }).primaryKey(), // 'quick-valuation', 'full-cim', etc.
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  tier: varchar('tier', { length: 20 }).notNull(), // 'analyst', 'associate', 'vp'
  basePriceCents: integer('base_price_cents').notNull(),
  category: varchar('category', { length: 50 }), // financial, packaging, sourcing, etc.
  journeyTypes: jsonb('journey_types'), // ['sell', 'buy', 'raise']
  gateRequirement: varchar('gate_requirement', { length: 20 }), // minimum gate to access
  isFree: boolean('is_free').default(false),
  sortOrder: integer('sort_order').default(0),
});

export const dealPackages = pgTable('deal_packages', {
  id: varchar('id', { length: 100 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  basePriceCents: integer('base_price_cents').notNull(),
  includedItemIds: jsonb('included_item_ids'), // array of menu item IDs
  discountPercent: integer('discount_percent').default(0),
  journeyType: varchar('journey_type', { length: 20 }),
  sortOrder: integer('sort_order').default(0),
});
```

### 5.6 Deliverables

```typescript
export const deliverables = pgTable('deliverables', {
  id: serial('id').primaryKey(),
  dealId: integer('deal_id').references(() => deals.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  menuItemId: varchar('menu_item_id', { length: 100 }).references(() => menuItems.id),
  conversationId: integer('conversation_id').references(() => conversations.id),
  
  type: varchar('type', { length: 50 }).notNull(), // valuation, cim, buyer-list, etc.
  title: varchar('title', { length: 255 }).notNull(),
  content: jsonb('content'), // structured output
  markdownContent: text('markdown_content'), // rendered content
  status: varchar('status', { length: 20 }).default('generating'), // generating, complete, error
  
  pricePaidCents: integer('price_paid_cents'),
  leagueMultiplier: decimal('league_multiplier'),
  
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 5.7 GTM Feature Tables

```typescript
// Living CIMs
export const livingCims = pgTable('living_cims', {
  id: serial('id').primaryKey(),
  dealId: integer('deal_id').references(() => deals.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: jsonb('content').notNull(),
  publishState: varchar('publish_state', { length: 20 }).default('draft'),
  version: integer('version').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cimShareLinks = pgTable('cim_share_links', {
  id: serial('id').primaryKey(),
  cimId: integer('cim_id').references(() => livingCims.id).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  accessLevel: varchar('access_level', { length: 20 }).notNull(), // blind, teaser, full
  revealStrategy: varchar('reveal_strategy', { length: 20 }), // signup, nda, both
  viewCount: integer('view_count').default(0),
  maxViews: integer('max_views'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Ghost Notifications
export const ghostNotifications = pgTable('ghost_notifications', {
  id: serial('id').primaryKey(),
  businessIdentifier: varchar('business_identifier', { length: 255 }).notNull(),
  source: varchar('source', { length: 100 }), // bizbuysell, loopnet, etc.
  trackerCount: integer('tracker_count').default(0),
  notificationSent: boolean('notification_sent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Day Passes
export const dayPasses = pgTable('day_passes', {
  id: serial('id').primaryKey(),
  dealId: integer('deal_id').references(() => deals.id).notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  accessLevel: varchar('access_level', { length: 20 }).default('read'), // read, comment, full
  durationHours: integer('duration_hours').default(48),
  startsAt: timestamp('starts_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Transaction Tokens
export const transactionTokens = pgTable('transaction_tokens', {
  id: serial('id').primaryKey(),
  dealId: integer('deal_id').references(() => deals.id).notNull(),
  dealValueCents: bigint('deal_value_cents', { mode: 'number' }),
  feeCents: integer('fee_cents'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, paid, waived
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Deal Velocity Events
export const dealVelocityEvents = pgTable('deal_velocity_events', {
  id: serial('id').primaryKey(),
  dealId: integer('deal_id').references(() => deals.id).notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(), // discovery, first_view, saved, nda_signed, etc.
  metadata: jsonb('metadata'),
  occurredAt: timestamp('occurred_at').defaultNow(),
});

// Escrow Transactions
export const escrowTransactions = pgTable('escrow_transactions', {
  id: serial('id').primaryKey(),
  dealId: integer('deal_id').references(() => deals.id).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // deposit, earnout, holdback, release
  amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Ground Truth (Magma Feedback)
export const groundTruthData = pgTable('ground_truth_data', {
  id: serial('id').primaryKey(),
  dealId: integer('deal_id').references(() => deals.id).notNull(),
  estimatedRevenue: integer('estimated_revenue'),
  actualRevenue: integer('actual_revenue'),
  revenueDeltaPercent: decimal('revenue_delta_percent'),
  estimatedEbitda: integer('estimated_ebitda'),
  actualEbitda: integer('actual_ebitda'),
  ebitdaDeltaPercent: decimal('ebitda_delta_percent'),
  verificationSource: varchar('verification_source', { length: 50 }),
  industry: varchar('industry', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Deal Network Participants
export const dealNetworkParticipants = pgTable('deal_network_participants', {
  id: serial('id').primaryKey(),
  dealId: integer('deal_id').references(() => deals.id).notNull(),
  userId: integer('user_id').references(() => users.id),
  email: varchar('email', { length: 255 }),
  role: varchar('role', { length: 20 }).notNull(), // buyer, seller, attorney, cpa, lender, broker, consultant
  invitedBy: integer('invited_by').references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow(),
});
```

---

## 6. AUTHENTICATION

### 6.1 Google OAuth (Primary)

```
User clicks "Continue with Google"
→ Redirect to Google OAuth consent screen
→ Google callback with code
→ Exchange for tokens, get profile
→ Find or create user in DB
→ Create express-session
→ Redirect to /app/chat
```

### 6.2 Local Auth (Secondary)

```
User enters email + password
→ Validate with Zod
→ Hash password with bcrypt (12 rounds)
→ Store in users table
→ Create express-session
→ Redirect to /app/chat
```

### 6.3 Session Management

- `express-session` with `connect-pg-simple` (PostgreSQL store)
- Cookie: `httpOnly: true, secure: true, sameSite: 'lax'`
- Max age: 30 days
- Session contains: `userId`, `email`, `league`, `journeyType`

### 6.4 Middleware

```typescript
// server/middleware/auth.ts
export function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}
```

---

## 7. PRICING ENGINE — PURE WALLET + MENU (NO SUBSCRIPTIONS)

**This is critical. There are NO subscription tiers, NO monthly plans, NO feature gates based on plan level.** The entire pricing model is:

1. User signs up free → gets intro credits (welcome bonus)
2. Free deliverables hook them in (intake, financial spread, add-backs)
3. First paywall hits at valuation stage (Gate S2/B2/R2)
4. User tops up wallet via Stripe → spends credits on deliverables from the menu
5. League multiplier adjusts pricing based on deal complexity

### 7.1 Wallet Blocks (Top-Up Options)

| Block ID | Name | Price | Bonus | Total Credits | Discount |
|----------|------|-------|-------|---------------|----------|
| `starter` | Starter | $50 | $0 | $50 | 0% |
| `builder` | Builder | $100 | $5 | $105 | 5% |
| `momentum` | Momentum | $250 | $25 | $275 | 10% |
| `accelerator` | Accelerator | $500 | $75 | $575 | 15% |
| `professional` | Professional | $1,000 | $200 | $1,200 | 20% |
| `scale` | Scale | $2,500 | $625 | $3,125 | 25% |
| `enterprise-lite` | Enterprise Lite | $5,000 | $1,500 | $6,500 | 30% |
| `enterprise` | Enterprise | $10,000 | $3,000 | $13,000 | 30% |
| `enterprise-plus` | Enterprise Plus | $25,000 | $7,500 | $32,500 | 30% |
| `institutional` | Institutional | $50,000 | $15,000 | $65,000 | 30% |

### 7.2 Menu Item Tiers

| Tier | Base Price Range | Examples |
|------|-----------------|----------|
| Analyst | $5–$25 | Quick valuations, market snapshots, comparable pulls |
| Associate | $25–$100 | Full CIM drafts, buyer lists, financial models |
| VP | $100–$500+ | Deep research packages, full due diligence suites |

### 7.3 League Multipliers

| League | Deal Size | Multiplier |
|--------|-----------|-----------|
| L1 | < $500K | 1.0× |
| L2 | $500K–$1M | 1.25× |
| L3 | $1M–$5M | 2.0× |
| L4 | $5M–$10M | 3.5× |
| L5 | $10M–$50M | 6.0× |
| L6 | $50M+ | 10.0× |

**Price calculation:**
```
Final Price = Base Price × League Multiplier × (1 + Wagyu Surcharge if applicable)
```

### 7.4 Wagyu Rule (Complexity Surcharge)

Deals with complexity flags trigger a surcharge notification BEFORE purchase:
- Multi-entity structure
- Cross-border elements
- Regulated industry (healthcare, financial services)
- Earnout components
- Real estate involved

Surcharge: 25-50% on top of league-adjusted price. User is notified and must confirm.

### 7.5 Deal Packages

7 pre-bundled packages combining multiple deliverables at a discount (10-25% off à la carte). Examples:
- **Seller Starter Pack** (S0-S2 deliverables): Intake + Financials + Valuation
- **Full Exit Package** (S0-S5): Everything for a complete sale
- **Buyer Hunt Pack** (B0-B2): Thesis + Sourcing + Valuation
- **Raise Ready Pack** (R0-R3): Readiness + Financials + Pitch Deck + Outreach

### 7.6 Auto-Refill

Users can configure automatic wallet top-up:
- Trigger: Balance drops below threshold (default $50)
- Action: Charge saved card for configured amount
- Alert: Low-balance warning at $50 remaining

### 7.7 Purchase Flow

```
User requests deliverable (via Yulia chat or menu)
→ Calculate price: base × league multiplier × wagyu (if applicable)
→ Check wallet balance
→ IF sufficient: Deduct, generate, deliver
→ IF insufficient: Show purchase modal with:
   - Price breakdown
   - Current balance
   - Suggested top-up block
   - Stripe checkout button
→ After top-up: Auto-resume generation
```

### 7.8 Free Deliverables (No Wallet Required)

These hook users in before the first paywall:
- Business profile intake (S0/B0/R0)
- Initial financial data spread (S1)
- Add-back suggestions (S1)
- Basic deal scoring
- Journey overview / roadmap

**First paywall:** Gate S2 (Valuation), B2 (Target Valuation), R2 (Investor Materials)

---

## 8. FOUR JOURNEYS × SIX GATES EACH

### 8.1 Gate Registry

```typescript
// shared/gateRegistry.ts
export const GATE_REGISTRY = {
  // SELL Journey
  S0: { name: 'Intake', journey: 'sell', free: true },
  S1: { name: 'Financials', journey: 'sell', free: true },
  S2: { name: 'Valuation', journey: 'sell', free: false },  // FIRST PAYWALL
  S3: { name: 'Packaging', journey: 'sell', free: false },
  S4: { name: 'Market Matching', journey: 'sell', free: false },
  S5: { name: 'Closing', journey: 'sell', free: false },
  
  // BUY Journey
  B0: { name: 'Thesis', journey: 'buy', free: true },
  B1: { name: 'Sourcing', journey: 'buy', free: true },
  B2: { name: 'Valuation', journey: 'buy', free: false },  // FIRST PAYWALL
  B3: { name: 'Due Diligence', journey: 'buy', free: false },
  B4: { name: 'Structuring', journey: 'buy', free: false },
  B5: { name: 'Closing', journey: 'buy', free: false },
  
  // RAISE Journey
  R0: { name: 'Intake', journey: 'raise', free: true },
  R1: { name: 'Financial Package', journey: 'raise', free: true },
  R2: { name: 'Investor Materials', journey: 'raise', free: false },  // FIRST PAYWALL
  R3: { name: 'Outreach', journey: 'raise', free: false },
  R4: { name: 'Terms', journey: 'raise', free: false },
  R5: { name: 'Closing', journey: 'raise', free: false },
  
  // PMI Journey
  PMI0: { name: 'Day 0', journey: 'pmi', free: true },
  PMI1: { name: 'Stabilization', journey: 'pmi', free: false },
  PMI2: { name: 'Assessment', journey: 'pmi', free: false },
  PMI3: { name: 'Optimization', journey: 'pmi', free: false },
} as const;
```

### 8.2 Gate Advancement Logic

Gates advance when required deliverables for that gate are complete. Yulia drives the conversation forward and tells the user when they're ready to advance.

```typescript
// server/services/gateReadinessService.ts
export function checkGateReadiness(dealId: number, targetGate: string): {
  ready: boolean;
  missingRequirements: string[];
  blockers: string[];
}
```

### 8.3 Sidebar Progressive Disclosure

The sidebar only shows navigation items relevant to the user's current gate and journey. As gates advance, new sections unlock.

```typescript
// shared/sidebarRules.ts
export function getVisibleSections(journey: string, currentGate: string): SidebarSection[]
```

### 8.4 SELL Journey Detail (from Methodology v17, Part 2)

| Gate | Name | Key Deliverables | Free? |
|------|------|-----------------|-------|
| S0 | Intake | Business profile, initial data collection | Yes |
| S1 | Financials | Financial spread, add-back detection, SDE/EBITDA normalization | Yes |
| S2 | Valuation | Multiple methodologies, range analysis, Reality Check | No |
| S3 | Packaging | CIM creation, blind profile, marketing materials | No |
| S4 | Market Matching | Buyer list generation, outreach strategy, LOI tracking | No |
| S5 | Closing | LOI review, deal structure, closing checklist, funds flow | No |

**Yulia behavior per gate:**
- **S0:** Coach persona. Asks about business basics, industry, location, revenue. Classifies into league.
- **S1:** Forensic mode. Requests tax returns/P&L. Extracts line items (zero hallucination). Suggests add-backs but requires user verification.
- **S2:** Reality Check. Calculates defensible valuation. Compares to seller expectations. Identifies gap. Go/no-go decision.
- **S3:** Author mode. Generates CIM sections. Builds blind teaser. Populates data room structure.
- **S4:** Matchmaker mode. Generates buyer profiles. Tracks outreach pipeline. Manages NDAs. Compares IOIs/LOIs.
- **S5:** Closer mode. Generates funds flow statement. Tracks closing checklist. Manages working capital adjustments.

### 8.5 BUY Journey Detail (from Methodology v17, Part 4)

| Gate | Name | Key Deliverables | Free? |
|------|------|-----------------|-------|
| B0 | Thesis | Buy box definition, acquisition criteria, capital stack template | Yes |
| B1 | Sourcing | Deal sourcing, opportunity matching, pipeline management | Yes |
| B2 | Valuation | Target valuation, offer modeling, DSCR/ROI projections | No |
| B3 | Due Diligence | DD checklist, red flags, QoE coordination | No |
| B4 | Structuring | Deal structure, financing, sources & uses, earnout modeling | No |
| B5 | Closing | APA review, closing checklist, funds flow, Day 1 integration plan | No |

### 8.6 RAISE Journey Detail (from Methodology v17, Part 3)

| Gate | Name | Key Deliverables | Free? |
|------|------|-----------------|-------|
| R0 | Intake | Capital needs assessment, raise strategy brief | Yes |
| R1 | Financial Package | Investor-ready financials, projections, cap table | Yes |
| R2 | Investor Materials | AI pitch deck (10-15 slides), executive summary, teaser | No |
| R3 | Outreach | Investor list, outreach messaging, pipeline tracking | No |
| R4 | Terms | Term sheet analysis, comparison matrix, negotiation prep | No |
| R5 | Closing | Transaction documents, closing mechanics, Form D filing | No |

### 8.7 PMI Journey Detail (from Methodology v17, Part 6)

| Gate | Name | Key Deliverables | Free? |
|------|------|-----------------|-------|
| PMI0 | Day 0 | Integration planning, Day 1 checklist, security/access handoff | Yes |
| PMI1 | Stabilization | First 90 days playbook, employee comms, customer outreach | No |
| PMI2 | Assessment | SWOT analysis, financial deep-dive, quick win identification | No |
| PMI3 | Optimization | Value creation plan, 12-month roadmap, synergy tracking | No |

---

## 9. AI ORCHESTRATION

### 9.1 The "Right Tool" Protocol

Every task routes to a specialized AI engine. The system never calls a generic model.

| Task Category | Engine | Configuration | Behavior |
|---------------|--------|---------------|----------|
| Chat / Conversation | Claude Sonnet 4.5 | Streaming, system prompt with methodology context | Natural conversation with Yulia persona |
| Financial Extraction | Gemini 2.5 Flash | JSON output only, temp 0.0 | Zero hallucination, pure OCR/data entry |
| Market Intelligence | Gemini 2.5 Pro + Search | Search grounding enabled | Live market data, sector multiples |
| Document Forensics | Claude with RAG context | Grounded only, temp 0.1 | Answer strictly from provided documents |
| Deal Modeling | Gemini for calculations | Formula injection | Mathematical rigor, dynamic modeling |
| Cap Table Logic | Claude Sonnet 4.5 | Reasoning mode | Waterfall distribution, complex equity |
| Drafting (LOI/CIM) | Claude Sonnet 4.5 | Template injection | Standardized legal output |
| Quick Valuation | Claude Haiku 4.5 | Structured output | Fast, cheap, accurate for L1/L2 |

### 9.2 Author vs Auditor Protocol

```typescript
// server/ai.ts
function routeTask(task: AITask): AIEngine {
  // AUDITOR tasks — grounded, citation-required
  const auditorTasks = [
    'legal_diligence', 'financial_verification', 'add_back_analysis',
    'document_forensics', 'contract_review', 'tax_return_analysis'
  ];
  
  // AUTHOR tasks — creative, generative
  const authorTasks = [
    'chat', 'market_intelligence', 'valuation', 'cap_table_logic',
    'drafting_loi', 'generate_cim', 'calculation'
  ];
  
  if (auditorTasks.includes(task.type)) {
    return { engine: 'claude_rag', temp: 0.1, citationsRequired: true };
  }
  return { engine: 'claude_sonnet', temp: 0.7, citationsRequired: false };
}
```

### 9.3 Context Injection Protocol

Every AI prompt receives layered context:

```
Layer 1: CONSTITUTION — Core methodology rules, hard rails, forbidden actions
Layer 2: USER CONTEXT — League (L1-L6), role, deal history, preferences
Layer 3: DEAL CONTEXT — Current gate, financials ingested, documents uploaded
Layer 4: MARKET CONTEXT — Industry heat index, regional data, macro overlays
```

### 9.4 Streaming

All chat responses stream via Server-Sent Events (SSE):

```typescript
// Server
app.get('/api/chat/stream/:conversationId', requireAuth, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Stream Claude response chunks
  for await (const chunk of claudeStream) {
    res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
  }
  res.write('data: [DONE]\n\n');
  res.end();
});
```

---

## 10. YULIA — THE AI ADVISOR

### 10.1 Persona

Yulia is NOT a chatbot. She is an expert M&A advisor who adapts her persona based on the user's league:

| League | Persona | Tone | Example |
|--------|---------|------|---------|
| L1 | Coach | Directive, reassuring | "Let me walk you through this step by step..." |
| L2 | Guide | Process-oriented | "Here's what we need to do next..." |
| L3 | Analyst | Cynical, data-driven | "Your margins are below industry median. Let's fix that before going to market." |
| L4 | Associate | GAAP-focused | "We need to normalize for those related-party transactions." |
| L5 | Partner | Strategic | "The arbitrage spread here is attractive. Let's model the 5-year exit." |
| L6 | Macro | Institutional | "Given the current rate environment and sector consolidation..." |

### 10.2 Hard Rails

Yulia NEVER:
- Says "As an AI..." or "I'm just a language model..."
- Hallucinates financial data
- Confirms add-backs without user verification
- Provides legal advice (directs to attorney)
- Shares data between deals (Chinese wall)

Yulia ALWAYS:
- Uses confident, direct language
- Provides specific, actionable recommendations
- Shows her work (citations, calculations)
- Asks for verification on financial inputs
- Alerts users to risks and red flags

### 10.3 System Prompt Structure

```
You are Yulia, the AI M&A advisor for smbx.ai. You guide business owners through 
buying, selling, and raising capital for businesses.

CURRENT USER CONTEXT:
- League: {league}
- Journey: {journeyType}
- Current Gate: {currentGate}
- Deal: {dealSummary}

YOUR PERSONA FOR THIS USER: {leaguePersona}

METHODOLOGY RULES:
{relevantMethodologySection}

AVAILABLE DELIVERABLES AT THIS GATE:
{gateDeliverables}

CONVERSATION HISTORY:
{recentMessages}

INSTRUCTIONS:
1. Stay in character as Yulia — expert, confident, never say "as an AI"
2. Guide the user through their current gate
3. When they need a paid deliverable, explain the value and offer to generate it
4. Flag risks and red flags proactively
5. Use the correct financial metrics for their league (SDE for L1/L2, EBITDA for L3+)
6. Never invent financial data — extract from uploaded documents only
```

### 10.4 Welcome Screen

When a user starts a new conversation (no active deal), Yulia presents journey options:

```
Welcome to smbx.ai! I'm Yulia, your M&A advisor.

What brings you here today?

[🏷️ Sell my business]  [🛒 Buy a business]  [💰 Raise capital]  [🔄 Post-acquisition]
```

These are interactive cards (like Claude's suggested prompts) that start the appropriate journey.

---

## 11. THE MATH ENGINE

The AI is forbidden from inventing formulas. It must apply these exact standards.

### 11.1 SDE (L1/L2)

```
SDE = Net_Income + Owner_Salary + Depreciation + Amortization + Interest + One_Time_Expenses + Verified_Addbacks
```

### 11.2 Adjusted EBITDA (L3-L6)

```
Adjusted_EBITDA = Net_Income + Depreciation + Amortization + Interest + Taxes + Verified_Addbacks - Non_Recurring_Income
```

### 11.3 DSCR

```
DSCR = EBITDA / Annual_Debt_Service
```
- SBA Threshold: ≥ 1.25
- Conventional Threshold: ≥ 1.50

### 11.4 Valuation

```
Strata_Valuation = (Verified SDE/EBITDA) × (Base_Multiple + Growth_Premium + Margin_Premium)
```

### 11.5 Arbitrage Spread (L5)

```
Arbitrage_Spread = (Exit_Multiple - Entry_Multiple) × EBITDA
Target: Minimum 2.0x MOIC over 5-year hold
```

### 11.6 Transaction Token Fee

```
Transaction_Fee = MAX(deal_value × 0.5%, $2,000)
```

### 11.7 DSCR for Lender Dashboard

```
Monthly_Payment = P × [r(1+r)^n] / [(1+r)^n - 1]
Annual_Debt_Service = Monthly_Payment × 12
DSCR = EBITDA / Annual_Debt_Service
```

### 11.8 League Multiple Ranges (Constants)

```typescript
export const LEAGUE_MULTIPLE_RANGES = {
  L1: { metric: 'SDE', min: 2.0, max: 3.5 },
  L2: { metric: 'SDE', min: 3.0, max: 5.0 },
  L3: { metric: 'EBITDA', min: 4.0, max: 6.0 },
  L4: { metric: 'EBITDA', min: 6.0, max: 8.0 },
  L5: { metric: 'EBITDA', min: 8.0, max: 12.0 },
  L6: { metric: 'EBITDA', min: 10.0, max: null }, // DCF-based
};
```

### 11.9 Roll-Up Override Rule

```typescript
export const ROLLUP_INDUSTRIES = ['veterinary', 'dental', 'hvac', 'msp', 'pest_control'];
export const ROLLUP_REVENUE_THRESHOLD = 1_500_000; // $1.5M

// IF industry in ROLLUP_INDUSTRIES AND revenue > threshold
// → Force EBITDA metric regardless of league
```

---

## 12. LEAGUE GOVERNANCE

The AI is forbidden from guessing the user's league. It classifies based on financial inputs.

### 12.1 Classification Logic

```typescript
export function classifyLeague(financials: { sde?: number; ebitda?: number; revenue?: number }): League {
  const { sde, ebitda } = financials;
  
  if (ebitda && ebitda >= 50_000_000) return 'L6';
  if (ebitda && ebitda >= 10_000_000) return 'L5';
  if (ebitda && ebitda >= 5_000_000) return 'L4';
  if (ebitda && ebitda >= 2_000_000) return 'L3';
  if (sde && sde >= 500_000) return 'L2';
  return 'L1';
}
```

### 12.2 League Determines Everything

- Which financial metric to use (SDE vs EBITDA)
- Multiple ranges for valuation
- Price multiplier for deliverables
- Yulia's persona and tone
- Complexity of generated documents
- Which templates to use (L1 simple, L5 complex)

---

## 13. GTM FEATURE SUITE

### 13.1 Living CIM Builder (`/app/living-cim`)
- Real-time binding to accounting data
- Sensitivity toggles for valuation scenarios
- Share links with access levels: blind, teaser, full
- NDA acceptance workflow
- Atomic view counter

### 13.2 Ghost Profile Notifications
- Track when buyers watch unclaimed businesses
- Alert threshold: 3 trackers triggers outreach
- Converts scraped listings into active sellers

### 13.3 Broker Listing Generator (`/app/broker-listing`)
- AI-powered 22x-compliant CIM from raw financials
- Structured JSON output via AI
- Professional formatting

### 13.4 Lender Risk Dashboard (`/app/lender-dashboard`)
- DSCR calculation with amortization formula
- Risk scoring matrix (LOW/MEDIUM/HIGH/CRITICAL)
- SBA eligibility check
- Covenant analysis

### 13.5 Day Pass / Fractional Seats
- 48-hour deal-specific access for external advisors
- Access levels: read, comment, full
- Token-based, no account required

### 13.6 Transaction Token Pricing
- Success fee: MAX(deal_value × 0.5%, $2,000)
- Payment via Stripe at closing stage

### 13.7 Deal Velocity Tracking
- 10-stage event pipeline
- Metrics: daysToNda, daysToLoi, daysToClose
- Platform-wide analytics

### 13.8 SBSMB Pay / Escrow Integration
- Transaction types: deposit, earnout, holdback, release
- Earnout milestone management
- Stripe webhook integration

### 13.9 Magma Feedback Loop
- Capture verified financials post-close
- Calculate estimation deltas
- Feed corrections back into valuation models

### 13.10 Network Density Metrics
- Track 7 participant roles per deal
- Engagement scoring
- Correlation analysis: density → success rate

---

## 14. API ROUTES

### 14.1 Auth
```
POST   /api/auth/register          # Local signup
POST   /api/auth/login             # Local login
GET    /api/auth/google             # Google OAuth initiate
GET    /api/auth/google/callback    # Google OAuth callback
POST   /api/auth/logout             # Logout
GET    /api/auth/me                 # Current user
```

### 14.2 Chat
```
GET    /api/conversations                    # List user conversations
POST   /api/conversations                    # Create conversation
GET    /api/conversations/:id                # Get conversation with messages
PATCH  /api/conversations/:id                # Rename/archive
DELETE /api/conversations/:id                # Delete
POST   /api/conversations/:id/messages       # Send message
GET    /api/conversations/:id/stream         # SSE stream response
```

### 14.3 Wallet
```
GET    /api/wallet                           # Get wallet balance
POST   /api/wallet/topup                     # Create Stripe checkout session
POST   /api/wallet/webhook                   # Stripe webhook (credit wallet)
GET    /api/wallet/transactions              # Transaction history
PATCH  /api/wallet/auto-refill               # Configure auto-refill
```

### 14.4 Menu & Deliverables
```
GET    /api/menu                             # List all menu items
GET    /api/menu/packages                    # List deal packages
GET    /api/menu/blocks                      # List wallet blocks
POST   /api/deliverables/generate            # Purchase + generate deliverable
GET    /api/deliverables/:dealId             # List deliverables for deal
GET    /api/deliverables/:id/content         # Get deliverable content
```

### 14.5 Deals
```
GET    /api/deals                            # List user deals
POST   /api/deals                            # Create deal
GET    /api/deals/:id                        # Get deal details
PATCH  /api/deals/:id                        # Update deal
GET    /api/deals/:id/gate-status            # Check gate readiness
POST   /api/deals/:id/advance-gate           # Advance to next gate
```

### 14.6 GTM Features
```
# Living CIM
GET    /api/cim/:dealId                      # Get living CIM
POST   /api/cim/:dealId                      # Create/update CIM
POST   /api/cim/:dealId/share-link           # Create share link
GET    /api/cim/share/:token                 # Public access via token

# Day Pass
POST   /api/deals/:dealId/day-pass           # Create day pass
GET    /api/day-pass/:token                  # Access via day pass

# Transaction Tokens
POST   /api/deals/:dealId/transaction-token  # Create token at closing
POST   /api/transaction-token/:id/pay        # Process payment

# Deal Velocity
POST   /api/deals/:dealId/velocity-event     # Record event
GET    /api/deals/:dealId/velocity           # Get velocity metrics

# Escrow
POST   /api/deals/:dealId/escrow             # Create escrow transaction
GET    /api/deals/:dealId/escrow             # List escrow transactions

# Ground Truth
POST   /api/deals/:dealId/ground-truth       # Submit verified financials
```

---

## 15. FRONTEND PAGES & COMPONENTS

### 15.1 Public Pages (No Auth Required)

| Path | Page | Purpose |
|------|------|---------|
| `/` | Home | smbx.ai landing, hero, wallet pricing |
| `/sell` | Sell | Seller journey value prop |
| `/buy` | Buy | Buyer journey value prop |
| `/raise` | Raise | Capital raise value prop |
| `/how-it-works` | How It Works | Wallet + menu explanation |
| `/enterprise` | Enterprise | Volume pricing |
| `/login` | Login | Auth page |
| `/signup` | Signup | Registration page |

### 15.2 App Pages (Auth Required)

| Path | Page | Purpose |
|------|------|---------|
| `/app/chat` | Chat | **THE primary page.** Yulia conversation. |
| `/app/chat/:conversationId` | Chat | Specific conversation |
| `/app/wallet` | Wallet | Balance, top-up, history |
| `/app/menu` | Menu | Browse deliverables catalog |
| `/app/deal/:dealId` | Deal Room | Deal documents, participants |
| `/app/settings` | Settings | User preferences |
| `/app/profile` | Profile | Account management |

### 15.3 Key Components

**AppLayout.tsx** — The main layout that mirrors Claude.ai:
- Left sidebar (collapsible on mobile)
- Main content area (chat or other pages)
- Responsive: sidebar hidden on mobile, slides in via hamburger

**Sidebar.tsx** — Mirrors Claude.ai sidebar exactly:
- Brand logo + collapse toggle at top
- "New Chat" button
- Conversation list grouped by date
- Wallet balance badge at bottom
- Settings & account links at bottom

**ChatArea.tsx** — The main chat interface:
- Message list (scrollable, auto-scroll on new messages)
- Welcome screen when no messages
- Composer at bottom

**Composer.tsx** — Message input:
- Auto-growing textarea
- Attach files button
- Journey/gate selector
- Send button (terra cotta when active)
- Keyboard: Enter to send, Shift+Enter for newline

**Message.tsx** — Individual message:
- Yulia messages: no bg, serif font, markdown rendered
- User messages: slight bg tint, right-aligned
- Deliverable cards inline
- Code blocks with syntax highlighting
- Tables rendered properly

**DeliverableCard.tsx** — Inline in chat:
- Card showing deliverable type, status
- Preview of content
- Download/export options
- If locked: price + "Purchase" button

**WalletBadge.tsx** — In sidebar footer:
- Shows current balance
- Green when healthy, yellow when low, red when empty
- Click opens top-up modal

---

## 16. SECURITY & DATA SOVEREIGNTY

### 16.1 The "Vault" Architecture
- **Type A: EVIDENCE (Immutable)** — Tax returns, bank statements, leases. Read-only, watermarked, encrypted.
- **Type B: AGREEMENTS (Collaborative)** — LOI, APA, CIM, models. Version-controlled, editable.

### 16.2 Chinese Wall
- Buyer data and seller data strictly isolated
- AI context window flushed after every user session
- No data from Deal A can inform Deal B

### 16.3 Safe Harbor Geofence
```typescript
export const SAFE_HARBOR_COUNTRIES = ['US', 'UK', 'CA', 'AU', 'NZ', 'IE'];
```
If asset location or IP is outside this zone, workflow terminates.

### 16.4 Security Headers (Helmet.js)
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security

### 16.5 Data Handling
- All financial values stored in cents (integers, no floating point)
- Password hashing: bcrypt 12 rounds
- Session cookies: httpOnly, secure, sameSite
- File uploads: virus scan, type validation, size limits
- API rate limiting: 100 req/min per user

---

## 17. DEPLOYMENT — RAILWAY

### 17.1 railway.json

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node dist/server/index.js",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 17.2 Build Process

```bash
# 1. Build client (Vite)
npx vite build

# 2. Build server (esbuild)
node scripts/build.ts

# 3. Start
node dist/server/index.js
```

### 17.3 Railway Services
- **Web service:** Node.js (serves both API and static client)
- **Database:** PostgreSQL (Railway managed)
- **Custom domain:** smbx.ai → Railway

---

## 18. BUILD PHASES & TASK ORDER

### Phase 0: Get It Running (Day 1, ~4 hours)
- [ ] Initialize fresh repo from scratch (npm init, tsconfig, vite config)
- [ ] Set up project structure (directories per Section 4)
- [ ] Install all dependencies
- [ ] Create shared/schema.ts with core tables
- [ ] Create server/index.ts (Express + static serving)
- [ ] Create client scaffold (App.tsx, routes, layouts)
- [ ] Create railway.json
- [ ] Create esbuild config (scripts/build.ts)
- [ ] Verify: `npm run dev` works, app loads in browser
- [ ] Deploy to Railway, verify it loads

### Phase 1: Auth + Database (Days 2-3, ~12 hours)
- [ ] Run Drizzle migrations (create all tables)
- [ ] Implement Google OAuth flow
- [ ] Implement local auth (register/login)
- [ ] Session management with connect-pg-simple
- [ ] Auth middleware
- [ ] Login/Signup pages
- [ ] Protected route wrapper

### Phase 2: Chat Core — Mirror Claude UI (Days 3-5, ~16 hours)
- [ ] AppLayout with sidebar + main area
- [ ] Sidebar: conversations list, new chat, wallet badge
- [ ] Mobile: hamburger menu, slide-in sidebar
- [ ] ChatArea: message list + composer
- [ ] Message rendering (markdown, code blocks)
- [ ] Conversation CRUD API
- [ ] Message send + receive API
- [ ] Welcome screen with journey cards
- [ ] **This must look and feel exactly like claude.ai**

### Phase 3: AI Integration — Yulia Lives (Days 5-7, ~12 hours)
- [ ] Connect Claude API for chat
- [ ] System prompt with methodology context
- [ ] SSE streaming for responses
- [ ] League-appropriate persona switching
- [ ] Context injection (user, deal, gate layers)
- [ ] Free deliverable generation (intake, add-backs)

### Phase 4: Wallet + Pricing Engine (Days 7-9, ~16 hours)
- [ ] Wallet service (create, balance, add, deduct)
- [ ] Stripe integration (checkout sessions, webhooks)
- [ ] Wallet blocks seeded in DB
- [ ] Menu catalog seeded in DB
- [ ] Top-up flow (modal → Stripe → credit wallet)
- [ ] Purchase flow (check balance → deduct → generate)
- [ ] Auto-refill settings
- [ ] League multiplier calculation
- [ ] Wagyu Rule surcharge notification
- [ ] Insufficient funds interstitial
- [ ] Wallet dashboard page
- [ ] Transaction history

### Phase 5: Journey & Gate System (Days 9-11, ~12 hours)
- [ ] Gate registry implementation
- [ ] Gate readiness checks
- [ ] Gate advancement logic
- [ ] Progressive sidebar disclosure
- [ ] Deal CRUD
- [ ] Journey onboarding flow (Yulia asks, classifies, starts)
- [ ] Paywall at S2/B2/R2

### Phase 6: Deliverable Generation (Days 11-13, ~16 hours)
- [ ] Deliverable catalog service
- [ ] AI generation orchestration (route to right engine)
- [ ] Deliverable card rendering in chat
- [ ] Valuation deliverable (S2/B2)
- [ ] CIM generation (S3)
- [ ] Buyer list generation (S4/B1)
- [ ] Financial model generation (B3)
- [ ] Pitch deck generation (R2)
- [ ] Download/export deliverables

### Phase 7: Landing Pages + Branding (Days 13-14, ~8 hours)
- [ ] Home page (smbx.ai hero, wallet pricing)
- [ ] Sell page
- [ ] Buy page
- [ ] Raise page
- [ ] How It Works page
- [ ] Enterprise page
- [ ] Meta tags, OG tags, favicon
- [ ] Remove all sbsmb/sellbuysmb references

### Phase 8: Testing & Launch Prep (Days 14-15, ~8 hours)
- [ ] E2E test: signup → onboard → free deliverable → paywall → topup → purchase → receive
- [ ] Test Stripe webhook in live mode
- [ ] Test on iOS Safari (primary mobile target)
- [ ] Test on desktop Chrome/Safari
- [ ] Custom domain setup (smbx.ai → Railway)
- [ ] SSL (Railway handles automatically)
- [ ] Stripe live mode keys
- [ ] Database backup strategy
- [ ] Error monitoring (Sentry)

---

## 19. ENVIRONMENT VARIABLES

```bash
# Database
DATABASE_URL=postgresql://...

# AI APIs
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
OPENAI_API_KEY=sk-...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Session
SESSION_SECRET=<random-64-char-string>

# App
NODE_ENV=production
PORT=3000
APP_URL=https://smbx.ai
```

---

## 20. CLAUDE.md FOR REPO

The following should be placed at the repo root as `CLAUDE.md` so Claude Code reads it automatically:

```markdown
# CLAUDE.md — smbx.ai

## What This Is
AI-powered M&A platform. Users talk to Yulia (AI advisor) who guides them through 
buying, selling, or raising capital for businesses.

## Core Architecture
- Chat-first UX that mirrors claude.ai exactly
- Node.js + Express (ESM) backend
- React 19 + Vite 7 + Tailwind CSS 4 + Radix UI frontend
- PostgreSQL via Drizzle ORM
- Claude API (primary), Gemini (secondary), OpenAI (tertiary)
- Stripe wallet payments (NO subscriptions)
- Railway deployment

## Critical Rules
1. **NO SUBSCRIPTIONS.** Pure wallet + menu. Users buy credits, spend on deliverables.
2. **Mirror claude.ai UI.** Same layout, fonts, colors, sidebar, chat experience.
3. **Mobile-first.** Design for mobile browser, then adapt to desktop.
4. **Yulia never says "As an AI."** She is an expert advisor.
5. **Financial data: zero hallucination.** Extract exactly, never invent.
6. **League determines everything.** L1-L6 controls metrics, multiples, pricing, persona.
7. **All money in cents.** Never use floating point for financial values.

## Key Files
- `METHODOLOGY_V17.md` — Full M&A methodology (6 parts, ~80 pages)
- `shared/schema.ts` — All database tables
- `shared/gateRegistry.ts` — 22 gates across 4 journeys
- `shared/constants.ts` — League ranges, multiples, safe harbor countries
- `server/ai.ts` — AI orchestration layer
- `server/services/walletService.ts` — Wallet CRUD
- `server/services/menuCatalogService.ts` — Menu items + blocks + packages
- `server/services/leagueRouter.ts` — League detection + multipliers

## Design Tokens
- Background: #F5F5F0 (light), #2B2A27 (dark)
- Accent: #DA7756 (terra cotta)
- Font: font-serif (ui-serif, Georgia stack)
- Shadows: subtle, 0.035 opacity
- Rounded: rounded-2xl for composer/cards
- Max chat width: max-w-3xl

## Pricing
- 10 wallet blocks ($50 to $50,000)
- 3 menu tiers: Analyst ($5-25), Associate ($25-100), VP ($100-500+)
- 6 league multipliers (1.0x to 10.0x)
- Wagyu Rule: complexity surcharge for flagged deals
- Free gates: S0-S1, B0-B1, R0-R1, PMI0
- First paywall: S2, B2, R2

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npx drizzle-kit push` — Push schema to DB
- `npx drizzle-kit generate` — Generate migrations
```

---

## UNIT ECONOMICS RECAP

| Metric | Value |
|--------|-------|
| Gross margin | 95%+ (AI API costs ~5%) |
| Average wallet top-up | $250–$500 estimated |
| LTV per deal journey | $500–$5,000+ depending on league |
| CAC target | < $50 (organic/LinkedIn) |
| TAM | $4.7B (US M&A advisory tech) |
| SAM | $890M (SMB segment) |
| SOM Year 1 | $2M ARR target |
| Projection | $45M ARR by 2030 |

---

## IMPLEMENTATION CONSTANTS

```typescript
// shared/constants.ts

// Transaction Token Pricing
export const TRANSACTION_TOKEN_FEE_PERCENT = 0.005; // 0.5%
export const TRANSACTION_TOKEN_FEE_MINIMUM = 200000; // $2,000 in cents

// Day Pass Configuration
export const DAY_PASS_DEFAULT_HOURS = 48;
export const DAY_PASS_ACCESS_LEVELS = ['read', 'comment', 'full'] as const;

// Deal Velocity Event Types
export const DEAL_VELOCITY_EVENTS = [
  'discovery', 'first_view', 'saved', 'nda_signed', 'cim_requested',
  'meeting_scheduled', 'loi_submitted', 'loi_accepted',
  'due_diligence_started', 'closing'
] as const;

// Network Participant Roles
export const NETWORK_ROLES = [
  'buyer', 'seller', 'attorney', 'cpa', 'lender', 'broker', 'consultant', 'other'
] as const;

// CIM Share Link Access Levels
export const CIM_ACCESS_LEVELS = ['blind', 'teaser', 'full'] as const;

// Blind Profile Reveal Strategies
export const REVEAL_STRATEGIES = ['signup', 'nda', 'both'] as const;

// Lender Risk Score Thresholds
export const RISK_SCORE_THRESHOLDS = {
  LOW: { minDscr: 1.50, maxLtv: 70 },
  MEDIUM: { minDscr: 1.25, maxLtv: 80 },
  HIGH: { minDscr: 1.15, maxLtv: 90 },
  CRITICAL: { minDscr: 0, maxLtv: 100 },
};

// Ghost Notification Thresholds
export const GHOST_NOTIFICATION_TRACKER_THRESHOLD = 3;

// Safe Harbor
export const SAFE_HARBOR_COUNTRIES = ['US', 'UK', 'CA', 'AU', 'NZ', 'IE'];

// Roll-Up Industries
export const ROLLUP_INDUSTRIES = ['veterinary', 'dental', 'hvac', 'msp', 'pest_control'];
export const ROLLUP_REVENUE_THRESHOLD = 1_500_000;
```

---

*End of specification. This document, combined with METHODOLOGY_V17.md (already in repo), gives Claude Code everything it needs to build smbx.ai from scratch.*
