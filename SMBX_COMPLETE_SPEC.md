# SMBX.AI — COMPLETE BUILD SPECIFICATION FOR CLAUDE CODE
## Fresh Build from Scratch | February 2026

**Repository:** github.com/paulbryantbaker-art/SMBx (private)
**Domain:** smbx.ai
**Document Version:** 2.0 (Updated February 21, 2026)
**Source Documents:** BUILD_PLAN_v5 + Methodology_V17_Combined.md
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

---

## 1. PRODUCT OVERVIEW

**What:** AI-powered M&A platform for SMB through mega-cap deals.

**AI Advisor:** Yulia — conversational AI that guides users through their entire M&A journey. She asks questions, produces deliverables, and advances them through gates.

**Experience:** Chat-first. Users talk to Yulia, not dashboards. The entire UX mirrors claude.ai — a left sidebar with conversation history, a centered chat area, and a clean input composer at the bottom.

**Core Mandate:** "Data is Commodity; Workflow is the Moat."

**Brand:** smbx.ai (formerly sbsmb / sellbuysmb)

**Messaging Rule:** Never say "AI-powered." Say "instant," "smart," or just describe the outcome. Yulia is presented as an expert advisor, never as "an AI chatbot."

**Homepage Hero:** "Sell a business. Buy a business. Raise capital." — Visitors know what the platform does in 2 seconds (Beer/Wine/Cigarettes principle).

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

Apply sparingly:
- Modal/dialog backdrops: `backdrop-blur-sm bg-black/20`
- Dropdown menus: `backdrop-blur-md bg-white/90`
- Wallet card: `backdrop-blur-lg bg-white/80 border border-white/20`
- **Do NOT apply glassmorphism to the main chat area or sidebar.** Those stay solid like Claude.

---

## 3. TECH STACK

| Layer | Technology | Notes |
|-------|-----------|-------|
| Runtime | Node.js 20+ + Express (ESM) | ES modules throughout |
| Frontend | React 19 + Vite 7 + **Tailwind CSS v3** | SPA, mobile-first. **v4 breaks on Railway.** |
| UI Primitives | Radix UI | Unstyled, accessible |
| Routing (client) | wouter | Lightweight, ~1.5kb |
| Database | **PostgreSQL via raw postgres-js** | **No ORM. Drizzle broke on Railway, bypassed entirely.** |
| AI (primary) | Anthropic Claude API | Claude Sonnet 4.5 for chat |
| AI (secondary) | Google Gemini 2.5 | Flash for extraction, Pro for reasoning |
| AI (tertiary) | OpenAI | Fallback only |
| Payments | Stripe | Wallet top-ups, webhooks |
| Auth | **JWT (jsonwebtoken)** | **No sessions, no passport. Sessions broke on Railway.** |
| Deployment | Railway | PostgreSQL + Node.js service |
| Repo | GitHub (private) | SMBx |

### Key Dependencies

```json
{
  "dependencies": {
    "express": "^4.21",
    "postgres": "^3.4",
    "@anthropic-ai/sdk": "^0.39",
    "@google/generative-ai": "^0.21",
    "stripe": "^17",
    "jsonwebtoken": "^9",
    "bcrypt": "^5",
    "zod": "^3.23",
    "cors": "^2.8",
    "helmet": "^8",
    "compression": "^1.7"
  },
  "devDependencies": {
    "vite": "^7",
    "tailwindcss": "^3",
    "postcss": "^8",
    "autoprefixer": "^10",
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
    "esbuild": "^0.24"
  }
}
```

### Database Query Pattern

All database access uses raw postgres-js — no ORM:

```typescript
// server/db.ts
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL);
export default sql;

// Usage in any service:
import sql from '../db.ts';
const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
const result = await sql`INSERT INTO deals ${sql(dealData)} RETURNING *`;
```

Schema changes: write raw SQL migrations in `server/migrations/` and run them on deploy or manually.

---

## 4. PROJECT STRUCTURE

