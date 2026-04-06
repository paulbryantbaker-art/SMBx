import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

/* ── constants ── */
const TERRA = '#D44A78';
const FONT_FAMILY = 'Inter, sans-serif';
const GRID_COLOR = 'rgba(0,0,0,0.04)';
const TICK_COLOR = '#5d5e61';

/* ── types ── */
interface PageView {
  path: string;
  views: number;
  unique_visitors: number;
}

interface Totals {
  total_views: number;
  total_unique: number;
}

interface Geo {
  city: string;
  region: string;
  country_code: string;
}

interface Visitor {
  session_id: string;
  user_id: string | null;
  first_seen: string;
  last_seen: string;
  page_count: number;
  pages_viewed: string[];
  referrer: string | null;
  ip_address: string;
  geo: Geo | null;
}

/* ── helpers ── */
function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function parseReferrerDomain(referrer: string | null): string {
  if (!referrer) return 'direct';
  try {
    return new URL(referrer).hostname;
  } catch {
    return 'direct';
  }
}

type Days = 7 | 14 | 30;

/* ── component ── */
export default function AdminTraffic() {
  const [days, setDays] = useState<Days>(7);
  const [views, setViews] = useState<PageView[]>([]);
  const [totals, setTotals] = useState<Totals>({ total_views: 0, total_unique: 0 });
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisitors = useCallback(async () => {
    try {
      const headers = authHeaders();
      const res = await fetch('/api/admin/visitors/recent?limit=50', { headers });
      const data = await res.json();
      setVisitors(data.visitors ?? []);
    } catch (err) {
      console.error('AdminTraffic visitors fetch error:', err);
    }
  }, []);

  const fetchPageViews = useCallback(async (d: Days) => {
    try {
      const headers = authHeaders();
      const res = await fetch(`/api/admin/page-views?days=${d}`, { headers });
      const data = await res.json();
      setViews(data.views ?? []);
      setTotals(data.totals ?? { total_views: 0, total_unique: 0 });
    } catch (err) {
      console.error('AdminTraffic page-views fetch error:', err);
    }
  }, []);

  /* initial parallel fetch */
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPageViews(days), fetchVisitors()]).finally(() =>
      setLoading(false),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* refetch page views when days change (skip initial) */
  useEffect(() => {
    fetchPageViews(days);
  }, [days, fetchPageViews]);

  /* ── derived data: top locations ── */
  const locationCounts = (() => {
    const map = new Map<string, number>();
    for (const v of visitors) {
      if (!v.geo?.city) continue;
      const key = `${v.geo.city}, ${v.geo.region}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  })();

  /* ── derived data: referrer breakdown ── */
  const referrerCounts = (() => {
    const map = new Map<string, number>();
    for (const v of visitors) {
      const domain = parseReferrerDomain(v.referrer);
      map.set(domain, (map.get(domain) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  })();

  /* ── bar chart ── */
  const barData = {
    labels: views.map((v) => v.path),
    datasets: [
      {
        data: views.map((v) => v.views),
        backgroundColor: TERRA,
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    indexAxis: 'y' as const,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { color: GRID_COLOR },
        ticks: { color: TICK_COLOR, font: { family: FONT_FAMILY } },
      },
      y: {
        grid: { display: false },
        ticks: { color: TICK_COLOR, font: { family: FONT_FAMILY, size: 11 } },
      },
    },
  };

  /* ── loading skeleton ── */
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Array(2)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-20 bg-[#EEEEF0] rounded-xl" />
            ))}
        </div>
        <div className="h-64 bg-[#EEEEF0] rounded-2xl" />
        <div className="h-64 bg-[#EEEEF0] rounded-2xl" />
      </div>
    );
  }

  /* ── render ── */
  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-4 bg-white border border-[#EEEEF0]">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#5d5e61] mb-1">
            Total Views
          </p>
          <p className="text-2xl font-black text-[#1a1c1e]">
            {totals.total_views.toLocaleString('en-US')}
          </p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-[#EEEEF0]">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#5d5e61] mb-1">
            Unique Visitors
          </p>
          <p className="text-2xl font-black text-[#1a1c1e]">
            {totals.total_unique.toLocaleString('en-US')}
          </p>
        </div>
      </div>

      {/* Page Views Bar Chart */}
      <div className="rounded-2xl bg-white border border-[#EEEEF0] p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            Page Views (last {days} days)
          </h3>
          <div className="flex gap-1">
            {([7, 14, 30] as Days[]).map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-full text-xs font-bold border-none cursor-pointer transition-all ${
                  days === d
                    ? 'bg-[#D44A78] text-white'
                    : 'bg-[#f3f3f6] text-[#5d5e61] hover:bg-[#EEEEF0]'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: Math.max(views.length * 32, 120) }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Two-column: Locations + Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Top Locations */}
        <div className="rounded-2xl bg-white border border-[#EEEEF0] p-6">
          <h3 className="text-lg font-bold mb-4">Top Locations</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#5d5e61] pb-3">
                    Location
                  </th>
                  <th className="text-right text-[10px] uppercase tracking-widest font-bold text-[#5d5e61] pb-3">
                    Visitors
                  </th>
                </tr>
              </thead>
              <tbody>
                {locationCounts.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-sm text-[#5d5e61] py-4 text-center">
                      No geo data available
                    </td>
                  </tr>
                )}
                {locationCounts.map(([loc, count]) => (
                  <tr key={loc} className="border-t border-[#EEEEF0]">
                    <td className="text-sm text-[#1a1c1e] py-2">{loc}</td>
                    <td className="text-sm text-[#1a1c1e] py-2 text-right tabular-nums">
                      {count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Referrer Breakdown */}
        <div className="rounded-2xl bg-white border border-[#EEEEF0] p-6">
          <h3 className="text-lg font-bold mb-4">Referrer Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#5d5e61] pb-3">
                    Source
                  </th>
                  <th className="text-right text-[10px] uppercase tracking-widest font-bold text-[#5d5e61] pb-3">
                    Visits
                  </th>
                </tr>
              </thead>
              <tbody>
                {referrerCounts.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-sm text-[#5d5e61] py-4 text-center">
                      No referrer data
                    </td>
                  </tr>
                )}
                {referrerCounts.map(([source, count]) => (
                  <tr key={source} className="border-t border-[#EEEEF0]">
                    <td className="text-sm text-[#1a1c1e] py-2">{source}</td>
                    <td className="text-sm text-[#1a1c1e] py-2 text-right tabular-nums">
                      {count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Visitors Table */}
      <div className="rounded-2xl bg-white border border-[#EEEEF0] p-6 mt-6">
        <h3 className="text-lg font-bold mb-4">Recent Visitors</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#5d5e61] pb-3">
                  Session
                </th>
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#5d5e61] pb-3">
                  Pages
                </th>
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#5d5e61] pb-3">
                  Location
                </th>
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#5d5e61] pb-3">
                  Time
                </th>
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#5d5e61] pb-3">
                  Referrer
                </th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-sm text-[#5d5e61] py-4 text-center">
                    No visitor data
                  </td>
                </tr>
              )}
              {visitors.map((v) => {
                const pagesShown = v.pages_viewed.slice(0, 3);
                const remaining = v.pages_viewed.length - 3;
                return (
                  <tr key={v.session_id} className="border-t border-[#EEEEF0]">
                    <td className="text-sm text-[#1a1c1e] py-2 font-mono">
                      {v.session_id.slice(0, 8)}
                    </td>
                    <td className="text-sm text-[#1a1c1e] py-2 max-w-[200px]">
                      <span className="truncate block">
                        {pagesShown.join(', ')}
                        {remaining > 0 && (
                          <span className="text-[#5d5e61]"> +{remaining} more</span>
                        )}
                      </span>
                    </td>
                    <td className="text-sm text-[#1a1c1e] py-2 whitespace-nowrap">
                      {v.geo?.city
                        ? `${v.geo.city}, ${v.geo.region}`
                        : '\u2014'}
                    </td>
                    <td className="text-sm text-[#5d5e61] py-2 whitespace-nowrap">
                      {timeAgo(v.last_seen)}
                    </td>
                    <td className="text-sm text-[#1a1c1e] py-2">
                      {parseReferrerDomain(v.referrer)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
