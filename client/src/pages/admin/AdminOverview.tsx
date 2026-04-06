import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

/* ── color constants ── */
const TERRA = '#D44A78';
const GREEN = '#34A853';
const BLUE = '#4E8FD4';
const YELLOW = '#FBBC04';

const JOURNEY_COLORS: Record<string, string> = {
  sell: TERRA,
  buy: BLUE,
  raise: '#6B8F4E',
  pmi: '#8F6BD4',
};

const PLAN_COLORS: Record<string, string> = {
  free: '#5d5e61',
  starter: YELLOW,
  professional: TERRA,
  enterprise: '#1a1c1e',
};

/* ── shared chart options ── */
const FONT_FAMILY = 'Inter, sans-serif';
const GRID_COLOR = 'rgba(0,0,0,0.04)';
const TICK_COLOR = '#5d5e61';

/* ── types ── */
interface Overview {
  totalUsers: number;
  activeUsers7d: number;
  totalDeals: number;
  mrrCents: number;
  deliverables30d: number;
  errors24h: number;
}

interface FunnelStage {
  stage: string;
  count: number;
}

interface DailyMetric {
  date: string;
  new_users: number;
  active_users: number;
  messages_sent: number;
  deliverables_generated: number;
  mrr_cents: number;
  errors: number;
}

interface RevenuePlan {
  plan: string;
  count: number;
  status: string;
}

interface JourneyEntry {
  journey_type: string;
  count: number;
  avg_gate: number;
}

