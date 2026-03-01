import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../hooks/useAuth';

interface Listing {
  id: number;
  title: string;
  industry: string;
  location_state: string;
  location_city: string;
  asking_price_cents: number;
  revenue_cents: number;
  sde_cents: number;
  ebitda_cents: number;
  implied_multiple: number;
  deal_quality_score: number;
  sba_eligible: boolean;
  source: string;
  listing_url: string;
  created_at: string;
}

const formatCurrency = (cents: number | null) => {
  if (!cents) return '—';
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sbaOnly, setSbaOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>('date');
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/search/stats', { headers: authHeaders() })
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const doSearch = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (state) params.set('state', state);
    if (priceMin) params.set('priceMin', (parseInt(priceMin) * 100).toString());
    if (priceMax) params.set('priceMax', (parseInt(priceMax) * 100).toString());
    if (sbaOnly) params.set('sbaEligible', 'true');
    if (sortBy) params.set('sortBy', sortBy);

    try {
      const res = await fetch(`/api/search/listings?${params}`, { headers: authHeaders() });
      const data = await res.json();
      setListings(data.listings || []);
      setTotal(data.total || 0);
    } catch {
      setListings([]);
    }
    setLoading(false);
  }, [query, state, priceMin, priceMax, sbaOnly, sortBy]);

  useEffect(() => { doSearch(); }, []);

  return (
    <div className="min-h-dvh bg-[#FAF9F7]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-[#23201A] mb-6">Search Listings</h1>

        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search businesses... (e.g., laundromat, HVAC, SaaS)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            className="flex-1 px-4 py-3 rounded-lg border border-[#E8E4DC] bg-white text-[#23201A] placeholder:text-[#B0AB9F] focus:outline-none focus:ring-2 focus:ring-[#C06B3E]/30"
          />
          <button
            onClick={doSearch}
            disabled={loading}
            className="px-6 py-3 bg-[#C06B3E] text-white rounded-lg hover:bg-[#A5582F] transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-[#23201A] uppercase tracking-wider">Filters</h3>

              <div>
                <label className="block text-xs text-[#7A766E] mb-1">State</label>
                <select value={state} onChange={(e) => setState(e.target.value)} className="w-full px-3 py-2 rounded border border-[#E8E4DC] text-sm bg-white">
                  <option value="">All States</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#7A766E] mb-1">Price Range</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min $" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full px-2 py-2 rounded border border-[#E8E4DC] text-sm" />
                  <input type="number" placeholder="Max $" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full px-2 py-2 rounded border border-[#E8E4DC] text-sm" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-[#23201A]">
                <input type="checkbox" checked={sbaOnly} onChange={(e) => setSbaOnly(e.target.checked)} className="rounded" />
                SBA Eligible Only
              </label>

              <div>
                <label className="block text-xs text-[#7A766E] mb-1">Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 rounded border border-[#E8E4DC] text-sm bg-white">
                  <option value="date">Newest First</option>
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="quality">Quality Score</option>
                </select>
              </div>

              <button onClick={doSearch} className="w-full py-2 bg-[#23201A] text-white rounded-lg text-sm hover:bg-[#3A3630] transition-colors">
                Apply Filters
              </button>
            </div>

            {stats?.listings && (
              <div className="bg-white rounded-xl p-4 shadow-sm mt-4">
                <h3 className="text-xs font-semibold text-[#7A766E] uppercase tracking-wider mb-3">Database</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#7A766E]">Active Listings</span>
                    <span className="text-[#23201A] font-medium">{parseInt(stats.listings.active_listings || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A766E]">Industries</span>
                    <span className="text-[#23201A] font-medium">{stats.listings.industries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A766E]">States</span>
                    <span className="text-[#23201A] font-medium">{stats.listings.states}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#7A766E]">{total.toLocaleString()} listing{total !== 1 ? 's' : ''} found</p>
            </div>

            {listings.length === 0 && !loading && (
              <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                <p className="text-[#7A766E]">No listings found. Try adjusting your filters.</p>
              </div>
            )}

            <div className="space-y-3">
              {listings.map((l) => (
                <div key={l.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-[#23201A]">{l.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-[#7A766E]">
                        {l.industry && <span>{l.industry}</span>}
                        {l.location_city && l.location_state && <span>{l.location_city}, {l.location_state}</span>}
                        {!l.location_city && l.location_state && <span>{l.location_state}</span>}
                        <span className="text-xs bg-[#F0EDE7] px-2 py-0.5 rounded">{l.source}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#C06B3E]">{formatCurrency(l.asking_price_cents)}</p>
                      {l.implied_multiple && <p className="text-xs text-[#7A766E]">{l.implied_multiple}x multiple</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F0EDE7] text-sm">
                    <div>
                      <span className="text-[#7A766E]">Revenue: </span>
                      <span className="text-[#23201A] font-medium">{formatCurrency(l.revenue_cents)}</span>
                    </div>
                    {l.sde_cents > 0 && (
                      <div>
                        <span className="text-[#7A766E]">SDE: </span>
                        <span className="text-[#23201A] font-medium">{formatCurrency(l.sde_cents)}</span>
                      </div>
                    )}
                    {l.ebitda_cents > 0 && (
                      <div>
                        <span className="text-[#7A766E]">EBITDA: </span>
                        <span className="text-[#23201A] font-medium">{formatCurrency(l.ebitda_cents)}</span>
                      </div>
                    )}
                    {l.deal_quality_score && (
                      <div className="ml-auto">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${l.deal_quality_score >= 70 ? 'bg-green-100 text-green-800' : l.deal_quality_score >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          Quality: {l.deal_quality_score}/100
                        </span>
                      </div>
                    )}
                    {l.sba_eligible && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">SBA Eligible</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
