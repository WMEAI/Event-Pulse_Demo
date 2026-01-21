import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./api";
import type { WeekRecord } from "./types";
import { Shell, Card, Pill } from "./ui";
import { ResponsiveContainer, AreaChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, Cell } from "recharts";

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
  const weeksQ = useQuery({ queryKey: ["weeks"], queryFn: () => apiGet<WeekRecord[]>("/demo/weeks") });
  const alertsQ = useQuery({ queryKey: ["alerts"], queryFn: () => apiGet<any>("/demo/alerts") });

  // Fast-first-paint: render the command center as soon as weeks load.
  if (weeksQ.isLoading) {
    return (
      <Shell>
        <div className="glass sheen" style={{ padding: 18, maxWidth: 560 }}>
          <div style={{ fontSize: 18, fontWeight: 950 }}>Loading Command Center…</div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>Warming up data + forecasts.</div>
          <div style={{ marginTop: 12, height: 8, borderRadius: 999, background: "rgba(240,244,248,0.10)", overflow: "hidden" }}>
            <div style={{ width: "46%", height: "100%", borderRadius: 999, background: "linear-gradient(90deg, rgba(123,110,246,0.35), rgba(62,205,163,0.25))" }} />
          </div>
        </div>
      </Shell>
    );
  }
  if (weeksQ.isError) return <Shell><div>API error. Check /api/demo/weeks</div></Shell>;

  const weeksRaw: any = weeksQ.data;
  const weeks = Array.isArray(weeksRaw) ? weeksRaw : (weeksRaw?.weeks || weeksRaw?.data || []);
  if (!Array.isArray(weeks) || weeks.length === 0) {
    return (
      <Shell>
        <div className="glass sheen" style={{ padding: 18, maxWidth: 680 }}>
          <div style={{ fontSize: 18, fontWeight: 950 }}>No demo weeks data yet</div>
          <div style={{ opacity: 0.78, marginTop: 6 }}>The API returned an unexpected shape. Try again in a moment.</div>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75, whiteSpace: "pre-wrap" }}>{JSON.stringify(weeksRaw, null, 2)}</div>
          <div style={{ marginTop: 12 }}><a href="/overview" style={{ textDecoration: "none", opacity: 0.9 }}>Open Overview →</a></div>
        </div>
      </Shell>
    );
  }
  try {
  const latest: any = weeks[weeks.length - 1];
  const prev: any = weeks[weeks.length - 2] || latest;

  const completion = latest.ga4.registration_complete / Math.max(1, latest.ga4.registration_start);
  const completionPrev = prev.ga4.registration_complete / Math.max(1, prev.ga4.registration_start);
  const completionDelta = completion - completionPrev;

  const pace = useMemo(() => buildPaceForecast(weeks as any), [weeks]);
  const funnel = useMemo(() => buildFunnel(latest), [latest]);
  const channelMix = useMemo(() => buildChannelMix(weeks as any), [weeks]);

  const alerts = alertsQ.data?.alerts || [];
  const alertsState = alertsQ.isLoading ? "loading" : alertsQ.isError ? "error" : "ready";
  const sevTone = (s: string) => (s === "high" ? "coral" : s === "medium" ? "violet" : "mint");

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 950, letterSpacing: -0.6 }}>Command Center</div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>High‑energy ops room view: pace, constraints, channel mix, and alerts.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="dot" style={{ background: "var(--mint)", boxShadow: "0 0 0 6px rgba(62,205,163,0.12)" }} />
          <Pill tone="mint">LIVE</Pill>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
        <div className="kpi-tile sheen" style={{ padding: 16 }}>
          <div className="kpi-label">Registrations completed</div>
          <div className="kpi-value">{latest.ga4.registration_complete}</div>
          <div className="kpi-sub">Show‑up proxy: {latest.ga4.show_up}</div>
        </div>

        <div className="kpi-tile sheen" style={{ padding: 16 }}>
          <div className="kpi-label">Paid spend (week)</div>
          <div className="kpi-value">{money(latest.total_spend)}</div>
          <div className="kpi-sub">Blended CPA: {money(latest.blended_cpa)}</div>
        </div>

        <div
          className="kpi-tile sheen"
          style={{
            padding: 16,
            boxShadow: completionDelta < 0 ? "var(--shadow-soft)" : "var(--shadow-soft)"
          }}
        >
          <div className="kpi-label">Reg completion rate</div>
          <div className="kpi-value">{pct(completion)}</div>
          <div className="kpi-sub">
            Δ vs last week:{" "}
            <span style={{ color: completionDelta < 0 ? "var(--coral)" : "var(--mint)", fontWeight: 900 }}>
              {Math.round(completionDelta * 1000) / 10}pp
            </span>
          </div>
        </div>

        <div className="kpi-tile sheen" style={{ padding: 16 }}>
          <div className="kpi-label">Constraint</div>
          <div className="kpi-value" style={{ fontSize: 18, marginTop: 10 }}>Step 2 Drop‑off</div>
          <div className="kpi-sub">Fix this first to unlock lift.</div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}>
        <Card title="Registration pace forecast (demo)" right={<Pill tone="violet">FORECAST</Pill>}>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={pace}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(240,244,248,0.10)" />
                <XAxis dataKey="name" stroke="rgba(240,244,248,0.65)" />
                <YAxis stroke="rgba(240,244,248,0.65)" />
                <Tooltip contentStyle={{ background: "rgba(12,16,28,0.70)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(240,244,248,0.16)" }} />
                <Area type="monotone" dataKey="lo" stackId="band" stroke="none" fill="rgba(0,0,0,0)" />
                <Area type="monotone" dataKey="band" stackId="band" stroke="none" fill="rgba(123,110,246,0.18)" />
                <Line type="monotone" dataKey="actual" stroke="var(--mint)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="forecast" stroke="var(--violet)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ opacity: 0.72, marginTop: 8 }}>Band shows forecast uncertainty. Use Simulation to see lift from fixes.</div>
        </Card>

        <Card title="Live alerts" right={<Pill tone="coral">SHIFTS</Pill>}>
          <div style={{ display: "grid", gap: 10 }}>
            {alertsState === "loading" && (
              <div style={{ display: "grid", gap: 10 }}>
                {[0,1,2].map((i) => (
                  <div key={i} className="glass sheen" style={{ padding: 12, borderRadius: 18, border: "1px solid var(--glass-border)", background: "linear-gradient(180deg, rgba(240,244,248,0.10), rgba(240,244,248,0.05))" }}>
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
                <div style={{ marginTop: 8 }}><a href="/alerts" style={{ textDecoration: "none" }}>Open Alerts →</a></div>
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
                      borderRadius: 18,
                      border: "1px solid var(--glass-border)",
                      background: "linear-gradient(180deg, rgba(240,244,248,0.10), rgba(240,244,248,0.05))",
                      boxShadow: "var(--shadow-card)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 900 }}>{a.title}</div>
                      <Pill tone={sevTone(a.severity) as any}>{String(a.severity).toUpperCase()}</Pill>
                    </div>
                    <div style={{ marginTop: 6, opacity: 0.85, lineHeight: 1.45 }}>{a.message}</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {(a.recommendedNext || []).slice(0, 2).map((x: string, i: number) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 12,
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: "1px solid rgba(240,244,248,0.14)",
                            background: "rgba(240,244,248,0.04)"
                          }}
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <a href="/alerts" style={{ opacity: 0.8, textDecoration: "none" }}>View all alerts →</a>
              </>
            )}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Funnel waterfall (constraint highlighted)" right={<Pill tone="mint">DIAGNOSTICS</Pill>}>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={funnel}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(240,244,248,0.10)" />
                <XAxis dataKey="name" stroke="rgba(240,244,248,0.65)" />
                <YAxis stroke="rgba(240,244,248,0.65)" />
                <Tooltip contentStyle={{ background: "rgba(12,16,28,0.70)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(240,244,248,0.16)" }} />
                <Bar dataKey="value" radius={[12, 12, 12, 12]}>
                  {funnel.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ opacity: 0.72, marginTop: 8 }}>Worst conversion step is coral (binding constraint).</div>
        </Card>

        <Card title="Channel mix (spend vs conversions)" right={<Pill tone="violet">MIX</Pill>}>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={channelMix}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(240,244,248,0.10)" />
                <XAxis dataKey="name" stroke="rgba(240,244,248,0.65)" />
                <YAxis stroke="rgba(240,244,248,0.65)" />
                <Tooltip contentStyle={{ background: "rgba(12,16,28,0.70)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(240,244,248,0.16)" }} />
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

} catch (err: any) {
  console.error("CommandCenter render failed", err);
  return (
    <Shell>
      <div className="glass sheen" style={{ padding: 18, maxWidth: 720 }}>
        <div style={{ fontSize: 18, fontWeight: 950 }}>Command Center hit an error</div>
        <div style={{ opacity: 0.78, marginTop: 6, lineHeight: 1.45 }}>
          This is usually a temporary demo-data / cold-start hiccup. The app is still running — it just couldn't render this screen yet.
        </div>
        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75, whiteSpace: "pre-wrap" }}>
          {String(err?.message || err)}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <a href="/overview" style={{ textDecoration: "none" }}>
            <span style={{
              display:"inline-block",
              padding:"10px 14px",
              borderRadius:16,
              fontWeight:950,
              border:"1px solid rgba(240,244,248,0.18)",
              background:"linear-gradient(180deg, rgba(240,244,248,0.14), rgba(240,244,248,0.06))",
              WebkitBackdropFilter:"var(--blur)",
              backdropFilter:"var(--blur)"
            }}>Open Overview</span>
          </a>
          <a href="/" style={{ textDecoration: "none" }}>
            <span style={{
              display:"inline-block",
              padding:"10px 14px",
              borderRadius:16,
              fontWeight:950,
              border:"1px solid rgba(240,244,248,0.18)",
              background:"linear-gradient(180deg, rgba(240,244,248,0.10), rgba(240,244,248,0.04))",
              WebkitBackdropFilter:"var(--blur)",
              backdropFilter:"var(--blur)"
            }}>Retry Command Center</span>
          </a>
        </div>
      </div>
    </Shell>
  );
}
}