```
SMBx/
├── CLAUDE.md                          # Claude Code reads this first
├── METHODOLOGY_V17.md                 # Full methodology (in repo)
├── SMBX_COMPLETE_SPEC.md             # This file
├── YULIA_PROMPTS_V2.md               # Agentic runtime prompts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js                 # Tailwind v3 config
├── postcss.config.js                  # PostCSS for Tailwind v3
├── railway.json
├── .env.example
├── .gitignore
│
├── scripts/
│   └── build.ts                       # esbuild config for server
│
├── shared/                            # Shared between client & server
│   ├── types.ts                       # Shared TypeScript types
│   ├── gateRegistry.ts                # 22 gates: S0-S5, B0-B5, R0-R5, PMI0-PMI3
│   ├── sidebarRules.ts                # Progressive disclosure by gate
│   ├── constants.ts                   # League ranges, safe harbor, etc.
│   └── validation.ts                  # Zod schemas for API payloads
│
├── server/
│   ├── index.ts                       # Express server entry point
│   ├── db.ts                          # postgres-js connection
│   ├── routes.ts                      # All API routes
│   ├── ai.ts                          # AI orchestration layer
│   ├── migrations/                    # Raw SQL migration files
│   │   ├── 001_initial_schema.sql
│   │   └── ...
│   ├── routes/
│   │   ├── auth.ts                    # JWT auth routes
│   │   └── chat.ts                    # Chat CRUD + messages
│   ├── middleware/
│   │   ├── auth.ts                    # JWT verification middleware
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
│       └── stripeService.ts           # Stripe integration
│
├── client/
│   ├── index.html
│   └── src/
│       ├── App.tsx                    # Route definitions (wouter)
│       ├── main.tsx                   # React entry
│       ├── index.css                  # Tailwind v3 imports + CSS vars
│       ├── styles/
│       │   └── DESIGN_SYSTEM.md       # Design system reference
│       │
│       ├── hooks/
│       │   ├── useWallet.ts           # Wallet state + actions
│       │   ├── useChat.ts             # Chat messages + streaming
│       │   ├── useAuth.ts             # Auth state (JWT)
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

All tables defined as raw SQL. Run migrations via `server/migrations/` files.

### 5.1 Users & Auth

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  avatar_url TEXT,
  google_id VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'user',          -- user, admin, broker
  league VARCHAR(10),                        -- L1-L6, set after onboarding
  journey_type VARCHAR(20),                  -- sell, buy, raise, pmi
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 Wallet & Payments

```sql
CREATE TABLE wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL UNIQUE,
  balance_cents INTEGER DEFAULT 0 NOT NULL,   -- $1 = 100 cents. $1 in wallet = $1 purchasing power.
  auto_refill_enabled BOOLEAN DEFAULT false,
  auto_refill_threshold_cents INTEGER DEFAULT 5000,   -- $50
  auto_refill_amount_cents INTEGER DEFAULT 25000,     -- $250
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wallet_transactions (
  id SERIAL PRIMARY KEY,
  wallet_id INTEGER REFERENCES wallets(id) NOT NULL,
  type VARCHAR(20) NOT NULL,                  -- topup, purchase, refund, bonus
  amount_cents INTEGER NOT NULL,              -- positive = credit, negative = debit
  balance_after_cents INTEGER NOT NULL,
  description TEXT,
  menu_item_id VARCHAR(100),
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wallet_blocks (
  id VARCHAR(50) PRIMARY KEY,                 -- 'starter', 'builder', etc.
  name VARCHAR(100) NOT NULL,
  price_cents INTEGER NOT NULL,
  bonus_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL,               -- price_cents + bonus_cents
  discount_percent INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);
```

### 5.3 Conversations & Messages

```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  deal_id INTEGER REFERENCES deals(id),
  title VARCHAR(255) DEFAULT 'New conversation',
  journey_type VARCHAR(20),
  current_gate VARCHAR(20),
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) NOT NULL,
  role VARCHAR(20) NOT NULL,                  -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  metadata JSONB,                             -- gate transitions, deliverables, etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.4 Deals

