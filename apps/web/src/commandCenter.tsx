import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./api";
import type { WeekRecord } from "./types";
import { Shell, Card, Pill } from "./ui";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  Cell,
} from "recharts";

function money(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return `£${Math.round(v).toLocaleString()}`;
}
function pct(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return `${Math.round(v * 1000) / 10}%`;
}

// Normalize whatever the API returned into an array of weeks
function normalizeWeeks(data: any): any[] {
  if (Array.isArray(data)) return data;
  const maybe = data?.weeks || data?.data;
  return Array.isArray(maybe) ? maybe : [];
}

// Custom tooltip style for white text
const tooltipStyle = {
  background: "rgba(5, 7, 10, 0.95)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: "12px 16px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  color: "#FFFFFF",
};

// Custom tooltip component with white text
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 600, marginBottom: 8, color: "#FFFFFF" }}>{label}</div>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: entry.color }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{entry.name}:</span>
          <span style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 12 }}>{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export function CommandCenter() {
  const weeksQ = useQuery({
    queryKey: ["weeks"],
    queryFn: () => apiGet<WeekRecord[]>("/demo/weeks"),
    retry: 1,
  });

  const alertsQ = useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiGet<any>("/demo/alerts"),
    retry: 1,
  });

  // ✅ Hooks must run every render — so compute derived values up here
  const weeksRaw: any = weeksQ.data;
  const weeks = useMemo(() => normalizeWeeks(weeksRaw), [weeksRaw]);

  const latest: any = weeks.length ? weeks[weeks.length - 1] : null;
  const prev: any = weeks.length > 1 ? weeks[weeks.length - 2] : latest;

  const completion = useMemo(() => {
    const complete = Number(latest?.ga4?.registration_complete ?? 0);
    const start = Math.max(1, Number(latest?.ga4?.registration_start ?? 0));
    return complete / start;
  }, [latest]);

  const completionPrev = useMemo(() => {
    const complete = Number(prev?.ga4?.registration_complete ?? 0);
    const start = Math.max(1, Number(prev?.ga4?.registration_start ?? 0));
    return complete / start;
  }, [prev]);

  const completionDelta = completion - completionPrev;

  const pace = useMemo(() => buildPaceForecast(weeks as any), [weeks]);
  const funnel = useMemo(() => (latest ? buildFunnel(latest) : []), [latest]);
  const channelMix = useMemo(() => buildChannelMix(weeks as any), [weeks]);

  const alertsRaw: any = alertsQ.data;
  const alerts = Array.isArray(alertsRaw?.alerts) ? alertsRaw.alerts : [];

  const alertsState =
    alertsQ.isLoading ? "loading" : alertsQ.isError ? "error" : "ready";

  const sevTone = (s: string) =>
    s === "high" ? "critical" : s === "medium" ? "warning" : "cyan";

  // ✅ Now you can safely return early — hooks already ran
  if (weeksQ.isLoading) {
    return (
      <Shell>
        <div className="glass sheen" style={{ padding: 18, maxWidth: 560 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
            Loading Command Center…
          </div>
          <div style={{ opacity: 0.75, marginTop: 6, color: "var(--text-secondary)" }}>
            Warming up data + forecasts.
          </div>
          <div
            style={{
              marginTop: 12,
              height: 8,
              borderRadius: 999,
              background: "rgba(255,255,255,0.10)",
              overflow: "hidden",
            }}
          >
            <div
              className="animate-pulse-slow"
              style={{
                width: "46%",
                height: "100%",
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, rgba(0, 242, 255, 0.35), rgba(138, 43, 226, 0.25))",
              }}
            />
          </div>
        </div>
      </Shell>
    );
  }

  if (weeksQ.isError) {
    return (
      <Shell>
        <div className="glass sheen" style={{ padding: 18, maxWidth: 720 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>API error</div>
          <div style={{ opacity: 0.8, marginTop: 6, color: "var(--text-secondary)" }}>
            The app couldn't load <code style={{ color: "var(--cyan)" }}>/api/demo/weeks</code>.
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
            Try opening this in a new tab to confirm it responds:
            <div style={{ marginTop: 8 }}>
              <code style={{ color: "var(--cyan)" }}>/api/demo/weeks</code>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <a href="/overview" style={{ textDecoration: "none", color: "var(--cyan)" }}>
              Open Overview →
            </a>
          </div>
        </div>
      </Shell>
    );
  }

  if (!latest || weeks.length === 0) {
    return (
      <Shell>
        <div className="glass sheen" style={{ padding: 18, maxWidth: 680 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
            No demo weeks data yet
          </div>
          <div style={{ opacity: 0.78, marginTop: 6, color: "var(--text-secondary)" }}>
            The API returned an unexpected shape.
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "var(--text-muted)",
              whiteSpace: "pre-wrap",
            }}
          >
            {JSON.stringify(weeksRaw, null, 2)}
          </div>
          <div style={{ marginTop: 12 }}>
            <a href="/overview" style={{ textDecoration: "none", color: "var(--cyan)" }}>
              Open Overview →
            </a>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6, color: "var(--text)" }}>
            Command Center
          </div>
          <div style={{ color: "var(--text-secondary)", marginTop: 6 }}>
            High-energy ops room view: pace, constraints, channel mix, and alerts.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            className="dot"
            style={{
              background: "var(--success)",
              boxShadow: "0 0 0 6px rgba(34, 197, 94, 0.15), 0 0 20px rgba(34, 197, 94, 0.3)",
            }}
          />
          <Pill tone="success">LIVE</Pill>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 12,
        }}
      >
        <div className="kpi-tile sheen" style={{ padding: 16 }}>
          <div className="kpi-label">Registrations completed</div>
          <div className="kpi-value">{latest?.ga4?.registration_complete ?? 0}</div>
          <div className="kpi-sub">Show-up proxy: {latest?.ga4?.show_up ?? 0}</div>
        </div>

        <div className="kpi-tile sheen" style={{ padding: 16 }}>
          <div className="kpi-label">Paid spend (week)</div>
          <div className="kpi-value">{money(latest?.total_spend ?? 0)}</div>
          <div className="kpi-sub">Blended CPA: {money(latest?.blended_cpa ?? 0)}</div>
        </div>

        <div className="kpi-tile sheen" style={{ padding: 16 }}>
          <div className="kpi-label">Reg completion rate</div>
          <div className="kpi-value">{pct(completion)}</div>
          <div className="kpi-sub">
            Δ vs last week:{" "}
            <span
              style={{
                color: completionDelta < 0 ? "var(--critical)" : "var(--success)",
                fontWeight: 700,
              }}
            >
              {Math.round(completionDelta * 1000) / 10}pp
            </span>
          </div>
        </div>

        <div className="kpi-tile sheen" style={{ padding: 16 }}>
          <div className="kpi-label">Constraint</div>
          <div className="kpi-value" style={{ fontSize: 18, marginTop: 10 }}>
            Step 2 Drop-off
          </div>
          <div className="kpi-sub">Fix this first to unlock lift.</div>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 12,
        }}
      >
        <Card
          title="Registration pace forecast (demo)"
          right={<Pill tone="purple">FORECAST</Pill>}
        >
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={Array.isArray(pace) ? pace : []}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fill: "#FFFFFF" }} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: "#FFFFFF" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="lo" stackId="band" stroke="none" fill="rgba(0,0,0,0)" />
                <Area type="monotone" dataKey="band" stackId="band" stroke="none" fill="rgba(138, 43, 226, 0.15)" />
                <Line type="monotone" dataKey="actual" stroke="var(--cyan)" strokeWidth={2.5} dot={false} style={{ filter: "drop-shadow(0 0 8px rgba(0, 242, 255, 0.4))" }} />
                <Line type="monotone" dataKey="forecast" stroke="var(--purple)" strokeWidth={2} dot={false} style={{ filter: "drop-shadow(0 0 8px rgba(138, 43, 226, 0.4))" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 13 }}>
            Band shows forecast uncertainty. Use Simulation to see lift from fixes.
          </div>
        </Card>

        <Card title="Live alerts" right={<Pill tone="critical">SHIFTS</Pill>}>
          <div style={{ display: "grid", gap: 10 }}>
            {alertsState === "loading" && (
              <div style={{ color: "var(--text-secondary)" }}>Loading alerts…</div>
            )}

            {alertsState === "error" && (
              <div style={{ color: "var(--text-secondary)" }}>
                Alerts are temporarily unavailable.
                <div style={{ marginTop: 8 }}>
                  <a href="/alerts" style={{ textDecoration: "none", color: "var(--cyan)" }}>
                    Open Alerts →
                  </a>
                </div>
              </div>
            )}

            {alertsState === "ready" && (
              <>
                {alerts.slice(0, 4).map((a: any) => (
                  <div
                    key={a.id}
                    className="glass sheen"
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: "1px solid var(--glass-border)",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 600, color: "var(--text)" }}>{a.title}</div>
                      <Pill tone={sevTone(String(a.severity)) as any}>
                        {String(a.severity).toUpperCase()}
                      </Pill>
                    </div>
                    <div style={{ marginTop: 6, color: "var(--text-secondary)", lineHeight: 1.45, fontSize: 13 }}>{a.message}</div>
                  </div>
                ))}
                <a href="/alerts" style={{ color: "var(--cyan)", textDecoration: "none", fontSize: 13 }}>
                  View all alerts →
                </a>
              </>
            )}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Funnel waterfall (constraint highlighted)" right={<Pill tone="cyan">DIAGNOSTICS</Pill>}>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={Array.isArray(funnel) ? funnel : []}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fill: "#FFFFFF" }} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: "#FFFFFF" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                  {Array.isArray(funnel)
                    ? funnel.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry?.fill ?? "var(--cyan)"} />
                      ))
                    : null}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 13 }}>
            Worst conversion step is <span style={{ color: "var(--critical)" }}>highlighted</span> (binding constraint).
          </div>
        </Card>

        <Card title="Channel mix (spend vs conversions)" right={<Pill tone="purple">MIX</Pill>}>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={Array.isArray(channelMix) ? channelMix : []}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fill: "#FFFFFF" }} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: "#FFFFFF" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: "#FFFFFF" }} />
                <Bar dataKey="GoogleSpend" stackId="a" fill="var(--cyan)" />
                <Bar dataKey="MetaSpend" stackId="a" fill="var(--critical)" />
                <Bar dataKey="LinkedInSpend" stackId="a" fill="var(--purple)" />
                <Bar dataKey="GoogleConv" stackId="b" fill="rgba(0, 242, 255, 0.45)" />
                <Bar dataKey="MetaConv" stackId="b" fill="rgba(255, 77, 77, 0.45)" />
                <Bar dataKey="LinkedInConv" stackId="b" fill="rgba(138, 43, 226, 0.45)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 13 }}>Two stacks: Spend (a) and Conversions (b).</div>
        </Card>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <Card title="Top actions right now" right={<Pill tone="warning">NEXT BEST</Pill>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <ActionCard
              tone="cyan"
              title="Fix Step 2 form friction"
              impact="+5–8% completion"
              steps={["Remove non-essential fields", "Enable autofill", "Validate GA4 step events"]}
            />
            <ActionCard
              tone="purple"
              title="Shift 15% retargeting → high-intent"
              impact="+3–6% incremental VP+"
              steps={["Reduce retargeting budgets", "Increase search + partner", "Reopen once completion recovers"]}
            />
            <ActionCard
              tone="critical"
              title="Refresh fatigued creatives"
              impact="+2–4% CVR"
              steps={["Rotate 3 new variants", "Cap frequency", "Pivot VP+ value prop to outcomes"]}
            />
          </div>
        </Card>
      </div>
    </Shell>
  );
}

