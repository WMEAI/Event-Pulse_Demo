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

export function CommandCenter() {
  // ✅ Hooks first, always
  const weeksQ = useQuery({
    queryKey: ["weeks"],
    queryFn: () => apiGet<WeekRecord[]>("/demo/weeks"),
  });

  const alertsQ = useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiGet<any>("/demo/alerts"),
  });

  // ✅ Normalize data shape safely (so UI never crashes on weird API shapes)
  const weeksRaw: any = weeksQ.data;

  const weeks = useMemo<any[]>(() => {
    if (Array.isArray(weeksRaw)) return weeksRaw;
    if (Array.isArray(weeksRaw?.weeks)) return weeksRaw.weeks;
    if (Array.isArray(weeksRaw?.data)) return weeksRaw.data;
    return [];
  }, [weeksRaw]);

  const latest = useMemo<any | null>(() => {
    if (!Array.isArray(weeks) || weeks.length === 0) return null;
    return weeks[weeks.length - 1];
  }, [weeks]);

  const prev = useMemo<any | null>(() => {
    if (!Array.isArray(weeks) || weeks.length < 2) return latest;
    return weeks[weeks.length - 2];
  }, [weeks, latest]);

  const completion = useMemo(() => {
    const start = latest?.ga4?.registration_start ?? 0;
    const complete = latest?.ga4?.registration_complete ?? 0;
    return complete / Math.max(1, start);
  }, [latest]);

  const completionPrev = useMemo(() => {
    const start = prev?.ga4?.registration_start ?? 0;
    const complete = prev?.ga4?.registration_complete ?? 0;
    return complete / Math.max(1, start);
  }, [prev]);

  const completionDelta = useMemo(() => completion - completionPrev, [completion, completionPrev]);

  const pace = useMemo(() => {
    if (!Array.isArray(weeks) || weeks.length === 0) return [];
    return buildPaceForecast(weeks as any);
  }, [weeks]);

  const funnel = useMemo(() => {
    if (!latest) return [];
    return buildFunnel(latest);
  }, [latest]);

  const channelMix = useMemo(() => {
    if (!Array.isArray(weeks) || weeks.length === 0) return [];
    return buildChannelMix(weeks as any);
  }, [weeks]);

  const alerts = useMemo(() => {
    const raw = alertsQ.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.alerts)) return raw.alerts;
    return [];
  }, [alertsQ.data]);

  const alertsState = alertsQ.isLoading ? "loading" : alertsQ.isError ? "error" : "ready";

  const sevTone = (s: string) => (s === "high" ? "coral" : s === "medium" ? "violet" : "mint");

  // ✅ Now it is safe to early-return (all hooks already ran)
  if (weeksQ.isLoading) {
    return (
      <Shell>
        <div className="glass sheen" style={{ padding: 18, maxWidth: 560 }}>
          <div style={{ fontSize: 18, fontWeight: 950 }}>Loading Command Center…</div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>Warming up data + forecasts.</div>
          <div
            style={{
              marginTop: 12,
              height: 8,
              borderRadius: 999,
              background: "rgba(240,244,248,0.10)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "46%",
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, rgba(123,110,246,0.35), rgba(62,205,163,0.25))",
              }}
            />
          </div>
        </div>
      </Shell>
    );
  }

  if (weeksQ.isError) return <Shell><div>API error. Check /api/demo/weeks</div></Shell>;

  if (!Array.isArray(weeks) || weeks.length === 0) {
    return (
      <Shell>
        <div className="glass sheen" style={{ padding: 18, maxWidth: 680 }}>
          <div style={{ fontSize: 18, fontWeight: 950 }}>No demo weeks data yet</div>
          <div style={{ opacity: 0.78, marginTop: 6 }}>
            The API returned an unexpected shape. Try again in a moment.
          </div>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(weeksRaw, null, 2)}
          </div>
          <div style={{ marginTop: 12 }}>
            <a href="/overview" style={{ textDecoration: "none", opacity: 0.9 }}>
              Open Overview →
            </a>
          </div>
        </div>
      </Shell>
    );
  }

  // At this point latest should exist, but keep it safe anyway
  const safeLatest = latest ?? weeks[weeks.length - 1];

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 950, letterSpacing: -0.6 }}>Command Center</div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            High-energy ops room view: pace, constraints, channel mix, and alerts.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="dot" style={{ background: "var(--mint)", boxShadow: "0 0 0 6px rgba(62,205,163,0.12)" }} />
          <Pill tone="mint">LIVE</Pill>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
        <div className="kpi-tile sheen" style={{ padding: 16 }}>
          <div className="kpi-label">Registrations completed</div>
          <div className="kpi-value">{safeLatest?.ga4?.registration_complete ?? "—"}</div>
          <div className="kpi-sub">Show-up proxy: {safeLatest?.ga4?.show_up ?? "—"}</div>
        </div>

        <div className="kpi-tile sheen" style={{ padding: 16 }}>
          <div className="kpi-label">Paid spend (week)</div>
          <div className="kpi-value">{money(safeLatest?.total_spend)}</div>
          <div className="kpi-sub">Blended CPA: {money(safeLatest?.blended_cpa)}</div>
        </div>

        <div className="kpi-tile sheen" style={{ padding: 16 }}>
          <div className="kpi-label">Reg completion rate</div>
          <div className="kpi-value">{pct(completion)}</div>
          <div className="kpi-sub">
            Δ vs last week:{" "}
            <span
              style={{
                color: completionDelta < 0 ? "var(--coral)" : "var(--mint)",
                fontWeight: 900,
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

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}>
        <Card title="Registration pace forecast (demo)" right={<Pill tone="violet">FORECAST</Pill>}>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={Array.isArray(pace) ? pace : []}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(240,244,248,0.10)" />
                <XAxis dataKey="name" stroke="rgba(240,244,248,0.65)" />
                <YAxis stroke="rgba(240,244,248,0.65)" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(12,16,28,0.70)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(240,244,248,0.16)",
                  }}
                />
                <Area type="monotone" dataKey="lo" stackId="band" stroke="none" fill="rgba(0,0,0,0)" />
                <Area type="monotone" dataKey="band" stackId="band" stroke="none" fill="rgba(123,110,246,0.18)" />
                <Line type="monotone" dataKey="actual" stroke="var(--mint)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="forecast" stroke="var(--violet)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ opacity: 0.72, marginTop: 8 }}>
            Band shows forecast uncertainty. Use Simulation to see lift from fixes.
          </div>
        </Card>

        <Card title="Live alerts" right={<Pill tone="coral">SHIFTS</Pill>}>
          <div style={{ display: "grid", gap: 10 }}>
            {alertsState === "loading" && (
              <div style={{ display: "grid", gap: 10 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="glass sheen"
                    style={{
                      padding: 12,
                      borderRadius: 18,
                      border: "1px solid var(--glass-border)",
                      background: "linear-gradient(180deg, rgba(240,244,248,0.10), rgba(240,244,248,0.05))",
                    }}
                  >
                    <div style={{ height: 12, width: "65%", borderRadius: 999, background: "rgba(240,244,248,0.10)" }} />
                    <div style={{ marginTop: 10, height: 10, width: "90%", borderRadius: 999, background: "rgba(240,244,248,0.08)" }} />
                    <div style={{ marginTop: 6, height: 10, width: "78%", borderRadius: 999, background: "rgba(240,244,248,0.08)" }} />
                  </div>
                ))}
              </div>
            )}

            {alertsState === "error" && (
              <div style={{ opacity: 0.8 }}>
                Alerts are temporarily unavailable. (Demo functions may be cold-starting.)
                <div style={{ marginTop: 8 }}>
                  <a href="/alerts" style={{ textDecoration: "none" }}>
                    Open Alerts →
                  </a>
                </div>
              </div>
            )}

            {alertsState === "ready" && (
              <>
                {(Array.isArray(alerts) ? alerts : []).slice(0, 4).map((a: any) => (
                  <div
                    key={a?.id ?? Math.random()}
                    className="glass sheen"
                    style={{
                      padding: 12,
                      borderRadius: 18,
                      border: "1px solid var(--glass-border)",
                      background: "linear-gradient(180deg, rgba(240,244,248,0.10), rgba(240,244,248,0.05))",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 900 }}>{a?.title ?? "Alert"}</div>
                      <Pill tone={sevTone(String(a?.severity ?? "low")) as any}>
                        {String(a?.severity ?? "low").toUpperCase()}
                      </Pill>
                    </div>
                    <div style={{ marginTop: 6, opacity: 0.85, lineHeight: 1.45 }}>
                      {a?.message ?? ""}
                    </div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {(Array.isArray(a?.recommendedNext) ? a.recommendedNext : []).slice(0, 2).map((x: string, i: number) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 12,
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: "1px solid rgba(240,244,248,0.14)",
                            background: "rgba(240,244,248,0.04)",
                          }}
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <a href="/alerts" style={{ opacity: 0.8, textDecoration: "none" }}>
                  View all alerts →
                </a>
              </>
            )}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Funnel waterfall (constraint highlighted)" right={<Pill tone="mint">DIAGNOSTICS</Pill>}>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={Array.isArray(funnel) ? funnel : []}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(240,244,248,0.10)" />
                <XAxis dataKey="name" stroke="rgba(240,244,248,0.65)" />
                <YAxis stroke="rgba(240,244,248,0.65)" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(12,16,28,0.70)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(240,244,248,0.16)",
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 12, 12]}>
                  {Array.isArray(funnel)
                    ? funnel.map((entry: any, index: number) => (
                        <Cell key={"cell-" + index} fill={entry?.fill} />
                      ))
                    : null}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ opacity: 0.72, marginTop: 8 }}>Worst conversion step is coral (binding constraint).</div>
        </Card>

        <Card title="Channel mix (spend vs conversions)" right={<Pill tone="violet">MIX</Pill>}>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={Array.isArray(channelMix) ? channelMix : []}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(240,244,248,0.10)" />
                <XAxis dataKey="name" stroke="rgba(240,244,248,0.65)" />
                <YAxis stroke="rgba(240,244,248,0.65)" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(12,16,28,0.70)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(240,244,248,0.16)",
                  }}
                />
                <Legend />
                <Bar dataKey="GoogleSpend" stackId="a" fill="var(--mint)" />
                <Bar dataKey="MetaSpend" stackId="a" fill="var(--coral)" />
                <Bar dataKey="LinkedInSpend" stackId="a" fill="var(--violet)" />
                <Bar dataKey="GoogleConv" stackId="b" fill="rgba(62,205,163,0.45)" />
                <Bar dataKey="MetaConv" stackId="b" fill="rgba(240,113,103,0.45)" />
                <Bar dataKey="LinkedInConv" stackId="b" fill="rgba(123,110,246,0.45)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ opacity: 0.72, marginTop: 8 }}>Two stacks: Spend (a) and Conversions (b).</div>
        </Card>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <Card title="Top actions right now" right={<Pill tone="coral">NEXT BEST</Pill>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <ActionCard
              tone="mint"
              title="Fix Step 2 form friction"
              impact="+5–8% completion"
              steps={["Remove non-essential fields", "Enable autofill", "Validate GA4 step events"]}
            />
            <ActionCard
              tone="violet"
              title="Shift 15% retargeting → high-intent"
              impact="+3–6% incremental VP+"
              steps={["Reduce retargeting budgets", "Increase search + partner", "Reopen once completion recovers"]}
            />
            <ActionCard
              tone="coral"
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

function ActionCard(props: { tone: "mint" | "violet" | "coral"; title: string; impact: string; steps: string[] }) {
  const border =
    props.tone === "mint"
      ? "rgba(62,205,163,0.30)"
      : props.tone === "coral"
      ? "rgba(240,113,103,0.32)"
      : "rgba(123,110,246,0.30)";

  return (
    <div
      className="glass sheen"
      style={{
        padding: 14,
        borderRadius: 20,
        border: `1px solid ${border}`,
        WebkitBackdropFilter: "var(--blur)",
        backdropFilter: "var(--blur)",
        background: "linear-gradient(180deg, rgba(240,244,248,0.12), rgba(240,244,248,0.06))",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <div style={{ fontWeight: 950 }}>{props.title}</div>
        <Pill tone={props.tone as any}>{props.impact}</Pill>
      </div>
      <ol style={{ margin: "10px 0 0 18px", opacity: 0.9 }}>
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
  const points = weeks.map((w: any, i: number) => ({
    idx: i,
    name: `W${w.week}`,
    actual: weeks.slice(0, i + 1).reduce((s: number, x: any) => s + (x.ga4?.registration_complete || 0), 0),
    weekly: w.ga4?.registration_complete || 0,
  }));

  const last = points[points.length - 1];
  const horizon = 6;
  const recent = points.slice(Math.max(0, points.length - 4));
  const avgWeekly = recent.reduce((s: number, x: any) => s + x.weekly, 0) / Math.max(1, recent.length);
  const target = Math.round(last.actual * 1.12);

  const data: any[] = [];
  for (let i = 0; i < points.length + horizon; i++) {
    const base = i < points.length ? points[i].actual : Math.round(last.actual + avgWeekly * (i - (points.length - 1)));
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
  const steps = [
    { name: "Sessions", value: latest?.ga4?.sessions ?? 0 },
    { name: "LP views", value: latest?.ga4?.landing_page_views ?? 0 },
    { name: "Reg start", value: latest?.ga4?.registration_start ?? 0 },
    { name: "Reg complete", value: latest?.ga4?.registration_complete ?? 0 },
    { name: "Show-up", value: latest?.ga4?.show_up ?? 0 },
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
    fill: i === worstIdx ? "var(--coral)" : "var(--mint)",
  }));
}

function buildChannelMix(weeks: any[]) {
  return weeks.map((w: any) => ({
    name: `W${w.week}`,
    GoogleSpend: w?.channels?.google_ads?.spend ?? 0,
    MetaSpend: w?.channels?.meta_ads?.spend ?? 0,
    LinkedInSpend: w?.channels?.linkedin_ads?.spend ?? 0,
    GoogleConv: w?.channels?.google_ads?.conversions ?? 0,
    MetaConv: w?.channels?.meta_ads?.conversions ?? 0,
    LinkedInConv: w?.channels?.linkedin_ads?.conversions ?? 0,
  }));
}