```sql
CREATE TABLE deals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  journey_type VARCHAR(20) NOT NULL,          -- sell, buy, raise, pmi
  league VARCHAR(10),
  current_gate VARCHAR(20) DEFAULT 'S0',
  
  -- Business basics
  business_name VARCHAR(255),
  industry VARCHAR(100),
  location VARCHAR(255),
  years_in_operation INTEGER,
  
  -- Financials (all in cents)
  annual_revenue INTEGER,
  sde INTEGER,
  ebitda INTEGER,
  adjusted_ebitda INTEGER,
  
  -- Valuation (all in cents)
  valuation_low INTEGER,
  valuation_mid INTEGER,
  valuation_high INTEGER,
  multiple_used DECIMAL,
  metric_used VARCHAR(20),                    -- SDE or EBITDA
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',        -- active, closed, paused
  complexity_flags JSONB,                     -- Wagyu Rule triggers
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5.5 Menu Catalog

```sql
CREATE TABLE menu_items (
  id VARCHAR(100) PRIMARY KEY,                -- 'quick-valuation', 'full-cim', etc.
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tier VARCHAR(20) NOT NULL,                  -- 'analyst', 'associate', 'vp'
  base_price_cents INTEGER NOT NULL,
  category VARCHAR(50),                       -- financial, packaging, sourcing
  journey_types JSONB,                        -- ['sell', 'buy', 'raise']
  gate_requirement VARCHAR(20),               -- minimum gate to access
  is_free BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE deal_packages (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price_cents INTEGER NOT NULL,
  included_item_ids JSONB,                    -- array of menu item IDs
  discount_percent INTEGER DEFAULT 0,
  journey_type VARCHAR(20),
  sort_order INTEGER DEFAULT 0
);
```

### 5.6 Deliverables

```sql
CREATE TABLE deliverables (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id) NOT NULL,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  menu_item_id VARCHAR(100) REFERENCES menu_items(id),
  conversation_id INTEGER REFERENCES conversations(id),
  
  type VARCHAR(50) NOT NULL,                  -- valuation, cim, buyer-list, etc.
  title VARCHAR(255) NOT NULL,
  content JSONB,                              -- structured output
  markdown_content TEXT,                      -- rendered content
  status VARCHAR(20) DEFAULT 'generating',    -- generating, complete, error
  
  price_paid_cents INTEGER,
  league_multiplier DECIMAL,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.7 GTM Feature Tables (Build Later)

These tables support future GTM features. Build when needed, not upfront:

```sql
-- Living CIMs
CREATE TABLE living_cims (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id) NOT NULL,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  content JSONB NOT NULL,
  publish_state VARCHAR(20) DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CIM Share Links
CREATE TABLE cim_share_links (
  id SERIAL PRIMARY KEY,
  cim_id INTEGER REFERENCES living_cims(id) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  access_level VARCHAR(20) NOT NULL,          -- blind, teaser, full
  view_count INTEGER DEFAULT 0,
  max_views INTEGER,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Day Passes
CREATE TABLE day_passes (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id) NOT NULL,
  created_by INTEGER REFERENCES users(id) NOT NULL,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  access_level VARCHAR(20) DEFAULT 'read',
  duration_hours INTEGER DEFAULT 48,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Deal Velocity Events
CREATE TABLE deal_velocity_events (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  metadata JSONB,
  occurred_at TIMESTAMP DEFAULT NOW()
);

-- Deal Network Participants
CREATE TABLE deal_network_participants (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  email VARCHAR(255),
  role VARCHAR(20) NOT NULL,                  -- buyer, seller, attorney, cpa, lender, broker
  joined_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. AUTHENTICATION

### 6.1 JWT-Based Auth (Primary)

```
User submits email + password (or Google OAuth)
→ Validate credentials
→ Generate JWT token (jsonwebtoken)
→ Return token to client
→ Client stores in memory (not localStorage for security)
→ Client sends token in Authorization header on every request
```

### 6.2 JWT Configuration

```typescript
// server/routes/auth.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '30d';

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, league: user.league },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}
```

### 6.3 Auth Middleware

```typescript
// server/middleware/auth.ts
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### 6.4 Google OAuth Flow

