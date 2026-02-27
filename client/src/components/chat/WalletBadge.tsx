import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface WalletInfo {
  balance: number;
  balanceDisplay: string;
}

export default function WalletBadge() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'topup' | 'history'>('topup');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await fetch('/api/stripe/wallet', { headers: authHeaders() });
      if (res.ok) setWallet(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  // Refresh wallet on URL param (returning from Stripe checkout)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('wallet') === 'success') {
      fetchWallet();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchWallet]);

  const loadTransactions = async () => {
    if (transactions.length > 0) return;
    setTxLoading(true);
    try {
      const res = await fetch('/api/stripe/transactions', { headers: authHeaders() });
      if (res.ok) setTransactions(await res.json());
    } catch { /* ignore */ }
    setTxLoading(false);
  };

  const loadBlocks = async () => {
    if (blocks.length > 0) return;
    try {
      const res = await fetch('/api/stripe/blocks');
      if (res.ok) setBlocks(await res.json());
    } catch { /* ignore */ }
  };

  const handleTopUp = async (blockId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ blockId }),
      });
      if (res.ok) {
        const { url } = await res.json();
        if (url) window.location.href = url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) return null;

  return (
    <div className="relative">
      <button
        data-wallet-toggle
        onClick={() => { setShowTopUp(!showTopUp); loadBlocks(); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream text-sm font-medium text-text-primary hover:bg-cream-dark transition-colors cursor-pointer border-0"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M2 10h20" />
        </svg>
        {wallet.balanceDisplay}
      </button>

      {showTopUp && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowTopUp(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-border z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-text-primary m-0">Wallet Balance</p>
              <p className="text-2xl font-bold text-terra m-0 mt-1">{wallet.balanceDisplay}</p>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setTab('topup')}
                className={`flex-1 py-2 text-xs font-semibold border-0 cursor-pointer transition-colors ${
                  tab === 'topup' ? 'text-[#D4714E] bg-[rgba(212,113,78,.05)] border-b-2 border-[#D4714E]' : 'text-[#6E6A63] bg-transparent hover:text-[#3D3B37]'
                }`}
                style={tab === 'topup' ? { borderBottom: '2px solid #D4714E' } : undefined}
              >
                Add Funds
              </button>
              <button
                onClick={() => { setTab('history'); loadTransactions(); }}
                className={`flex-1 py-2 text-xs font-semibold border-0 cursor-pointer transition-colors ${
                  tab === 'history' ? 'text-[#D4714E] bg-[rgba(212,113,78,.05)]' : 'text-[#6E6A63] bg-transparent hover:text-[#3D3B37]'
                }`}
                style={tab === 'history' ? { borderBottom: '2px solid #D4714E' } : undefined}
              >
                History
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {tab === 'topup' ? (
                <div className="p-2">
                  {blocks.slice(0, 6).map((block: any) => (
                    <button
                      key={block.id}
                      onClick={() => handleTopUp(block.id)}
                      disabled={loading}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-cream transition-colors flex justify-between items-center cursor-pointer border-0 bg-transparent disabled:opacity-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary m-0">{block.name}</p>
                        {block.bonus && (
                          <p className="text-xs text-green-600 m-0">+{block.bonus} bonus ({block.discount})</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-text-primary">{block.price}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-[#EBE7DF]">
                  {txLoading && <div className="p-4 text-sm text-[#A9A49C]">Loading...</div>}
                  {!txLoading && transactions.length === 0 && <div className="p-4 text-sm text-[#A9A49C]">No transactions yet</div>}
                  {transactions.map((tx: any) => (
                    <div key={tx.id} className="px-4 py-2.5 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#1A1A18] m-0 truncate">{tx.description}</p>
                        <p className="text-[11px] text-[#A9A49C] m-0 mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-[13px] font-semibold shrink-0 ml-3 ${
                        tx.type === 'credit' ? 'text-green-600' : tx.type === 'refund' ? 'text-blue-600' : 'text-[#3D3B37]'
                      }`}>
                        {tx.type === 'credit' ? '+' : tx.type === 'refund' ? '+' : '-'}${(tx.amount_cents / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
