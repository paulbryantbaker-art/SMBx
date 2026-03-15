import { Router } from 'express';
import { getBalance, getTransactionHistory, getOrCreateWallet } from '../services/walletService.js';

export const walletRouter = Router();

// GET /api/wallet — Get wallet balance + summary
walletRouter.get('/wallet', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const wallet = await getOrCreateWallet(userId);
    return res.json({
      balanceCents: wallet.balance_cents,
      balanceDisplay: `$${(wallet.balance_cents / 100).toFixed(2)}`,
      totalDepositedCents: wallet.total_deposited_cents,
      totalSpentCents: wallet.total_spent_cents,
    });
  } catch (err: any) {
    console.error('Get wallet error:', err.message);
    return res.status(500).json({ error: 'Failed to load wallet' });
  }
});

// GET /api/wallet/transactions — Get transaction history
walletRouter.get('/wallet/transactions', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const transactions = await getTransactionHistory(userId, limit);

    return res.json(transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amountCents: tx.amount_cents,
      amountDisplay: `${tx.type === 'debit' ? '-' : '+'}$${(tx.amount_cents / 100).toFixed(2)}`,
      description: tx.description,
      createdAt: tx.created_at,
    })));
  } catch (err: any) {
    console.error('Get transactions error:', err.message);
    return res.status(500).json({ error: 'Failed to load transactions' });
  }
});