```
User clicks "Continue with Google"
→ Redirect to Google OAuth consent screen
→ Google callback with code
→ Exchange for tokens, get profile
→ Find or create user in DB
→ Generate JWT
→ Redirect to /app/chat with token
```

### 6.5 Password Hashing

For local auth: bcrypt with 12 rounds. Password validation not yet enforced (placeholder — implement before launch).

---

## 7. PRICING ENGINE — PURE WALLET + MENU (NO SUBSCRIPTIONS)

**This is critical. There are NO subscription tiers, NO monthly plans, NO feature gates based on plan level.** The entire pricing model is:

1. User signs up free → free gates hook them in (S0-S1, B0-B1, R0-R1, PMI0)
2. Free deliverables build trust (intake, financial spread, add-backs)
3. First paywall hits at gate 2 (valuation / investor materials)
4. User tops up wallet with real dollars via Stripe
5. **Gate-by-gate pricing:** Users pay small, manageable amounts as they advance through gates — NOT one big lump sum per journey. Each gate unlock is a clear price point that keeps users moving forward.
6. $1 in wallet = $1 purchasing power. No separate "credit" unit. No conversion math.
7. League multiplier adjusts pricing based on deal complexity
8. Yulia contextually proposes value-added services (business optimization, transaction readiness) as natural upsells during the journey

### 7.1 Wallet Top-Up Blocks

| Block ID | Name | Price | Bonus $ | Total $ | Discount |
|----------|------|-------|---------|---------|----------|
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

### 7.2 Menu Item Tiers (Base Prices — before league multiplier)

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
  S2: { name: 'Valuation', journey: 'sell', free: false },
  S3: { name: 'Packaging', journey: 'sell', free: false },
  S4: { name: 'Market Matching', journey: 'sell', free: false },
  S5: { name: 'Closing', journey: 'sell', free: false },
  
  // BUY Journey
  B0: { name: 'Thesis', journey: 'buy', free: true },
  B1: { name: 'Sourcing', journey: 'buy', free: true },
  B2: { name: 'Valuation', journey: 'buy', free: false },
  B3: { name: 'Due Diligence', journey: 'buy', free: false },
  B4: { name: 'Structuring', journey: 'buy', free: false },
  B5: { name: 'Closing', journey: 'buy', free: false },
  
  // RAISE Journey
  R0: { name: 'Intake', journey: 'raise', free: true },
  R1: { name: 'Financial Package', journey: 'raise', free: true },
  R2: { name: 'Investor Materials', journey: 'raise', free: false },
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

### 8.3 Sidebar Progressive Disclosure

The sidebar only shows navigation items relevant to the user's current gate and journey. As gates advance, new sections unlock.

### 8.4 SELL Journey Detail

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

### 8.5 BUY Journey Detail

| Gate | Name | Key Deliverables | Free? |
|------|------|-----------------|-------|
| B0 | Thesis | Buy box definition, acquisition criteria, capital stack template | Yes |
| B1 | Sourcing | Deal sourcing, opportunity matching, pipeline management | Yes |
| B2 | Valuation | Target valuation, offer modeling, DSCR/ROI projections | No |
| B3 | Due Diligence | DD checklist, red flags, QoE coordination | No |
| B4 | Structuring | Deal structure, financing, sources & uses, earnout modeling | No |
| B5 | Closing | APA review, closing checklist, funds flow, Day 1 integration plan | No |

### 8.6 RAISE Journey Detail

| Gate | Name | Key Deliverables | Free? |
|------|------|-----------------|-------|
| R0 | Intake | Capital needs assessment, raise strategy brief | Yes |
| R1 | Financial Package | Investor-ready financials, projections, cap table | Yes |
| R2 | Investor Materials | AI pitch deck (10-15 slides), executive summary, teaser | No |
| R3 | Outreach | Investor list, outreach messaging, pipeline tracking | No |
| R4 | Terms | Term sheet analysis, comparison matrix, negotiation prep | No |
| R5 | Closing | Transaction documents, closing mechanics, Form D filing | No |

### 8.7 PMI Journey Detail

