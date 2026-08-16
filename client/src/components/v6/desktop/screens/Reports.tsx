/**
 * REPORTS — the four fixed reads (CRM_WORKFLOW_SPEC.md build item 6).
 *
 * FOUR OPINIONATED REPORTS BEAT AN EMPTY TOOLBOX. There is no report builder
 * here and none is coming: each section answers one standing question the
 * practice actually asks, from `server/routes/reports.ts`, which is read-only
 * aggregate SQL and calls no model.
 *
 * NO CHARTS, BY THE SAME LAW THAT KEEPS THEM OFF TODAY. Numbers in tables —
 * 13px, tabular-nums, hairline rows (the ScenarioPanel grid grammar). At
 * practice scale a bar chart of nine stages is decoration; the counts ARE
 * the picture.
 *
 * THE LOSS HISTOGRAM IS THE POINT. It is the P4-hypothesis evidence the spec
 * wants — whether "internal BD owns origination" is the pattern that beats
 * us — which is why the funnel report renders first and why a lost pursuit
 * cannot be marked without feeding it.
 */
import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { T } from "../atlasTokens";
import type { AtlasScreenProps } from "../atlasNav";
import { Page, DetailCard, InfoBanner } from "../kit";
import { authHeaders } from "../../../../hooks/useAuth";
import {
  CRM_STAGES, STAGE_LABEL, LOSS_LABEL,
  type CrmStage, type LossReason,
} from "../../../../lib/crm";

/* ── the endpoint shapes (server/routes/reports.ts) ────────────────────── */

interface FunnelData {
  stages: { stage: string; n: number; avg_days: number | null }[];
  losses: { loss_reason: string | null; n: number }[];
  lossTotal: number;
}

interface WaveRow {
  id: number;
  wave_key: string;
  name: string;
  status: string;
  start_on: string | null;
  end_on: string | null;
  total: number;
  sent: number;
  done: number;
  pending: number;
  skipped: number;
  replied: number;
}

interface ActivityData {
  weeks: { week_start: string; n: number }[];
  tasks: { open: number; waiting: number; done: number; cancelled: number };
}

/** One fetch per report, each with its own honest failure state — a broken
 *  aggregate must not read as a quiet pipeline. */
function useReport<T>(path: string, userId: number | undefined) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    fetch(path, { headers: authHeaders() })
      .then(async r => {
        if (!r.ok) throw new Error((await r.json().catch(() => null))?.error || `HTTP ${r.status}`);
        return r.json();
      })
      .then((d: T) => { if (!cancelled) setData(d); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [path, userId]);
  return { data, error };
}

export default function ReportsScreen({ user }: AtlasScreenProps) {
  const funnel = useReport<FunnelData>("/api/reports/funnel", user?.id);
  const outreach = useReport<{ waves: WaveRow[] }>("/api/reports/outreach", user?.id);
  const activity = useReport<ActivityData>("/api/reports/activity", user?.id);

  return (
    <Page>
      <div style={{ maxWidth: 760 }}>
        <ReportSection
          title="Client funnel"
          error={funnel.error}
          loaded={!!funnel.data}
        >
          {funnel.data && <FunnelTables d={funnel.data} />}
        </ReportSection>

        <ReportSection
          title="Outreach — by wave"
          error={outreach.error}
          loaded={!!outreach.data}
        >
          {outreach.data && <OutreachTable waves={outreach.data.waves} />}
        </ReportSection>

        <ReportSection
          title="Activity — the last 12 weeks"
          error={activity.error}
          loaded={!!activity.data}
        >
          {activity.data && <ActivityTables d={activity.data} />}
        </ReportSection>
      </div>
    </Page>
  );
}

/* ── shared section shell ──────────────────────────────────────────────── */

function ReportSection({ title, error, loaded, children }: {
  title: string; error: string | null; loaded: boolean; children: ReactNode;
}) {
  return (
    <DetailCard title={title}>
      {error ? (
        <InfoBanner tone="caution">
          Could not build this report — {error}. Reload to try again.
        </InfoBanner>
      ) : !loaded ? (
        <div style={quiet}>Counting…</div>
      ) : children}
    </DetailCard>
  );
}

