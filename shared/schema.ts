import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

// ─── Users & Auth ───────────────────────────────────────────

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }), // nullable for Google OAuth
  displayName: varchar('display_name', { length: 255 }),
  googleId: varchar('google_id', { length: 255 }).unique(),
  league: varchar('league', { length: 10 }), // L1-L6
  role: varchar('role', { length: 50 }).default('user'), // user, admin, broker
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Wallets ────────────────────────────────────────────────

export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  balanceCents: integer('balance_cents').default(0).notNull(),
  autoRefillEnabled: boolean('auto_refill_enabled').default(false),
  autoRefillThresholdCents: integer('auto_refill_threshold_cents').default(5000),
  autoRefillAmountCents: integer('auto_refill_amount_cents').default(25000),
  createdAt: timestamp('created_at').defaultNow(),
});

export const walletTransactions = pgTable('wallet_transactions', {
  id: serial('id').primaryKey(),
  walletId: integer('wallet_id').references(() => wallets.id).notNull(),
  amountCents: integer('amount_cents').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // credit, debit
  description: text('description'),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  menuItemId: varchar('menu_item_id', { length: 100 }),
  balanceAfterCents: integer('balance_after_cents').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const walletBlocks = pgTable('wallet_blocks', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  priceCents: integer('price_cents').notNull(),
  creditsCents: integer('credits_cents').notNull(),
  bonusPercent: integer('bonus_percent').default(0),
  sortOrder: integer('sort_order').default(0),
});

// ─── Conversations & Messages ───────────────────────────────

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  dealId: integer('deal_id'),
  title: varchar('title', { length: 255 }).default('New conversation'),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // user, assistant, system
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Deals ──────────────────────────────────────────────────

export const deals = pgTable('deals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  journeyType: varchar('journey_type', { length: 20 }).notNull(), // sell, buy, raise, pmi
  currentGate: varchar('current_gate', { length: 20 }).default('S0'),
  league: varchar('league', { length: 10 }),
  industry: varchar('industry', { length: 100 }),
  location: varchar('location', { length: 255 }),
  businessName: varchar('business_name', { length: 255 }),
  revenue: integer('revenue'), // cents
  sde: integer('sde'), // cents
  ebitda: integer('ebitda'), // cents
  askingPrice: integer('asking_price'), // cents
  financials: jsonb('financials'),
  status: varchar('status', { length: 20 }).default('active'), // active, closed, paused
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Menu Catalog ───────────────────────────────────────────

export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  tier: varchar('tier', { length: 20 }).notNull(), // analyst, associate, vp
  basePriceCents: integer('base_price_cents').notNull(),
  journeyType: varchar('journey_type', { length: 20 }),
  gate: varchar('gate', { length: 20 }),
  category: varchar('category', { length: 50 }),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
});

export const dealPackages = pgTable('deal_packages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  discountPercent: integer('discount_percent').default(0),
  journeyType: varchar('journey_type', { length: 20 }),
  includedMenuItemIds: jsonb('included_menu_item_ids'),
  isActive: boolean('is_active').default(true),
});

// ─── Deliverables ───────────────────────────────────────────

export const deliverables = pgTable('deliverables', {
  id: serial('id').primaryKey(),
  dealId: integer('deal_id').references(() => deals.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  menuItemId: integer('menu_item_id').references(() => menuItems.id),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // pending, generating, complete, error
  content: jsonb('content'),
  pricePaidCents: integer('price_paid_cents'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});