| Gate | Name | Key Deliverables | Free? |
|------|------|-----------------|-------|
| PMI0 | Day 0 | Integration planning, Day 1 checklist, security/access handoff | Yes |
| PMI1 | Stabilization | First 90 days playbook, employee comms, customer outreach | No |
| PMI2 | Assessment | SWOT analysis, financial deep-dive, quick win identification | No |
| PMI3 | Optimization | Value creation plan, 12-month roadmap, synergy tracking | No |

---

## 9. AI ORCHESTRATION

### 9.1 The "Right Tool" Protocol

Every task routes to a specialized AI engine:

| Task Category | Engine | Configuration |
|---------------|--------|---------------|
| Chat / Conversation | Claude Sonnet 4.5 | Streaming, system prompt with methodology context |
| Financial Extraction | Gemini 2.5 Flash | JSON output only, temp 0.0 |
| Market Intelligence | Gemini 2.5 Pro + Search | Search grounding enabled |
| Document Forensics | Claude with RAG context | Grounded only, temp 0.1 |
| Drafting (LOI/CIM) | Claude Sonnet 4.5 | Template injection |
| Quick Valuation | Claude Haiku 4.5 | Structured output |

### 9.2 Context Injection Protocol

Every AI prompt receives layered context:

```
Layer 1: CONSTITUTION — Core methodology rules, hard rails, forbidden actions
Layer 2: USER CONTEXT — League (L1-L6), role, deal history, preferences
Layer 3: DEAL CONTEXT — Current gate, financials ingested, documents uploaded
Layer 4: MARKET CONTEXT — Industry heat index, regional data, macro overlays
```

### 9.3 Streaming

All chat responses stream via Server-Sent Events (SSE):

```typescript
app.get('/api/chat/stream/:conversationId', requireAuth, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
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

| League | Persona | Tone |
|--------|---------|------|
| L1 | Coach | Directive, reassuring |
| L2 | Guide | Process-oriented |
| L3 | Analyst | Cynical, data-driven |
| L4 | Associate | GAAP-focused |
| L5 | Partner | Strategic |
| L6 | Macro | Institutional |

### 10.2 Hard Rails

Yulia NEVER: says "As an AI", hallucinates financial data, confirms add-backs without verification, provides legal advice, shares data between deals.

Yulia ALWAYS: uses confident direct language, provides specific actionable recommendations, shows her work, asks for verification on financial inputs, alerts to risks and red flags.

### 10.3 Welcome Screen

When a user starts a new conversation (no active deal), Yulia presents journey options as interactive cards:

```
Welcome to smbx.ai! I'm Yulia, your M&A advisor.

What brings you here today?

