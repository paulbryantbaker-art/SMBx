/**
 * Wallet Service — Balance tracking, deposits, debits, and transaction history.
 * All amounts in CENTS (integers). $1 in wallet = $1 purchasing power.
 */
import { sql } from '../db.js';

export interface Wallet {
  id: number;
  user_id: number;
  balance_cents: number;
  total_deposited_cents: number;
  total_spent_cents: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: number;
  user_id: number;
  type: 'credit' | 'debit' | 'refund';
  amount_cents: number;
  description: string;
  deal_id: number | null;
  menu_item_id: number | null;
  stripe_session_id: string | null;
  created_at: string;
}

/** Get or create wallet for a user */
export async function getOrCreateWallet(userId: number): Promise<Wallet> {
  const [existing] = await sql`SELECT * FROM wallets WHERE user_id = ${userId}`;
  if (existing) return existing as unknown as Wallet;

  const [wallet] = await sql`
    INSERT INTO wallets (user_id, balance_cents, total_deposited_cents, total_spent_cents)
    VALUES (${userId}, 0, 0, 0)
    RETURNING *
  `;
  return wallet as unknown as Wallet;
}

/** Get wallet balance */
export async function getBalance(userId: number): Promise<number> {
  const wallet = await getOrCreateWallet(userId);
  return wallet.balance_cents;
}

/** Credit wallet (deposit) */
export async function creditWallet(
  userId: number,
  amountCents: number,
  description: string,
  stripeSessionId?: string,
): Promise<Wallet> {
  // Update balance
  const [wallet] = await sql`
    UPDATE wallets
    SET balance_cents = balance_cents + ${amountCents},
        total_deposited_cents = total_deposited_cents + ${amountCents},
        updated_at = NOW()
    WHERE user_id = ${userId}
    RETURNING *
  `;

  // Log transaction
  await sql`
    INSERT INTO wallet_transactions (user_id, type, amount_cents, description, stripe_session_id)
    VALUES (${userId}, 'credit', ${amountCents}, ${description}, ${stripeSessionId || null})
  `;

  return wallet as unknown as Wallet;
}

/** Debit wallet (purchase) */
export async function debitWallet(
  userId: number,
  amountCents: number,
  description: string,
  dealId?: number,
  menuItemId?: number,
): Promise<{ success: boolean; wallet?: Wallet; error?: string }> {
  // Check balance first
  const wallet = await getOrCreateWallet(userId);
  if (wallet.balance_cents < amountCents) {
    return {
      success: false,
      error: `Insufficient balance. Need $${(amountCents / 100).toFixed(2)}, have $${(wallet.balance_cents / 100).toFixed(2)}.`,
    };
  }

  // Deduct
  const [updated] = await sql`
    UPDATE wallets
    SET balance_cents = balance_cents - ${amountCents},
        total_spent_cents = total_spent_cents + ${amountCents},
        updated_at = NOW()
    WHERE user_id = ${userId} AND balance_cents >= ${amountCents}
    RETURNING *
  `;

  if (!updated) {
    return { success: false, error: 'Insufficient balance (race condition).' };
  }

  // Log transaction
  await sql`
    INSERT INTO wallet_transactions (user_id, type, amount_cents, description, deal_id, menu_item_id)
    VALUES (${userId}, 'debit', ${amountCents}, ${description}, ${dealId || null}, ${menuItemId || null})
  `;

  return { success: true, wallet: updated as unknown as Wallet };
}

/** Refund a transaction */
export async function refundTransaction(
  transactionId: number,
): Promise<{ success: boolean; error?: string }> {
  const [tx] = await sql`SELECT * FROM wallet_transactions WHERE id = ${transactionId} AND type = 'debit'`;
  if (!tx) return { success: false, error: 'Transaction not found' };

  const userId = tx.user_id as number;
  const amount = tx.amount_cents as number;

  await sql`
    UPDATE wallets
    SET balance_cents = balance_cents + ${amount},
        total_spent_cents = total_spent_cents - ${amount},
        updated_at = NOW()
    WHERE user_id = ${userId}
  `;

  await sql`
    INSERT INTO wallet_transactions (user_id, type, amount_cents, description, deal_id, menu_item_id)
    VALUES (${userId}, 'refund', ${amount}, ${'Refund: ' + tx.description}, ${tx.deal_id}, ${tx.menu_item_id})
  `;

  return { success: true };
}

/** Get transaction history */
export async function getTransactionHistory(
  userId: number,
  limit = 50,
): Promise<WalletTransaction[]> {
  const rows = await sql`
    SELECT * FROM wallet_transactions
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as unknown as WalletTransaction[];
}

/** Purchase a deliverable: debit wallet + create deliverable record */
export async function purchaseDeliverable(
  userId: number,
  dealId: number,
  menuItemId: number,
  priceCents: number,
  deliverableType: string,
  description: string,
): Promise<{ success: boolean; deliverableId?: number; error?: string }> {
  const debitResult = await debitWallet(userId, priceCents, description, dealId, menuItemId);
  if (!debitResult.success) {
    return { success: false, error: debitResult.error };
  }

  const [deliverable] = await sql`
    INSERT INTO deliverables (deal_id, user_id, menu_item_id, type, status, price_charged_cents)
    VALUES (${dealId}, ${userId}, ${menuItemId}, ${deliverableType}, 'pending', ${priceCents})
    RETURNING id
  `;

  return { success: true, deliverableId: deliverable.id as number };
}
