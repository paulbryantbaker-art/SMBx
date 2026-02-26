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

  const fetchWallet = useCallback(async () => {
    try {
      const res = await fetch('/api/stripe/wallet', { headers: authHeaders() });
      if (res.ok) setWallet(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

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
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-border z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-text-primary m-0">Wallet Balance</p>
              <p className="text-2xl font-bold text-terra m-0 mt-1">{wallet.balanceDisplay}</p>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
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
          </div>
        </>
      )}
    </div>
  );
}
