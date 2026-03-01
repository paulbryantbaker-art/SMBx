import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';

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

interface IntelPanelProps {
  isFullscreen?: boolean;
}

export default function IntelPanel({ isFullscreen }: IntelPanelProps) {
  const [tab, setTab] = useState<'overview' | 'reports' | 'sba'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [naicsCode, setNaicsCode] = useState('');
  const [geography, setGeography] = useState('');
  const [overview, setOverview] = useState<MarketOverview | null>(null);

  const [reports, setReports] = useState<IntelReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  const [sbaInputs, setSbaInputs] = useState({ purchasePrice: '', annualDebtService: '', ebitda: '' });
  const [sbaResult, setSbaResult] = useState<any>(null);

  const [fredData, setFredData] = useState<FredIndicator[]>([]);
  const [fredLoading, setFredLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/intelligence/fred', { headers: authHeaders() });
        if (res.ok) setFredData(await res.json());
      } catch { /* ignore */ }
      finally { setFredLoading(false); }
    })();
  }, []);

  const loadReports = useCallback(async () => {
    try {
      const res = await fetch('/api/intelligence/reports', { headers: authHeaders() });
      if (res.ok) setReports(await res.json());
    } catch { /* ignore */ }
    finally { setReportsLoading(false); }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

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
    { id: 'overview' as const, label: 'Market' },
    { id: 'reports' as const, label: 'Reports' },
    { id: 'sba' as const, label: 'SBA' },
  ];

  return (
    <div style={{ padding: isFullscreen ? '24px 40px' : 20 }}>
      <div style={{ maxWidth: isFullscreen ? 900 : undefined, margin: isFullscreen ? '0 auto' : undefined }}>
      {/* FRED Economic Indicators */}
      <div className="mb-6">
        <h2 className="text-[11px] font-bold text-[#6E6A63] uppercase tracking-wide m-0 mb-2">Economic Indicators</h2>
        {fredLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse bg-[#FAF9F7] rounded-xl p-3">
                <div className="h-2.5 bg-[#EBE7DF] rounded w-2/3 mb-1.5" />
                <div className="h-5 bg-[#EBE7DF] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {fredData.slice(0, 6).map(ind => (
              <div key={ind.series_id} className="bg-[#FAF9F7] rounded-xl p-3">
                <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5 truncate">{ind.name}</p>
                <p className="text-base font-bold text-[#1A1A18] m-0">
                  {ind.value !== null ? `${ind.value}${ind.units === 'percent' ? '%' : ''}` : '—'}
                </p>
                {ind.date && <p className="text-[9px] text-[#A9A49C] m-0 mt-0.5">{ind.date}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[#EBE7DF] rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border-0 cursor-pointer transition-colors ${
              tab === t.id ? 'bg-white text-[#1A1A18] shadow-sm' : 'bg-transparent text-[#6E6A63] hover:text-[#1A1A18]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-500 bg-transparent border-0 cursor-pointer underline text-xs">Dismiss</button>
        </div>
      )}

      {/* Market Overview Tab */}
      {tab === 'overview' && (
        <div>
          <div className="bg-[#FAF9F7] rounded-2xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A18] m-0 mb-3">Look Up a Market</h3>
            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">NAICS Code</label>
                <input
                  type="text"
                  value={naicsCode}
                  onChange={e => setNaicsCode(e.target.value)}
                  placeholder="e.g. 561710"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#DDD9D1] text-sm bg-white text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Geography (optional)</label>
                <input
                  type="text"
                  value={geography}
                  onChange={e => setGeography(e.target.value)}
                  placeholder="e.g. Texas"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#DDD9D1] text-sm bg-white text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
              <button
                onClick={fetchOverview}
                disabled={loading || !naicsCode.trim()}
                className="w-full py-1.5 rounded-xl text-sm font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Analyze'}
              </button>
            </div>
          </div>

          {overview && (
            <div className="space-y-3">
              {overview.cbpData && (
                <div className="bg-[#FAF9F7] rounded-2xl p-4">
                  <h3 className="text-xs font-semibold text-[#1A1A18] m-0 mb-2">Census Business Patterns</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {overview.cbpData.totalEstablishments !== undefined && (
                      <div>
                        <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">Establishments</p>
                        <p className="text-base font-bold text-[#1A1A18] m-0">{Number(overview.cbpData.totalEstablishments).toLocaleString()}</p>
                      </div>
                    )}
                    {overview.cbpData.totalEmployment !== undefined && (
                      <div>
                        <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">Employment</p>
                        <p className="text-base font-bold text-[#1A1A18] m-0">{Number(overview.cbpData.totalEmployment).toLocaleString()}</p>
                      </div>
                    )}
                    {overview.cbpData.totalPayroll !== undefined && (
                      <div className="col-span-2">
                        <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">Annual Payroll</p>
                        <p className="text-base font-bold text-[#1A1A18] m-0">${Number(overview.cbpData.totalPayroll).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  {overview.cbpData.sizeBreakdown && Array.isArray(overview.cbpData.sizeBreakdown) && (
                    <div className="mt-3">
                      <p className="text-[10px] text-[#A9A49C] m-0 mb-1.5">Size Breakdown</p>
                      <div className="space-y-1">
                        {overview.cbpData.sizeBreakdown.map((sz: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[10px] text-[#6E6A63] w-28 shrink-0 truncate">{sz.label}</span>
                            <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                              <div className="h-full bg-[#D4714E] rounded-full" style={{ width: `${sz.pct || 0}%` }} />
                            </div>
                            <span className="text-[10px] text-[#6E6A63] w-12 text-right">{sz.count?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {overview.sbaAnalysis && (
                <div className="bg-[#FAF9F7] rounded-2xl p-4">
                  <h3 className="text-xs font-semibold text-[#1A1A18] m-0 mb-2">SBA Bankability</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">DSCR</p>
                      <p className={`text-base font-bold m-0 ${(overview.sbaAnalysis.dscr || 0) >= 1.25 ? 'text-green-600' : 'text-red-600'}`}>
                        {overview.sbaAnalysis.dscr?.toFixed(2) || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">SBA Eligible</p>
                      <p className={`text-base font-bold m-0 ${overview.sbaAnalysis.eligible ? 'text-green-600' : 'text-red-600'}`}>
                        {overview.sbaAnalysis.eligible ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!overview && !loading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F3F0EA] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A9A49C" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-[#1A1A18] m-0 mb-1">Enter a NAICS code</p>
              <p className="text-xs text-[#6E6A63] m-0">Census data, SBA bankability, and economic indicators.</p>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {tab === 'reports' && (
        <div>
          {reportsLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse bg-[#FAF9F7] rounded-2xl p-4">
                  <div className="h-3 bg-[#EBE7DF] rounded w-1/3 mb-1.5" />
                  <div className="h-2.5 bg-[#F3F0EA] rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm font-semibold text-[#1A1A18] m-0 mb-1">No reports yet</p>
              <p className="text-xs text-[#6E6A63] m-0">Generate a market overview to create your first report.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map(r => (
                <div key={r.id} className="bg-[#FAF9F7] rounded-2xl p-4 hover:bg-[#F3F0EA] transition-colors">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {r.report_type}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                      r.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#1A1A18] m-0">{r.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[#6E6A63]">
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
          <div className="bg-[#FAF9F7] rounded-2xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A18] m-0 mb-2">SBA Loan Calculator</h3>
            <p className="text-xs text-[#6E6A63] m-0 mb-3">Check SBA 7(a) eligibility with live FRED prime rate.</p>
            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Purchase Price ($)</label>
                <input
                  type="number"
                  value={sbaInputs.purchasePrice}
                  onChange={e => setSbaInputs(p => ({ ...p, purchasePrice: e.target.value }))}
                  placeholder="1,000,000"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#DDD9D1] text-sm bg-white text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">Annual Debt Service ($)</label>
                <input
                  type="number"
                  value={sbaInputs.annualDebtService}
                  onChange={e => setSbaInputs(p => ({ ...p, annualDebtService: e.target.value }))}
                  placeholder="120,000"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#DDD9D1] text-sm bg-white text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#6E6A63] mb-0.5">EBITDA ($)</label>
                <input
                  type="number"
                  value={sbaInputs.ebitda}
                  onChange={e => setSbaInputs(p => ({ ...p, ebitda: e.target.value }))}
                  placeholder="250,000"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#DDD9D1] text-sm bg-white text-[#1A1A18] outline-none focus:border-[#D4714E]"
                />
              </div>
              <button
                onClick={runSbaAnalysis}
                disabled={loading || !sbaInputs.purchasePrice || !sbaInputs.annualDebtService || !sbaInputs.ebitda}
                className="w-full py-1.5 rounded-xl text-sm font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Calculating...' : 'Check Eligibility'}
              </button>
            </div>
          </div>

          {sbaResult && (
            <div className="bg-[#FAF9F7] rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-[#1A1A18] m-0 mb-3">Results</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">DSCR</p>
                  <p className={`text-lg font-bold m-0 ${(sbaResult.dscr || 0) >= 1.25 ? 'text-green-600' : 'text-red-600'}`}>
                    {sbaResult.dscr?.toFixed(2) || '—'}
                  </p>
                  <p className="text-[9px] text-[#A9A49C] m-0">Min: 1.25</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">SBA Eligible</p>
                  <p className={`text-lg font-bold m-0 ${sbaResult.eligible ? 'text-green-600' : 'text-red-600'}`}>
                    {sbaResult.eligible ? 'Yes' : 'No'}
                  </p>
                </div>
                {sbaResult.primeRate !== undefined && (
                  <div>
                    <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">Prime Rate</p>
                    <p className="text-lg font-bold text-[#1A1A18] m-0">{sbaResult.primeRate}%</p>
                  </div>
                )}
                {sbaResult.estimatedRate !== undefined && (
                  <div>
                    <p className="text-[10px] text-[#A9A49C] m-0 mb-0.5">Est. Rate</p>
                    <p className="text-lg font-bold text-[#1A1A18] m-0">{sbaResult.estimatedRate}%</p>
                  </div>
                )}
              </div>
              {sbaResult.notes && (
                <p className="text-xs text-[#6E6A63] m-0 p-2.5 bg-white rounded-lg">{sbaResult.notes}</p>
              )}
            </div>
          )}

          {!sbaResult && !loading && (
            <div className="text-center py-6">
              <p className="text-xs text-[#6E6A63] m-0">Enter deal parameters to check SBA eligibility.</p>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
