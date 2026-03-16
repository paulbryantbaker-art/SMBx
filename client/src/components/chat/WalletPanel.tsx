/**
 * WalletPanel — Wallet balance, top-up blocks, and transaction history.
 */
import { useState, useEffect, useCallback } from 'react';

interface WalletBlock {
  id: string;
  name: string;
  price_cents: number;
  credits_cents: number;
  bonus_percent: number;
}

interface Transaction {
  id: number;
  type: string;
  amount_cents: number;
  description: string;
  created_at: string;
}

function authHeaders() {
  const token = localStorage.getItem('smbx_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function WalletPanel() {
  const [balance, setBalance] = useState<number>(0);
  const [totalDeposited, setTotalDeposited] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [blocks, setBlocks] = useState<WalletBlock[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [walletRes, blocksRes, txRes] = await Promise.all([
        fetch('/api/stripe/wallet', { headers: authHeaders() }),
        fetch('/api/stripe/blocks'),
        fetch('/api/stripe/transactions', { headers: authHeaders() }),
      ]);

      if (walletRes.ok) {
        const w = await walletRes.json();
        setBalance(w.balance_cents || 0);
        setTotalDeposited(w.total_deposited_cents || 0);
        setTotalSpent(w.total_spent_cents || 0);
      }
      if (blocksRes.ok) setBlocks(await blocksRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleTopUp = async (blockId: string) => {
    setPurchasing(blockId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ blockId }),
      });
      const data = await res.json();

      if (data.url) {
        // Stripe checkout redirect
        window.location.href = data.url;
      } else if (data.balance_cents !== undefined) {
        // TEST_MODE: credited directly
        setBalance(data.balance_cents);
        loadData();
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setPurchasing(null);
    }
  };

  const fmt = (cents: number) => {
    const dollars = cents / 100;
    return dollars >= 1000 ? `$${(dollars / 1000).toFixed(1)}k` : `$${dollars.toFixed(2)}`;
  };

  const fmtFull = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-[#C96B4F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Balance card */}
      <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <p className="text-xs font-medium uppercase tracking-wider text-[#6E6A63] mb-1">Wallet Balance</p>
        <p className="text-4xl font-semibold text-[#0D0D0D] tracking-tight">{fmtFull(balance)}</p>
        <div className="flex gap-6 mt-4 pt-4 border-t border-[rgba(0,0,0,0.06)]">
          <div>
            <p className="text-xs text-[#9CA3AF]">Total Deposited</p>
            <p className="text-sm font-medium text-[#3D3B37]">{fmtFull(totalDeposited)}</p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF]">Total Spent</p>
            <p className="text-sm font-medium text-[#3D3B37]">{fmtFull(totalSpent)}</p>
          </div>
        </div>
      </div>

      {/* Top-up blocks */}
      <div>
        <h3 className="text-sm font-semibold text-[#0D0D0D] mb-3">Add Funds</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {blocks.map((block) => {
            const bonus = block.credits_cents - block.price_cents;
            const isPopular = block.id === 'momentum' || block.name === 'Active Deal';
            return (
              <button
                key={block.id || block.name}
                onClick={() => handleTopUp(block.id || block.name.toLowerCase().replace(/\s+/g, '-'))}
                disabled={purchasing !== null}
                className={`relative flex flex-col items-start p-4 rounded-xl border transition-all hover-lift ${
                  isPopular
                    ? 'border-[#C96B4F] bg-[#FFF8F5]'
                    : 'border-[rgba(0,0,0,0.06)] bg-white hover:border-[rgba(0,0,0,0.12)]'
                }`}
                style={{ boxShadow: isPopular ? '0 2px 8px rgba(201,107,79,0.1)' : 'var(--shadow-sm)' }}
              >
                {isPopular && (
                  <span className="absolute -top-2 right-3 text-[10px] font-semibold bg-[#C96B4F] text-white px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                <span className="text-xs text-[#9CA3AF] font-medium">{block.name}</span>
                <span className="text-xl font-semibold text-[#0D0D0D] mt-1">{fmt(block.price_cents)}</span>
                {bonus > 0 && (
                  <span className="text-xs text-[#C96B4F] font-medium mt-1">
                    +{fmt(bonus)} bonus
                  </span>
                )}
                {purchasing === (block.id || block.name.toLowerCase().replace(/\s+/g, '-')) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                    <div className="w-4 h-4 border-2 border-[#C96B4F] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h3 className="text-sm font-semibold text-[#0D0D0D] mb-3">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-[#9CA3AF] py-4">No transactions yet.</p>
        ) : (
          <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.06)] divide-y divide-[rgba(0,0,0,0.04)]">
            {transactions.slice(0, 20).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-[#0D0D0D]">{tx.description || tx.type}</p>
                  <p className="text-xs text-[#9CA3AF]">
                    {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-sm font-medium ${tx.type === 'credit' ? 'text-emerald-600' : 'text-[#0D0D0D]'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{fmtFull(Math.abs(tx.amount_cents))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