/* ── helpers ── */
function formatMrr(cents: number): string {
  return '$' + Math.round(cents / 100).toLocaleString('en-US');
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* ── component ── */
export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [daily, setDaily] = useState<DailyMetric[]>([]);
  const [revenue, setRevenue] = useState<RevenuePlan[]>([]);
  const [journeys, setJourneys] = useState<JourneyEntry[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = authHeaders();
      const [ovRes, fnRes, dlRes, rvRes, jrRes] = await Promise.all([
        fetch('/api/admin/metrics/overview', { headers }),
        fetch('/api/admin/metrics/funnel', { headers }),
        fetch('/api/admin/metrics/daily?days=30', { headers }),
        fetch('/api/admin/metrics/revenue', { headers }),
        fetch('/api/admin/metrics/journeys', { headers }),
      ]);

      const [ovData, fnData, dlData, rvData, jrData] = await Promise.all([
        ovRes.json(),
        fnRes.json(),
        dlRes.json(),
        rvRes.json(),
        jrRes.json(),
      ]);

      setOverview(ovData);
      setFunnel(fnData.funnel ?? []);
      setDaily(dlData.metrics ?? []);
      setRevenue(rvData.breakdown ?? []);
      setJourneys(jrData.journeys ?? []);
    } catch (err) {
      console.error('AdminOverview fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── loading skeleton ── */
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-6 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-20 bg-[#EEEEF0] rounded-xl" />
            ))}
        </div>
        <div className="h-64 bg-[#EEEEF0] rounded-2xl" />
      </div>
    );
  }

  /* ── KPI cards data ── */
  const kpis = [
    { label: 'Total Users', value: overview?.totalUsers ?? 0 },
    { label: 'Active (7d)', value: overview?.activeUsers7d ?? 0 },
    { label: 'Active Deals', value: overview?.totalDeals ?? 0 },
    { label: 'MRR', value: formatMrr(overview?.mrrCents ?? 0) },
    { label: 'Deliverables (30d)', value: overview?.deliverables30d ?? 0 },
    {
      label: 'Errors (24h)',
      value: overview?.errors24h ?? 0,
      red: (overview?.errors24h ?? 0) > 0,
    },
  ];

  /* ── Conversion Funnel (horizontal bar) ── */
  const funnelData = {
    labels: funnel.map((f) => f.stage),
    datasets: [
      {
        data: funnel.map((f) => f.count),
        backgroundColor: TERRA,
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const funnelOptions = {
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
        ticks: { color: TICK_COLOR, font: { family: FONT_FAMILY } },
      },
    },
  };

  /* ── Revenue Breakdown (doughnut) ── */
  const activePlans = revenue.filter(
    (r) => r.status === 'active' || r.status === 'trialing',
  );
  const planMap = new Map<string, number>();
  for (const r of activePlans) {
    const key = r.plan.toLowerCase();
    planMap.set(key, (planMap.get(key) ?? 0) + r.count);
  }
  const planLabels = Array.from(planMap.keys());
  const planValues = Array.from(planMap.values());
  const planColors = planLabels.map(
    (p) => PLAN_COLORS[p] ?? '#999',
  );

  const doughnutData = {
    labels: planLabels.map((l) => l.charAt(0).toUpperCase() + l.slice(1)),
    datasets: [
      {
        data: planValues,
        backgroundColor: planColors,
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: TICK_COLOR, font: { family: FONT_FAMILY } },
      },
    },
  };

  /* ── Daily Trend (line) ── */
  const dateLabels = daily.map((d) => formatDateLabel(d.date));

  const lineData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'New Users',
        data: daily.map((d) => d.new_users),
        borderColor: GREEN,
        backgroundColor: `${GREEN}1A`,
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: 'Messages',
        data: daily.map((d) => d.messages_sent),
        borderColor: TERRA,
        backgroundColor: `${TERRA}1A`,
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: 'Deliverables',
        data: daily.map((d) => d.deliverables_generated),
        borderColor: BLUE,
        backgroundColor: `${BLUE}1A`,
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const lineOptions = {
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: TICK_COLOR, font: { family: FONT_FAMILY } },
      },
    },
    scales: {
      x: {
        grid: { color: GRID_COLOR },
        ticks: { color: TICK_COLOR, font: { family: FONT_FAMILY }, maxTicksLimit: 10 },
      },
      y: {
        grid: { color: GRID_COLOR },
        ticks: { color: TICK_COLOR, font: { family: FONT_FAMILY } },
        beginAtZero: true,
      },
    },
  };

  /* ── Journey Distribution (vertical bar) ── */
  const journeyLabels = journeys.map(
    (j) => j.journey_type.charAt(0).toUpperCase() + j.journey_type.slice(1),
  );
  const journeyColors = journeys.map(
    (j) => JOURNEY_COLORS[j.journey_type.toLowerCase()] ?? '#999',
  );

  const journeyData = {
    labels: journeyLabels,
    datasets: [
      {
        label: 'Journeys',
        data: journeys.map((j) => j.count),
        backgroundColor: journeyColors,
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const journeyOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: TICK_COLOR, font: { family: FONT_FAMILY } },
      },
      y: {
        grid: { color: GRID_COLOR },
        ticks: { color: TICK_COLOR, font: { family: FONT_FAMILY } },
        beginAtZero: true,
      },
    },
  };

  /* ── render ── */
  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-4 bg-white border border-[#EEEEF0]"
          >
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#5d5e61] mb-1">
              {kpi.label}
            </p>
            <p
              className={`text-2xl font-black ${
                'red' in kpi && kpi.red
                  ? 'text-red-600'
                  : 'text-[#1a1c1e]'
              }`}
            >
              {typeof kpi.value === 'number'
                ? kpi.value.toLocaleString('en-US')
                : kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Funnel + Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Conversion Funnel */}
        <div className="rounded-2xl bg-white border border-[#EEEEF0] p-6">
          <h3 className="text-lg font-bold mb-4">Conversion Funnel</h3>
          <div className="h-64">
            <Bar data={funnelData} options={funnelOptions} />
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="rounded-2xl bg-white border border-[#EEEEF0] p-6">
          <h3 className="text-lg font-bold mb-4">Revenue Breakdown</h3>
          <div className="h-64">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="rounded-2xl bg-white border border-[#EEEEF0] p-6 mt-6">
        <h3 className="text-lg font-bold mb-4">Daily Trend (30d)</h3>
        <div className="h-72">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Journey Distribution */}
      <div className="rounded-2xl bg-white border border-[#EEEEF0] p-6 mt-6">
        <h3 className="text-lg font-bold mb-4">Journey Distribution</h3>
        <div className="h-64">
          <Bar data={journeyData} options={journeyOptions} />
        </div>
      </div>
    </div>
  );
}