[🏷️ Sell my business]  [🛒 Buy a business]  [💰 Raise capital]  [🔄 Post-acquisition]
```

---

## 11. THE MATH ENGINE

The AI is forbidden from inventing formulas. It must apply these exact standards.

```
SDE = Net_Income + Owner_Salary + D&A + Interest + One_Time + Verified_Addbacks
EBITDA = Net_Income + D&A + Interest + Taxes + Verified_Addbacks - Non_Recurring
DSCR = EBITDA / Annual_Debt_Service (SBA ≥ 1.25, Conventional ≥ 1.50)
Valuation = (SDE or EBITDA) × (Base_Multiple + Growth_Premium + Margin_Premium)
Transaction_Fee = MAX(deal_value × 0.5%, $2,000)
```

### League Multiple Ranges

```typescript
export const LEAGUE_MULTIPLE_RANGES = {
  L1: { metric: 'SDE', min: 2.0, max: 3.5 },
  L2: { metric: 'SDE', min: 3.0, max: 5.0 },
  L3: { metric: 'EBITDA', min: 4.0, max: 6.0 },
  L4: { metric: 'EBITDA', min: 6.0, max: 8.0 },
  L5: { metric: 'EBITDA', min: 8.0, max: 12.0 },
  L6: { metric: 'EBITDA', min: 10.0, max: null },
};
```

### Roll-Up Override

Industries: veterinary, dental, HVAC, MSP, pest control. If revenue > $1.5M → force EBITDA metric regardless of league.

---

## 12. LEAGUE GOVERNANCE

The AI is forbidden from guessing the user's league. It classifies based on financial inputs.

```typescript
export function classifyLeague(financials: { sde?: number; ebitda?: number }): League {
  const { sde, ebitda } = financials;
  if (ebitda && ebitda >= 50_000_000) return 'L6';
  if (ebitda && ebitda >= 10_000_000) return 'L5';
  if (ebitda && ebitda >= 5_000_000) return 'L4';
  if (ebitda && ebitda >= 2_000_000) return 'L3';
  if (sde && sde >= 500_000) return 'L2';
  return 'L1';
}
```

League determines: financial metric, multiple ranges, deliverable pricing, Yulia's persona, document complexity, template selection.

---

## 13. GTM FEATURE SUITE

Build these AFTER core functionality (Phases 0-6) works. They are future roadmap items:

- **Living CIM Builder** — Real-time binding to accounting data, sensitivity toggles, share links
- **Ghost Profile Notifications** — Track when buyers watch unclaimed businesses
- **Broker Listing Generator** — AI-powered CIM from raw financials
- **Lender Risk Dashboard** — DSCR calculation, risk scoring, SBA eligibility
- **Day Pass / Fractional Seats** — 48-hour deal-specific access for external advisors
- **Transaction Token Pricing** — Success fee at closing
- **Deal Velocity Tracking** — Pipeline analytics
- **Escrow Integration** — Deposit, earnout, holdback management
- **Magma Feedback Loop** — Verified financials post-close to improve models
- **Network Density Metrics** — Deal room participant tracking

---

## 14. API ROUTES

### 14.1 Auth
```
POST   /api/auth/register          # Local signup → returns JWT
POST   /api/auth/login             # Local login → returns JWT
GET    /api/auth/google             # Google OAuth initiate
GET    /api/auth/google/callback    # Google OAuth callback → returns JWT
GET    /api/auth/me                 # Current user (from JWT)
```

### 14.2 Chat
```
GET    /api/chat/conversations                    # List user conversations
POST   /api/chat/conversations                    # Create conversation
GET    /api/chat/conversations/:id                # Get conversation with messages
GET    /api/chat/conversations/:id/messages       # Get messages
POST   /api/chat/conversations/:id/messages       # Send message + get AI response
GET    /api/chat/conversations/:id/stream         # SSE stream response
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

---

## 15. FRONTEND PAGES & COMPONENTS

### 15.1 Public Pages (No Auth Required)

| Path | Page | Purpose |
|------|------|---------|
| `/` | Home | "Sell a business. Buy a business. Raise capital." |
| `/sell` | Sell | Seller journey value prop |
| `/buy` | Buy | Buyer journey value prop |
| `/raise` | Raise | Capital raise value prop |
| `/pricing` | Pricing | Wallet model explanation |
| `/how-it-works` | How It Works | Product walkthrough |
| `/enterprise` | Enterprise | Broker/advisor use cases |
| `/login` | Login | Auth page |
| `/signup` | Signup | Registration page |

### 15.2 App Pages (Auth Required)

| Path | Page | Purpose |
|------|------|---------|
| `/chat` | Chat | **THE primary page.** Yulia conversation. |
| `/chat/:conversationId` | Chat | Specific conversation |
| `/wallet` | Wallet | Balance, top-up, history |
| `/menu` | Menu | Browse deliverables catalog |
| `/settings` | Settings | User preferences |

---

## 16. SECURITY & DATA SOVEREIGNTY

### 16.1 Chinese Wall
- Buyer data and seller data strictly isolated
- AI context window flushed after every user session
- No data from Deal A can inform Deal B

### 16.2 Safe Harbor Geofence
```typescript
export const SAFE_HARBOR_COUNTRIES = ['US', 'UK', 'CA', 'AU', 'NZ', 'IE'];
```

### 16.3 Security Headers (Helmet.js)
- Content-Security-Policy, X-Frame-Options: DENY, Strict-Transport-Security