/* ═══ 1 · the funnel ═════════════════════════════════════════════════════ */

function FunnelTables({ d }: { d: FunnelData }) {
  const byStage = new Map(d.stages.map(s => [s.stage, s]));
  const totalOpen = d.stages.reduce((sum, s) => sum + s.n, 0);

  return (
    <div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thLeft}>Stage</th>
            <th style={thRight}>Firms</th>
            <th style={thRight}>Avg days in stage</th>
          </tr>
        </thead>
        <tbody>
          {CRM_STAGES.map(s => {
            const row = byStage.get(s);
            const n = row?.n ?? 0;
            return (
              <tr key={s}>
                <td style={tdLeft}>{STAGE_LABEL[s as CrmStage]}</td>
                {/* A stage absent from the aggregate holds zero acquirers —
                    a REAL zero (the pipeline was counted), so it prints 0. */}
                <td style={tdRight}>{n}</td>
                <td style={n === 0 ? tdRightMuted : row?.avg_days == null ? tdRightMuted : tdRight}>
                  {n === 0
                    ? "—"
                    /* Residents exist but none carries a stage stamp
                       (pre-migration-130 rows before their first move) —
                       that is unknown, not zero. */
                    : row?.avg_days == null ? "Not available" : `${row.avg_days}d`}
                </td>
              </tr>
            );
          })}
          <tr>
            <td style={{ ...tdLeft, fontWeight: 700 }}>All open pursuits</td>
            <td style={{ ...tdRight, fontWeight: 700 }}>{totalOpen}</td>
            <td style={tdRightMuted}>—</td>
          </tr>
        </tbody>
      </table>

      <div style={subHead}>Why pursuits die</div>
      {d.lossTotal === 0 ? (
        <div style={quiet}>
          No lost pursuits yet — the histogram appears when the first one is
          marked. Marking a pursuit lost requires its reason, so every loss
          feeds this table.
        </div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thLeft}>Reason</th>
              <th style={thRight}>Losses</th>
              <th style={thRight}>Share</th>
            </tr>
          </thead>
          <tbody>
            {d.losses.map((l, i) => (
              <tr key={i}>
                <td style={tdLeft}>
                  {l.loss_reason
                    ? (LOSS_LABEL[l.loss_reason as LossReason] ?? l.loss_reason)
                    /* Pre-discipline losses (mapped by migration 131) predate
                       the required-reason rule — named, not hidden. */
                    : "No reason recorded (pre-discipline)"}
                </td>
                <td style={tdRight}>{l.n}</td>
                <td style={tdRight}>{Math.round((l.n / d.lossTotal) * 100)}%</td>
              </tr>
            ))}
            <tr>
              <td style={{ ...tdLeft, fontWeight: 700 }}>All losses</td>
              <td style={{ ...tdRight, fontWeight: 700 }}>{d.lossTotal}</td>
              <td style={tdRight}>100%</td>
            </tr>
          </tbody>
        </table>
      )}
      <p style={note}>
        Acquirers only — a directory entry owes the funnel nothing. Losses
        include archived pursuits: filing a dead pursuit must not erase the
        evidence of why it died.
      </p>
    </div>
  );
}

/* ═══ 2 · outreach by wave ═══════════════════════════════════════════════ */

