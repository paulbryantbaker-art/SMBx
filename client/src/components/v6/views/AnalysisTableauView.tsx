import { useMemo, useState, type CSSProperties } from "react";
import type {
  AnalysisTone,
  StructuredAnalysisData,
  StructuredChart,
  StructuredMetric,
} from "../../../lib/analysisCanvasModel";

interface AnalysisTableauViewProps {
  data: StructuredAnalysisData;
  onTalkToYulia?: (prompt: string) => void;
  onOpenScenarioControls?: () => void;
}

export function AnalysisTableauView({
  data,
  onTalkToYulia,
  onOpenScenarioControls,
}: AnalysisTableauViewProps) {
  const charts = data.charts ?? [];
  const [selectedChartTitle, setSelectedChartTitle] = useState(charts[0]?.title ?? "");
  const selectedChart = charts.find(chart => chart.title === selectedChartTitle) ?? charts[0] ?? null;
  const primaryMetrics = (data.metrics ?? []).slice(0, 4);
  const actionRows = (data.nextActions ?? []).slice(0, 3);
  const insightRows = useMemo(() => buildInsightRows(data), [data]);

  return (
    <section className="wkcard" style={T.shell} aria-label="Analysis visual board">
      <div style={T.header}>
        <div>
          <div className="mono" style={T.eyebrow}>TABLEAU VIEW</div>
          <h2 style={T.title}>{data.title}</h2>
        </div>
        <div style={T.headerActions}>
          <button className="wkbtn" type="button" onClick={onOpenScenarioControls}>
            Change assumptions
          </button>
          <button
            className="wkbtn primary"
            type="button"
            onClick={() => onTalkToYulia?.(`Use the open ${data.title} visual board. Tell me what changed, what matters most, and what I should do next.`)}
          >
            Ask Yulia
          </button>
        </div>
      </div>

      {primaryMetrics.length > 0 && (
        <div style={T.metricStrip}>
          {primaryMetrics.map(metric => (
            <MetricTile key={metric.key} metric={metric} />
          ))}
        </div>
      )}

      <div style={T.boardGrid}>
        <div style={T.chartPanel}>
          <div style={T.chartTop}>
            <div>
              <div className="mono" style={T.chartType}>{selectedChart?.type?.toUpperCase() ?? "CANVAS"}</div>
              <div style={T.chartTitle}>{selectedChart?.title ?? "No chart yet"}</div>
            </div>
            {charts.length > 1 && (
              <div style={T.chartTabs} aria-label="Choose chart">
                {charts.map(chart => (
                  <button
                    key={chart.title}
                    type="button"
                    className="wkcard tap"
                    style={{
                      ...T.chartTab,
                      ...(chart.title === selectedChart?.title ? T.chartTabActive : null),
                    }}
                    onClick={() => setSelectedChartTitle(chart.title)}
                  >
                    {chart.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedChart ? (
            <VisualChart chart={selectedChart} />
          ) : (
            <div style={T.emptyChart}>Run an analysis to populate this board with charts, tables, and editable assumptions.</div>
          )}
        </div>

        <aside style={T.sidePanel}>
          <div>
            <div className="mono" style={T.sideEyebrow}>WHAT MOVES</div>
            <div style={T.sideStack}>
              {insightRows.map(row => (
                <div key={row.label} style={T.insightRow}>
                  <span style={{ ...T.insightDot, background: toneAccent(row.tone) }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={T.insightLabel}>{row.label}</div>
                    <div style={T.insightSub}>{row.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {actionRows.length > 0 && (
            <div>
              <div className="mono" style={T.sideEyebrow}>DIRECT FROM CANVAS</div>
              <div style={T.actionStack}>
                {actionRows.map(action => (
                  <button
                    key={`${action.actionType}-${action.label}`}
                    type="button"
                    className="wkcard tap"
                    style={T.actionButton}
                    onClick={() => onTalkToYulia?.(action.prompt)}
                  >
                    <span>{action.label}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function MetricTile({ metric }: { metric: StructuredMetric }) {
  const tone = metric.tone ?? "neutral";
  return (
    <div style={{ ...T.metricTile, borderColor: toneBorder(tone) }}>
      <div className="mono" style={T.metricLabel}>{metric.label}</div>
      <div style={{ ...T.metricValue, color: toneValue(tone) }}>{metric.displayValue}</div>
      {metric.sub && <div style={T.metricSub}>{metric.sub}</div>}
    </div>
  );
}

function VisualChart({ chart }: { chart: StructuredChart }) {
  if (chart.type === "matrix") return <MatrixChart chart={chart} />;
  return <BarLikeChart chart={chart} />;
}

function BarLikeChart({ chart }: { chart: StructuredChart }) {
  const values = chart.data
    .map(point => Number(point.value ?? 0))
    .filter(Number.isFinite);
  const max = Math.max(1, ...values.map(value => Math.abs(value)));

  return (
    <div style={T.barRows}>
      {chart.data.map(point => {
        const value = Number(point.value ?? 0);
        const label = String(point.label ?? "Item");
        const displayValue = String(point.displayValue ?? value);
        const tone = typeof point.tone === "string" ? point.tone as AnalysisTone : "neutral";
        const width = `${Math.max(3, Math.min(100, Math.abs(value) / max * 100))}%`;
        return (
          <div key={`${chart.title}-${label}`} style={T.barRow}>
            <div style={T.barLabelRow}>
              <span>{label}</span>
              <strong>{displayValue}</strong>
            </div>
            <div style={T.bigTrack}>
              <div style={{ ...T.bigFill, width, background: toneAccent(tone) }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatrixChart({ chart }: { chart: StructuredChart }) {
  const rows = Array.from(new Set(chart.data.map(point => String(point.row ?? "")))).filter(Boolean);
  const cols = Array.from(new Set(chart.data.map(point => String(point.column ?? "")))).filter(Boolean);
  const values = chart.data.map(point => Number(point.value ?? 0)).filter(Number.isFinite);
  const max = Math.max(1, ...values.map(value => Math.abs(value)));

  return (
    <div style={T.matrixWrap}>
      <div style={{ ...T.matrixGrid, gridTemplateColumns: `minmax(74px, 0.8fr) repeat(${Math.max(cols.length, 1)}, minmax(76px, 1fr))` }}>
        <div />
        {cols.map(col => <div key={col} className="mono" style={T.matrixHead}>{col}</div>)}
        {rows.map(row => (
          <MatrixRow
            key={row}
            row={row}
            cols={cols}
            chart={chart}
            max={max}
          />
        ))}
      </div>
    </div>
  );
}

function MatrixRow({
  row,
  cols,
  chart,
  max,
}: {
  row: string;
  cols: string[];
  chart: StructuredChart;
  max: number;
}) {
  return (
    <>
      <div className="mono" style={T.matrixRowHead}>{row}</div>
      {cols.map(col => {
        const point = chart.data.find(item => String(item.row ?? "") === row && String(item.column ?? "") === col);
        const value = Number(point?.value ?? 0);
        const heat = Math.max(0.08, Math.min(1, Math.abs(value) / max));
        return (
          <div
            key={`${row}-${col}`}
            style={{
              ...T.matrixCell,
              background: `rgba(106, 155, 204, ${0.12 + heat * 0.38})`,
            }}
          >
            {String(point?.displayValue ?? "—")}
          </div>
        );
      })}
    </>
  );
}

function buildInsightRows(data: StructuredAnalysisData): Array<{ label: string; sub: string; tone: AnalysisTone }> {
  const metrics = data.metrics ?? [];
  const risks = data.risks ?? [];
  const missing = data.missingData ?? [];
  const primaryMetric = metrics[0];
  return [
    {
      label: data.verdict?.label || primaryMetric?.label || "Decision signal",
      sub: data.verdict?.rationale || primaryMetric?.sub || data.summary,
      tone: data.verdict?.tone || primaryMetric?.tone || "neutral",
    },
    {
      label: `${risks.length} risks`,
      sub: risks[0]?.detail || "Risk register updates as Yulia sees more evidence.",
      tone: risks.some(risk => risk.severity === "high") ? "pass" : risks.length ? "watch" : "pursue",
    },
    {
      label: `${missing.length} data gaps`,
      sub: missing[0]?.why || "No critical missing data surfaced from the current facts.",
      tone: missing.some(item => item.priority === "high") ? "pass" : missing.length ? "watch" : "pursue",
    },
  ];
}

function toneAccent(tone?: AnalysisTone): string {
  if (tone === "pursue") return "var(--st-good-fg)";
  if (tone === "watch") return "var(--st-review-fg)";
  if (tone === "pass") return "var(--st-risk-fg)";
  return "var(--accent)";
}

function toneBorder(tone?: AnalysisTone): string {
  if (tone === "pursue") return "rgba(69, 133, 101, 0.34)";
  if (tone === "watch") return "rgba(188, 137, 31, 0.34)";
  if (tone === "pass") return "rgba(185, 75, 67, 0.34)";
  return "rgba(169, 190, 212, 0.7)";
}

function toneValue(tone?: AnalysisTone): string {
  if (tone === "pursue") return "var(--st-good-fg)";
  if (tone === "watch") return "#88630F";
  if (tone === "pass") return "var(--st-risk-fg)";
  return "var(--ink)";
}

const T: Record<string, CSSProperties> = {
  shell: {
    padding: "22px",
    marginBottom: 24,
    background: "var(--surface)",
    borderColor: "rgba(187, 206, 224, 0.74)",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 9.5,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "var(--ink-2)",
  },
  title: {
    margin: "4px 0 0",
    fontFamily: "var(--font-display)",
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "var(--ink)",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  metricStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
    marginBottom: 16,
  },
  metricTile: {
    minHeight: 92,
    padding: "13px 14px",
    borderRadius: 12,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(169, 190, 212, 0.7)",
    boxSizing: "border-box",
  },
  metricLabel: {
    fontSize: 9,
    letterSpacing: "0.14em",
    fontWeight: 800,
    color: "var(--ink-2)",
  },
  metricValue: {
    marginTop: 6,
    fontSize: 25,
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: "-0.02em",
    fontVariantNumeric: "tabular-nums",
  },
  metricSub: {
    marginTop: 6,
    fontSize: 11.5,
    lineHeight: 1.35,
    color: "var(--ink-3)",
  },
  boardGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.45fr) minmax(280px, 0.55fr)",
    gap: 16,
    alignItems: "stretch",
  },
  chartPanel: {
    minHeight: 312,
    padding: "18px",
    borderRadius: 14,
    background: "rgba(255, 255, 255, 0.74)",
    border: "1px solid rgba(199, 214, 229, 0.78)",
    boxSizing: "border-box",
  },
  chartTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 18,
  },
  chartType: {
    fontSize: 9,
    letterSpacing: "0.14em",
    fontWeight: 800,
    color: "var(--ink-2)",
  },
  chartTitle: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: 900,
    color: "var(--ink)",
  },
  chartTabs: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 6,
  },
  chartTab: {
    all: "unset",
    padding: "6px 9px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    color: "var(--ink-3)",
    cursor: "pointer",
    background: "rgba(236, 243, 250, 0.76)",
  },
  chartTabActive: {
    color: "#245C8E",
    background: "rgba(234, 243, 251, 1)",
    boxShadow: "inset 0 0 0 1px rgba(133, 173, 209, 0.54)",
  },
  barRows: {
    display: "grid",
    gap: 14,
  },
  barRow: {
    display: "grid",
    gap: 7,
  },
  barLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    fontSize: 12.5,
    color: "var(--ink-3)",
  },
  bigTrack: {
    height: 16,
    borderRadius: 999,
    background: "rgba(221, 232, 243, 0.88)",
    overflow: "hidden",
  },
  bigFill: {
    height: "100%",
    minWidth: 3,
    borderRadius: 999,
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.36)",
  },
  matrixWrap: {
    overflowX: "auto",
    paddingBottom: 2,
  },
  matrixGrid: {
    display: "grid",
    gap: 7,
    alignItems: "stretch",
    minWidth: 420,
  },
  matrixHead: {
    fontSize: 9,
    letterSpacing: "0.12em",
    fontWeight: 800,
    color: "var(--ink-2)",
    textAlign: "center",
    alignSelf: "center",
  },
  matrixRowHead: {
    fontSize: 10,
    letterSpacing: "0.08em",
    fontWeight: 800,
    color: "var(--ink-2)",
    alignSelf: "center",
  },
  matrixCell: {
    minHeight: 48,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    padding: "8px",
    boxSizing: "border-box",
    fontSize: 12,
    fontWeight: 900,
    color: "var(--ink)",
    fontVariantNumeric: "tabular-nums",
  },
  emptyChart: {
    minHeight: 220,
    display: "grid",
    placeItems: "center",
    color: "var(--ink-3)",
    fontSize: 13,
    textAlign: "center",
  },
  sidePanel: {
    padding: "18px",
    borderRadius: 14,
    background: "rgba(255, 255, 255, 0.54)",
    border: "1px solid rgba(199, 214, 229, 0.72)",
    display: "grid",
    alignContent: "space-between",
    gap: 18,
  },
  sideEyebrow: {
    fontSize: 9,
    letterSpacing: "0.14em",
    fontWeight: 800,
    color: "var(--ink-2)",
    marginBottom: 10,
  },
  sideStack: {
    display: "grid",
    gap: 12,
  },
  insightRow: {
    display: "grid",
    gridTemplateColumns: "9px minmax(0, 1fr)",
    gap: 10,
    alignItems: "start",
  },
  insightDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginTop: 4,
  },
  insightLabel: {
    fontSize: 13,
    fontWeight: 900,
    color: "var(--ink)",
  },
  insightSub: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 1.42,
    color: "var(--ink-3)",
  },
  actionStack: {
    display: "grid",
    gap: 7,
  },
  actionButton: {
    all: "unset",
    minHeight: 34,
    padding: "0 10px",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    background: "rgba(236, 243, 250, 0.74)",
    color: "var(--ink)",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
};