function ActionCard(props: { tone: "mint" | "violet" | "coral"; title: string; impact: string; steps: string[] }) {
  const glow = props.tone === "mint" ? "var(--glow-mint)" : props.tone === "coral" ? "var(--glow-coral)" : "var(--glow-violet)";
  const border = props.tone === "mint" ? "rgba(62,205,163,0.30)" : props.tone === "coral" ? "rgba(240,113,103,0.32)" : "rgba(123,110,246,0.30)";
  return (
    <div
      className="glass sheen"
      style={{
        padding: 14,
        borderRadius: 20,
        border: `1px solid ${border}` , WebkitBackdropFilter: "var(--blur)", backdropFilter: "var(--blur)",
        background: "linear-gradient(180deg, rgba(240,244,248,0.12), rgba(240,244,248,0.06))",
        boxShadow: "var(--shadow-soft)"
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
    weekly: w.ga4?.registration_complete || 0
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
      target
    });
  }
  return data;
}

function buildFunnel(latest: any) {
  const steps = [
    { name: "Sessions", value: latest.ga4.sessions },
    { name: "LP views", value: latest.ga4.landing_page_views },
    { name: "Reg start", value: latest.ga4.registration_start },
    { name: "Reg complete", value: latest.ga4.registration_complete },
    { name: "Show‑up", value: latest.ga4.show_up }
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

  return steps.map((s, i) => ({ ...s, fill: i === worstIdx ? "var(--coral)" : "var(--mint)" }));
}

function buildChannelMix(weeks: any[]) {
  return weeks.map((w: any) => ({
    name: `W${w.week}`,
    GoogleSpend: w.channels.google_ads.spend,
    MetaSpend: w.channels.meta_ads.spend,
    LinkedInSpend: w.channels.linkedin_ads.spend,
    GoogleConv: w.channels.google_ads.conversions,
    MetaConv: w.channels.meta_ads.conversions,
    LinkedInConv: w.channels.linkedin_ads.conversions
  }));
}