function OutreachTable({ waves }: { waves: WaveRow[] }) {
  if (!waves.length) {
    return (
      <div style={quiet}>
        No waves loaded — the campaign machine is empty. Seed the outreach plan
        from the Clients tab, or push a bundle from a Cowork session.
      </div>
    );
  }
  return (
    <div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thLeft}>Wave</th>
            <th style={thLeft}>Status</th>
            <th style={thRight}>Touches</th>
            <th style={thRight}>Pending</th>
            <th style={thRight}>Sent</th>
            <th style={thRight}>Replied</th>
            <th style={thRight}>Done</th>
            <th style={thRight}>Skipped</th>
          </tr>
        </thead>
        <tbody>
          {waves.map(w => (
            <tr key={w.id}>
              <td style={tdLeft}>
                <b>{w.wave_key}</b> · {w.name}
                {w.start_on && (
                  <span style={{ color: T.muted, fontWeight: 400 }}>
                    {" "}· from {String(w.start_on).slice(0, 10)}
                  </span>
                )}
              </td>
              <td style={tdLeft}>{w.status}</td>
              <td style={tdRight}>{w.total}</td>
              <td style={tdRight}>{w.pending}</td>
              <td style={tdRight}>{w.sent}</td>
              <td style={tdRight}>{w.replied}</td>
              <td style={tdRight}>{w.done}</td>
              <td style={tdRight}>{w.skipped}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={note}>
        A touch counts as sent only when the mail actually went (the
        honest-send law) — every send remains one touch, one press, one human.
        Nothing on this screen sends anything.
      </p>
    </div>
  );
}

/* ═══ 3 · activity ═══════════════════════════════════════════════════════ */

function ActivityTables({ d }: { d: ActivityData }) {
  const max = Math.max(1, ...d.weeks.map(w => w.n));
  return (
    <div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thLeft}>Week of</th>
            <th style={thRight}>Touches logged</th>
          </tr>
        </thead>
        <tbody>
          {d.weeks.map(w => (
            <tr key={w.week_start}>
              <td style={tdLeft}>{w.week_start}</td>
              {/* A quiet week arrives from the server as an explicit 0 — a
                  counted zero, not a gap in the series. The heaviest week
                  reads bold so the shape shows without a chart. */}
              <td style={w.n === max && w.n > 0 ? { ...tdRight, fontWeight: 700 } : tdRight}>
                {w.n}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={subHead}>Deal tasks</div>
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={tdLeft}>To ask</td>
            <td style={tdRight}>{d.tasks.open}</td>
          </tr>
          <tr>
            <td style={tdLeft}>Waiting on them</td>
            <td style={tdRight}>{d.tasks.waiting}</td>
          </tr>
          <tr>
            <td style={tdLeft}>Done</td>
            <td style={tdRight}>{d.tasks.done}</td>
          </tr>
          <tr>
            <td style={tdLeft}>Cancelled</td>
            <td style={tdRight}>{d.tasks.cancelled}</td>
          </tr>
        </tbody>
      </table>
      <p style={note}>
        Touches are what was LOGGED, not what happened — an unlogged call is
        invisible here, which is the argument for the ten-second logging law,
        not for trusting this table as a complete record.
      </p>
    </div>
  );
}

/* ── styles — the ScenarioPanel grid grammar ───────────────────────────── */

const tableStyle: CSSProperties = {
  borderCollapse: "collapse", fontSize: 13, fontVariantNumeric: "tabular-nums",
  width: "100%",
};
const thLeft: CSSProperties = {
  fontSize: 12.5, fontWeight: 700, color: T.muted, textAlign: "left",
  padding: "6px 8px", borderBottom: `1px solid ${T.border}`,
};
const thRight: CSSProperties = {
  fontSize: 12.5, fontWeight: 700, color: T.muted, textAlign: "right",
  padding: "6px 8px", borderBottom: `1px solid ${T.border}`,
};
const tdLeft: CSSProperties = {
  textAlign: "left", padding: "6px 8px", color: T.ink,
  borderBottom: `1px solid ${T.border}`,
};
const tdRight: CSSProperties = {
  textAlign: "right", padding: "6px 8px", color: T.ink,
  borderBottom: `1px solid ${T.border}`,
};
const tdRightMuted: CSSProperties = {
  textAlign: "right", padding: "6px 8px", color: T.muted2,
  borderBottom: `1px solid ${T.border}`,
};

const subHead: CSSProperties = {
  fontSize: 13, fontWeight: 700, color: T.ink, margin: "16px 0 6px",
};
const quiet: CSSProperties = { fontSize: 13, color: T.muted, lineHeight: 1.6 };
const note: CSSProperties = {
  margin: "10px 0 0", fontSize: 12.5, color: T.muted, lineHeight: 1.6,
};