function ActionCard(props: { tone: "cyan" | "purple" | "critical" | "warning" | "success"; title: string; impact: string; steps: string[] }) {
  const borderColors: Record<string, string> = {
    cyan: "rgba(0, 242, 255, 0.3)",
    purple: "rgba(138, 43, 226, 0.3)",
    critical: "rgba(255, 77, 77, 0.3)",
    warning: "rgba(255, 138, 0, 0.3)",
    success: "rgba(34, 197, 94, 0.3)"
  };
  
  const border = borderColors[props.tone] || borderColors.cyan;

  return (
    <div
      className="glass sheen"
      style={{
        padding: 14,
        borderRadius: 14,
        border: `1px solid ${border}`,
        WebkitBackdropFilter: "var(--blur)",
        backdropFilter: "var(--blur)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
        boxShadow: "var(--shadow-soft)",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <div style={{ fontWeight: 600, color: "var(--text)" }}>{props.title}</div>
        <Pill tone={props.tone as any}>{props.impact}</Pill>
      </div>
      <ol style={{ margin: "10px 0 0 18px", color: "var(--text-secondary)", fontSize: 13 }}>
        {props.steps.map((s, i) => (
          <li key={i} style={{ marginTop: 6 }}>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

function buildPaceForecast(weeks: any[]) {
  const safeWeeks = Array.isArray(weeks) ? weeks : [];

  const points = safeWeeks.map((w: any, i: number) => ({
    idx: i,
    name: `W${w?.week ?? i + 1}`,
    actual: safeWeeks
      .slice(0, i + 1)
      .reduce((s: number, x: any) => s + Number(x?.ga4?.registration_complete ?? 0), 0),
    weekly: Number(w?.ga4?.registration_complete ?? 0),
  }));

  if (points.length === 0) return [];

  const last = points[points.length - 1];
  const horizon = 6;
  const recent = points.slice(Math.max(0, points.length - 4));
  const avgWeekly =
    recent.reduce((s: number, x: any) => s + Number(x.weekly ?? 0), 0) / Math.max(1, recent.length);
  const target = Math.round(last.actual * 1.12);

  const data: any[] = [];
  for (let i = 0; i < points.length + horizon; i++) {
    const base =
      i < points.length
        ? points[i].actual
        : Math.round(last.actual + avgWeekly * (i - (points.length - 1)));
    const forecast = i < points.length ? null : base;
    const actual = i < points.length ? base : null;

    const drift = Math.max(0, i - (points.length - 1));
    const bandWidth = Math.max(8, Math.round(base * (0.04 + 0.01 * Math.min(6, drift))));
    const lo = Math.max(0, (forecast ?? base) - bandWidth);
    const hi = (forecast ?? base) + bandWidth;

    data.push({
      name: i < points.length ? points[i].name : `F${i - (points.length - 1)}`,
      actual,
      forecast,
      lo,
      band: hi - lo,
      target,
    });
  }
  return data;
}

function buildFunnel(latest: any) {
  const ga4 = latest?.ga4 ?? {};
  const steps = [
    { name: "Sessions", value: Number(ga4.sessions ?? 0) },
    { name: "LP views", value: Number(ga4.landing_page_views ?? 0) },
    { name: "Reg start", value: Number(ga4.registration_start ?? 0) },
    { name: "Reg complete", value: Number(ga4.registration_complete ?? 0) },
    { name: "Show-up", value: Number(ga4.show_up ?? 0) },
  ];

  let worstIdx = 1;
  let worstRate = 1;

  for (let i = 1; i < steps.length; i++) {
    const rate = steps[i].value / Math.max(1, steps[i - 1].value);
    if (rate < worstRate) {
      worstRate = rate;
      worstIdx = i;
    }
  }

  return steps.map((s, i) => ({
    ...s,
    fill: i === worstIdx ? "var(--critical)" : "var(--cyan)",
  }));
}

function buildChannelMix(weeks: any[]) {
  const safeWeeks = Array.isArray(weeks) ? weeks : [];
  return safeWeeks.map((w: any, i: number) => ({
    name: `W${w?.week ?? i + 1}`,
    GoogleSpend: Number(w?.channels?.google_ads?.spend ?? 0),
    MetaSpend: Number(w?.channels?.meta_ads?.spend ?? 0),
    LinkedInSpend: Number(w?.channels?.linkedin_ads?.spend ?? 0),
    GoogleConv: Number(w?.channels?.google_ads?.conversions ?? 0),
    MetaConv: Number(w?.channels?.meta_ads?.conversions ?? 0),
    LinkedInConv: Number(w?.channels?.linkedin_ads?.conversions ?? 0),
  }));
}