### 16.4 Data Handling
- All financial values stored in cents (integers, no floating point)
- Password hashing: bcrypt 12 rounds
- JWT tokens: httpOnly not applicable (stored in memory), short-lived with refresh
- File uploads: type validation, size limits
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
- [ ] Initialize fresh repo (npm init, tsconfig, vite config)
- [ ] Set up project structure (directories per Section 4)
- [ ] Install all dependencies (Tailwind v3, postgres-js, JWT)
- [ ] Create server/db.ts (postgres-js connection)
- [ ] Create server/index.ts (Express + static serving)
- [ ] Create client scaffold (App.tsx, routes, layouts)
- [ ] Create railway.json + tailwind.config.js + postcss.config.js
- [ ] Verify: `npm run dev` works, app loads in browser
- [ ] Deploy to Railway, verify it loads

### Phase 1: Auth + Database (Days 2-3, ~12 hours)
- [ ] Run initial SQL migration (create core tables)
- [ ] Implement JWT auth (register, login, verify)
- [ ] Implement Google OAuth flow (optional — JWT return)
- [ ] Auth middleware (JWT verification)
- [ ] Login/Signup pages
- [ ] Protected route wrapper
- [ ] Seed wallet blocks + menu items + test users

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
- [ ] Top-up flow (modal → Stripe → credit wallet)
- [ ] Purchase flow (check balance → deduct → generate)
- [ ] Auto-refill settings
- [ ] League multiplier calculation
- [ ] Wagyu Rule surcharge notification
- [ ] Insufficient funds interstitial
- [ ] Wallet dashboard page + transaction history

### Phase 5: Journey & Gate System (Days 9-11, ~12 hours)
- [ ] Gate registry implementation
- [ ] Gate readiness checks + advancement logic
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
- [ ] Home page ("Sell a business. Buy a business. Raise capital.")
- [ ] Sell, Buy, Raise, Pricing pages
- [ ] How It Works + Enterprise pages
- [ ] Meta tags, OG tags, favicon
- [ ] Remove all sbsmb/sellbuysmb references

### Phase 8: Testing & Launch Prep (Days 14-15, ~8 hours)
- [ ] E2E test: signup → onboard → free deliverable → paywall → topup → purchase → receive
- [ ] Test Stripe webhook in live mode
- [ ] Test on iOS Safari (primary mobile target)
- [ ] Test on desktop Chrome/Safari
- [ ] Custom domain setup (smbx.ai → Railway)
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

# Auth
JWT_SECRET=<random-64-char-string>

# App
NODE_ENV=production
PORT=3000
APP_URL=https://smbx.ai
```

---

## IMPLEMENTATION CONSTANTS

```typescript
// shared/constants.ts

export const TRANSACTION_TOKEN_FEE_PERCENT = 0.005;
export const TRANSACTION_TOKEN_FEE_MINIMUM = 200000; // $2,000 in cents

export const DAY_PASS_DEFAULT_HOURS = 48;
export const DAY_PASS_ACCESS_LEVELS = ['read', 'comment', 'full'] as const;

export const DEAL_VELOCITY_EVENTS = [
  'discovery', 'first_view', 'saved', 'nda_signed', 'cim_requested',
  'meeting_scheduled', 'loi_submitted', 'loi_accepted',
  'due_diligence_started', 'closing'
] as const;

export const NETWORK_ROLES = [
  'buyer', 'seller', 'attorney', 'cpa', 'lender', 'broker', 'consultant', 'other'
] as const;

export const CIM_ACCESS_LEVELS = ['blind', 'teaser', 'full'] as const;

export const SAFE_HARBOR_COUNTRIES = ['US', 'UK', 'CA', 'AU', 'NZ', 'IE'];

export const ROLLUP_INDUSTRIES = ['veterinary', 'dental', 'hvac', 'msp', 'pest_control'];
export const ROLLUP_REVENUE_THRESHOLD = 1_500_000;
```

---

*End of specification. This document, combined with CLAUDE.md, METHODOLOGY_V17.md, and YULIA_PROMPTS_V2.md gives Claude Code everything it needs to build smbx.ai.*
