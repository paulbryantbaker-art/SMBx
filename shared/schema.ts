// ─── Users & Auth ───────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  password: string | null;
  display_name: string | null;
  google_id: string | null;
  league: string | null;
  role: string;
  created_at: Date;
  updated_at: Date;
}

// ─── Wallets ────────────────────────────────────────────────

export interface Wallet {
  id: number;
  user_id: number;
  balance_cents: number;
  auto_refill_enabled: boolean;
  auto_refill_threshold_cents: number;
  auto_refill_amount_cents: number;
  created_at: Date;
}

export interface WalletTransaction {
  id: number;
  wallet_id: number;
  amount_cents: number;
  type: string;
  description: string | null;
  stripe_payment_intent_id: string | null;
  menu_item_id: string | null;
  balance_after_cents: number;
  created_at: Date;
}

export interface WalletBlock {
  id: number;
  name: string;
  price_cents: number;
  credits_cents: number;
  bonus_percent: number;
  sort_order: number;
}

// ─── Conversations & Messages ───────────────────────────────

export interface Conversation {
  id: number;
  user_id: number | null;
  deal_id: number | null;
  title: string;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: string;
  content: string;
  metadata: unknown;
  created_at: Date;
}

// ─── Deals ──────────────────────────────────────────────────

export interface Deal {
  id: number;
  user_id: number;
  journey_type: string;
  current_gate: string;
  league: string | null;
  industry: string | null;
  location: string | null;
  business_name: string | null;
  revenue: number | null;
  sde: number | null;
  ebitda: number | null;
  asking_price: number | null;
  financials: unknown;
  status: string;
  created_at: Date;
  updated_at: Date;
}

// ─── Menu Catalog ───────────────────────────────────────────

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  tier: string;
  base_price_cents: number;
  journey_type: string | null;
  gate: string | null;
  category: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface DealPackage {
  id: number;
  name: string;
  description: string | null;
  price_cents: number;
  discount_percent: number;
  journey_type: string | null;
  included_menu_item_ids: unknown;
  is_active: boolean;
}

// ─── Anonymous Sessions ────────────────────────────────────

export interface AnonymousSession {
  id: number;
  session_id: string;
  ip: string;
  source_page: string | null;
  messages: unknown;
  message_count: number;
  created_at: Date;
  last_active_at: Date;
  expires_at: Date;
  converted_to_user_id: number | null;
}

// ─── Deliverables ───────────────────────────────────────────

export interface Deliverable {
  id: number;
  deal_id: number;
  user_id: number;
  menu_item_id: number | null;
  type: string;
  status: string;
  content: unknown;
  price_paid_cents: number | null;
  created_at: Date;
  completed_at: Date | null;
}
