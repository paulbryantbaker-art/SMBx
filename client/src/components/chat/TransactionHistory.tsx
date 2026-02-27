import { useState, useEffect } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface Transaction {
  id: number;
  type: 'credit' | 'debit' | 'refund';
  amount_cents: number;
  description: string;
  created_at: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/stripe/transactions', { headers: authHeaders() });
        if (res.ok) setTransactions(await res.json());
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-4 text-sm text-[#A9A49C]">Loading...</div>;
  if (transactions.length === 0) return <div className="p-4 text-sm text-[#A9A49C]">No transactions yet</div>;

  return (
    <div className="divide-y divide-[#EBE7DF]">
      {transactions.map(tx => (
        <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1A1A18] m-0 truncate">{tx.description}</p>
            <p className="text-xs text-[#A9A49C] m-0 mt-0.5">
              {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <span className={`text-sm font-semibold shrink-0 ml-3 ${
            tx.type === 'credit' ? 'text-green-600' : tx.type === 'refund' ? 'text-blue-600' : 'text-[#3D3B37]'
          }`}>
            {tx.type === 'credit' ? '+' : tx.type === 'refund' ? '+' : '-'}${(tx.amount_cents / 100).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
