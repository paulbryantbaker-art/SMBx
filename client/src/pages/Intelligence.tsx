import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { authHeaders, type User } from '../hooks/useAuth';

interface IntelligenceProps {
  user: User;
  onLogout: () => void;
}

interface MarketOverview {
  naicsCode: string;
  geography: string;
  cbpData: any;
  fredData: any;
  sbaAnalysis: any;
  generatedAt: string;
}

interface IntelReport {
  id: number;
  title: string;
  report_type: string;
  naics_code: string | null;
  geography: string | null;
  status: string;
  created_at: string;
}

interface FredIndicator {
  series_id: string;
  name: string;
  value: number | null;
  date: string | null;
  units: string;
}

export default function Intelligence({ user, onLogout }: IntelligenceProps) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<'overview' | 'reports' | 'sba'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Overview state
  const [naicsCode, setNaicsCode] = useState('');
  const [geography, setGeography] = useState('');
  const [overview, setOverview] = useState<MarketOverview | null>(null);

  // Reports state
  const [reports, setReports] = useState<IntelReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  // SBA state
  const [sbaInputs, setSbaInputs] = useState({ purchasePrice: '', annualDebtService: '', ebitda: '' });
  const [sbaResult, setSbaResult] = useState<any>(null);

  // FRED indicators
  const [fredData, setFredData] = useState<FredIndicator[]>([]);
  const [fredLoading, setFredLoading] = useState(true);

  // Load FRED indicators on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/intelligence/fred', { headers: authHeaders() });
        if (res.ok) setFredData(await res.json());
      } catch { /* ignore */ }
      finally { setFredLoading(false); }
    })();
  }, []);

  // Load reports
  const loadReports = useCallback(async () => {
    try {
      const res = await fetch('/api/intelligence/reports', { headers: authHeaders() });
      if (res.ok) setReports(await res.json());
    } catch { /* ignore */ }
    finally { setReportsLoading(false); }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  // Fetch market overview
  const fetchOverview = async () => {
    if (!naicsCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ naicsCode: naicsCode.trim() });
      if (geography.trim()) params.set('geography', geography.trim());
      const res = await fetch(`/api/intelligence/market-overview?${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch market data');
      setOverview(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run SBA analysis
  const runSbaAnalysis = async () => {
    const pp = parseFloat(sbaInputs.purchasePrice);
    const ads = parseFloat(sbaInputs.annualDebtService);
    const eb = parseFloat(sbaInputs.ebitda);
    if (!pp || !ads || !eb) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/intelligence/sba-analysis?purchasePrice=${pp}&annualDebtService=${ads}&ebitda=${eb}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to run SBA analysis');
      setSbaResult(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: 'overview' as const, label: 'Market Overview' },
    { id: 'reports' as const, label: 'Reports' },
    { id: 'sba' as const, label: 'SBA Calculator' },
  ];

  return (
    <div className="min-h-dvh bg-[#FAF8F4]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#FAF8F4]" style={{ borderBottom: '1px solid #DDD9D1' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-1.5 text-sm text-[#6E6A63] bg-transparent border-0 cursor-pointer hover:text-[#D4714E] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Chat
          </button>
          <div className="text-[22px] font-extrabold tracking-[-0.03em] text-[#1A1A18]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            smb<span className="text-[#D4714E]">x</span>.ai
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#6E6A63]">{user.display_name || user.email}</span>
          <button onClick={onLogout} className="text-sm text-[#A9A49C] bg-transparent border-0 cursor-pointer hover:text-[#D4714E] transition-colors">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#1A1A18] m-0" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            Market Intelligence
          </h1>
          <p className="text-sm text-[#6E6A63] m-0 mt-1">Government data + AI synthesis</p>
        </div>

        {/* FRED Economic Indicators */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#6E6A63] uppercase tracking-wide m-0 mb-3">Economic Indicators</h2>
          {fredLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-xl p-4 border border-border">
                  <div className="h-3 bg-[#EBE7DF] rounded w-2/3 mb-2" />
                  <div className="h-6 bg-[#EBE7DF] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {fredData.slice(0, 8).map(ind => (
                <div key={ind.series_id} className="bg-white rounded-xl p-4 border border-border">
                  <p className="text-[11px] text-[#A9A49C] m-0 mb-1 truncate">{ind.name}</p>
                  <p className="text-lg font-bold text-[#1A1A18] m-0">
                    {ind.value !== null ? `${ind.value}${ind.units === 'percent' ? '%' : ''}` : '—'}
                  </p>
                  {ind.date && <p className="text-[10px] text-[#A9A49C] m-0 mt-1">{ind.date}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#EBE7DF] rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-0 cursor-pointer transition-colors ${
                tab === t.id ? 'bg-white text-[#1A1A18] shadow-sm' : 'bg-transparent text-[#6E6A63] hover:text-[#1A1A18]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-500 bg-transparent border-0 cursor-pointer underline">Dismiss</button>
          </div>
        )}

        {/* Market Overview Tab */}
        {tab === 'overview' && (
          <div>
            <div className="bg-white rounded-2xl border border-border p-5 mb-6">
              <h3 className="text-base font-semibold text-[#1A1A18] m-0 mb-4">Look Up a Market</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[#6E6A63] mb-1">NAICS Code</label>
                  <input
                    type="text"
                    value={naicsCode}
                    onChange={e => setNaicsCode(e.target.value)}
                    placeholder="e.g. 561710 (Pest Control)"
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-[#FAF8F4] text-[#1A1A18] outline-none focus:border-[#D4714E]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[#6E6A63] mb-1">Geography (optional)</label>
                  <input
                    type="text"
                    value={geography}
                    onChange={e => setGeography(e.target.value)}
                    placeholder="e.g. Texas, Dallas County"
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-[#FAF8F4] text-[#1A1A18] outline-none focus:border-[#D4714E]"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchOverview}
                    disabled={loading || !naicsCode.trim()}
                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {loading ? 'Loading...' : 'Analyze'}
                  </button>
                </div>
              </div>
            </div>

            {overview && (
              <div className="space-y-4">
                {overview.cbpData && (
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <h3 className="text-sm font-semibold text-[#1A1A18] m-0 mb-3">Census Business Patterns</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {overview.cbpData.totalEstablishments !== undefined && (
                        <div>
                          <p className="text-[11px] text-[#A9A49C] m-0 mb-0.5">Total Establishments</p>
                          <p className="text-lg font-bold text-[#1A1A18] m-0">{Number(overview.cbpData.totalEstablishments).toLocaleString()}</p>
                        </div>
                      )}
                      {overview.cbpData.totalEmployment !== undefined && (
                        <div>
                          <p className="text-[11px] text-[#A9A49C] m-0 mb-0.5">Total Employment</p>
                          <p className="text-lg font-bold text-[#1A1A18] m-0">{Number(overview.cbpData.totalEmployment).toLocaleString()}</p>
                        </div>
                      )}
                      {overview.cbpData.totalPayroll !== undefined && (
                        <div>
                          <p className="text-[11px] text-[#A9A49C] m-0 mb-0.5">Total Annual Payroll</p>
                          <p className="text-lg font-bold text-[#1A1A18] m-0">${Number(overview.cbpData.totalPayroll).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    {overview.cbpData.sizeBreakdown && Array.isArray(overview.cbpData.sizeBreakdown) && (
                      <div className="mt-4">
                        <p className="text-[11px] text-[#A9A49C] m-0 mb-2">Establishment Size Breakdown</p>
                        <div className="space-y-1.5">
                          {overview.cbpData.sizeBreakdown.map((sz: any, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-xs text-[#6E6A63] w-32 shrink-0">{sz.label}</span>
                              <div className="flex-1 h-2 bg-[#F3F0EA] rounded-full overflow-hidden">
                                <div className="h-full bg-[#D4714E] rounded-full" style={{ width: `${sz.pct || 0}%` }} />
                              </div>
                              <span className="text-xs text-[#6E6A63] w-16 text-right">{sz.count?.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {overview.sbaAnalysis && (
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <h3 className="text-sm font-semibold text-[#1A1A18] m-0 mb-3">SBA Bankability</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] text-[#A9A49C] m-0 mb-0.5">DSCR</p>
                        <p className={`text-lg font-bold m-0 ${(overview.sbaAnalysis.dscr || 0) >= 1.25 ? 'text-green-600' : 'text-red-600'}`}>
                          {overview.sbaAnalysis.dscr?.toFixed(2) || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#A9A49C] m-0 mb-0.5">SBA Eligible</p>
                        <p className={`text-lg font-bold m-0 ${overview.sbaAnalysis.eligible ? 'text-green-600' : 'text-red-600'}`}>
                          {overview.sbaAnalysis.eligible ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!overview && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3F0EA] flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A9A49C" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-[#1A1A18] m-0 mb-1">Enter a NAICS code to explore</p>
                <p className="text-sm text-[#6E6A63] m-0">Get Census business patterns, SBA bankability, and economic indicators for any industry.</p>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {tab === 'reports' && (
          <div>
            {reportsLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl p-5 border border-border">
                    <div className="h-4 bg-[#EBE7DF] rounded w-1/3 mb-2" />
                    <div className="h-3 bg-[#F3F0EA] rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3F0EA] flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A9A49C" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-[#1A1A18] m-0 mb-1">No reports yet</p>
                <p className="text-sm text-[#6E6A63] m-0">Generate a market overview to create your first intelligence report.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-border p-5 hover:border-[#D4714E] transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {r.report_type}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        r.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[#1A1A18] m-0">{r.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-[12px] text-[#6E6A63]">
                      {r.naics_code && <span>NAICS: {r.naics_code}</span>}
                      {r.geography && <span>{r.geography}</span>}
                      <span className="ml-auto text-[#A9A49C]">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SBA Calculator Tab */}
        {tab === 'sba' && (
          <div>
            <div className="bg-white rounded-2xl border border-border p-5 mb-6">
              <h3 className="text-base font-semibold text-[#1A1A18] m-0 mb-4">SBA Loan Calculator</h3>
              <p className="text-sm text-[#6E6A63] m-0 mb-4">Check if a deal qualifies for SBA 7(a) financing. Uses live FRED prime rate data.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-[#6E6A63] mb-1">Purchase Price ($)</label>
                  <input
                    type="number"
                    value={sbaInputs.purchasePrice}
                    onChange={e => setSbaInputs(p => ({ ...p, purchasePrice: e.target.value }))}
                    placeholder="1,000,000"
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-[#FAF8F4] text-[#1A1A18] outline-none focus:border-[#D4714E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6E6A63] mb-1">Annual Debt Service ($)</label>
                  <input
                    type="number"
                    value={sbaInputs.annualDebtService}
                    onChange={e => setSbaInputs(p => ({ ...p, annualDebtService: e.target.value }))}
                    placeholder="120,000"
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-[#FAF8F4] text-[#1A1A18] outline-none focus:border-[#D4714E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6E6A63] mb-1">EBITDA ($)</label>
                  <input
                    type="number"
                    value={sbaInputs.ebitda}
                    onChange={e => setSbaInputs(p => ({ ...p, ebitda: e.target.value }))}
                    placeholder="250,000"
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-[#FAF8F4] text-[#1A1A18] outline-none focus:border-[#D4714E]"
                  />
                </div>
              </div>
              <button
                onClick={runSbaAnalysis}
                disabled={loading || !sbaInputs.purchasePrice || !sbaInputs.annualDebtService || !sbaInputs.ebitda}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Calculating...' : 'Check Eligibility'}
              </button>
            </div>

            {sbaResult && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h3 className="text-sm font-semibold text-[#1A1A18] m-0 mb-4">SBA Analysis Results</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-[11px] text-[#A9A49C] m-0 mb-0.5">DSCR</p>
                    <p className={`text-xl font-bold m-0 ${(sbaResult.dscr || 0) >= 1.25 ? 'text-green-600' : 'text-red-600'}`}>
                      {sbaResult.dscr?.toFixed(2) || '—'}
                    </p>
                    <p className="text-[10px] text-[#A9A49C] m-0">Min: 1.25</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#A9A49C] m-0 mb-0.5">SBA Eligible</p>
                    <p className={`text-xl font-bold m-0 ${sbaResult.eligible ? 'text-green-600' : 'text-red-600'}`}>
                      {sbaResult.eligible ? 'Yes' : 'No'}
                    </p>
                  </div>
                  {sbaResult.primeRate !== undefined && (
                    <div>
                      <p className="text-[11px] text-[#A9A49C] m-0 mb-0.5">Prime Rate</p>
                      <p className="text-xl font-bold text-[#1A1A18] m-0">{sbaResult.primeRate}%</p>
                      <p className="text-[10px] text-[#A9A49C] m-0">Live from FRED</p>
                    </div>
                  )}
                  {sbaResult.estimatedRate !== undefined && (
                    <div>
                      <p className="text-[11px] text-[#A9A49C] m-0 mb-0.5">Est. Rate</p>
                      <p className="text-xl font-bold text-[#1A1A18] m-0">{sbaResult.estimatedRate}%</p>
                      <p className="text-[10px] text-[#A9A49C] m-0">Prime + 2.75%</p>
                    </div>
                  )}
                </div>
                {sbaResult.notes && (
                  <p className="text-sm text-[#6E6A63] m-0 p-3 bg-[#FAF8F4] rounded-lg">{sbaResult.notes}</p>
                )}
              </div>
            )}

            {!sbaResult && !loading && (
              <div className="text-center py-8">
                <p className="text-sm text-[#6E6A63] m-0">Enter deal parameters above to check SBA 7(a) loan eligibility.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
