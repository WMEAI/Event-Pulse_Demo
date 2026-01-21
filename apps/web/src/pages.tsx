import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./api";
import type { WeekRecord, AiCard } from "./types";
import { Shell, Card, Pill } from "./ui";
import { PaceChart, SpendChart } from "./charts";
import { AiCardView } from "./AiCardView";

function useDemo() {
  return useQuery({
    queryKey: ["demo"],
    queryFn: async () => {
      const weeks = await apiGet<WeekRecord[]>("/demo/weeks");
      const cards = await apiGet<AiCard[]>("/demo/cards");
      const taxonomy = await apiGet<any>("/demo/taxonomy");
      return { weeks, cards, taxonomy };
    }
  });
}

export function Overview() {
  const q = useDemo();
  if (q.isLoading) return <Shell><div>Loading…</div></Shell>;
  if (q.isError) return <Shell><div>API error loading demo. Check /api/demo/weeks in your browser.</div></Shell>;
  const { weeks, cards, taxonomy } = q.data!;
  const latest = weeks[weeks.length - 1];

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 850 }}>{taxonomy.eventName}</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>AI-powered diagnostics + forecasting + roadmap (simulated)</div>
        </div>
        <Pill tone="mint">LIVE SIGNALS</Pill>
      </div>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
        <Card title="Registrations (latest)"><div style={{ fontSize: 22, fontWeight: 800 }}>{latest.ga4.registration_complete}</div></Card>
        <Card title="Show-ups (latest)"><div style={{ fontSize: 22, fontWeight: 800 }}>{latest.ga4.show_up}</div></Card>
        <Card title="Paid spend (latest)"><div style={{ fontSize: 22, fontWeight: 800 }}>£{latest.total_spend.toFixed(0)}</div></Card>
        <Card title="Blended CPA (latest)"><div style={{ fontSize: 22, fontWeight: 800 }}>£{latest.blended_cpa.toFixed(2)}</div></Card>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
        <Card title="Always‑on alerts"><div style={{ opacity: 0.85 }}>Plain-language alerts fire when shifts occur. See <a href="/alerts">Alerts</a>.</div></Card>
        <Card title="Quality & ICP drift"><div style={{ opacity: 0.85 }}>Segment-level ICP scoring + cohort trends. See <a href="/segments">Segments</a>.</div></Card>
        <Card title="Exec narrative"><div style={{ opacity: 0.85 }}>Auto-generated weekly storyline for leadership. See <a href="/narrative">Exec Narrative</a>.</div></Card>
      </div>


      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
        <Card title="Registration pace (complete vs show-up)">
          <PaceChart weeks={weeks} />
        </Card>
        <Card title="Paid spend by platform">
          <SpendChart weeks={weeks} />
        </Card>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        {cards.map(c => <AiCardView key={c.id} card={c} />)}
      </div>
    </Shell>
  );
}

export function FunnelXray() {
  const q = useDemo();
  if (q.isLoading) return <Shell><div>Loading…</div></Shell>;
  const { weeks } = q.data!;
  const latest = weeks[weeks.length - 1];
  const steps = [
    ["Sessions", latest.ga4.sessions],
    ["LP Views", latest.ga4.landing_page_views],
    ["Reg Start", latest.ga4.registration_start],
    ["Reg Complete", latest.ga4.registration_complete],
    ["Show-up", latest.ga4.show_up],
  ];
  return (
    <Shell>
      <div style={{ fontSize: 22, fontWeight: 850 }}>Funnel X‑Ray</div>
      <div style={{ opacity: 0.75, marginTop: 6 }}>Binding constraint detection (demo heuristic).</div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 12 }}>
        {steps.map(([k,v]) => (
          <Card key={String(k)} title={String(k)}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{Number(v).toLocaleString()}</div>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <Card title="Constraint (detected)">
          <div style={{ fontSize: 16 }}>
            <b>Registration Start → Registration Complete</b> is the bottleneck. Completion rate dropped materially in the last 3 weeks (simulated),
            while upstream sessions and starts stayed stable.
          </div>
          <ul style={{ margin: "10px 0 0 18px" }}>
            <li>Primary hypothesis: form friction / step 2 drop-off</li>
            <li>Secondary: message mismatch for VP+ segment</li>
            <li>Tertiary: deliverability risk (complaints up) reducing nurture effectiveness</li>
          </ul>
        </Card>
      </div>
    </Shell>
  );
}

export function Roadmap() {
  const q = useDemo();
  if (q.isLoading) return <Shell><div>Loading…</div></Shell>;
  const { cards } = q.data!;
  const items = cards.flatMap(c => c.recommendation.actions.map(a => ({ card: c.title, ...a })));
  return (
    <Shell>
      <div style={{ fontSize: 22, fontWeight: 850 }}>AI Roadmap (auto‑prioritized)</div>
      <div style={{ opacity: 0.75, marginTop: 6 }}>Impact × effort × time-to-event (demo scoring).</div>

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        {items.map((it, idx) => (
          <Card key={idx} title={`${idx+1}. ${it.label}`} right={<Pill>{it.owner}</Pill>}>
            <div style={{ opacity: 0.85 }}>Origin: {it.card}</div>
            <div style={{ marginTop: 6 }}>Effort: <b>{it.effort}</b> • ETA: <b>{it.etaDays} days</b></div>
          </Card>
        ))}
      </div>
    </Shell>
  );
}

export function Simulation() {
  const q = useDemo();
  const sim = useQuery({
    queryKey: ["sim"],
    queryFn: async () => apiGet<any>("/demo/simulate?shiftRetargeting=0.15&improveCompletion=0.06")
  });

  return (
    <Shell>
      <div style={{ fontSize: 22, fontWeight: 850 }}>Simulation</div>
      <div style={{ opacity: 0.75, marginTop: 6 }}>Demo scenario: shift 15% retargeting spend + improve completion by 6% absolute.</div>

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <Card title="Scenario output">
          {sim.isLoading ? "Running…" : sim.isError ? "Error" : (
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 13, opacity: 0.9 }}>
{JSON.stringify(sim.data, null, 2)}
            </pre>
          )}
        </Card>
      </div>
    </Shell>
  );
}

export function Integrations() {
  return (
    <Shell>
      <div style={{ fontSize: 22, fontWeight: 850 }}>Integrations</div>
      <div style={{ opacity: 0.75, marginTop: 6 }}>This demo runs on simulated + imported PPC weekly data. Real OAuth connectors come next.</div>
      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <Card title="Planned connectors (phase 1)">
          <ul style={{ margin: "6px 0 0 18px" }}>
            <li>GA4</li>
            <li>HubSpot</li>
            <li>Google Ads + YouTube</li>
            <li>LinkedIn Ads</li>
            <li>Meta Ads</li>
            <li>Email Marketing (ESP connectors)</li>
          </ul>
        </Card>
        <Card title="Data quality guardrails (from your ads plan)">
          <div style={{ opacity: 0.9 }}>
            Conversion actions must be consistently defined and imported (Tag Manager → GA4 → Google Ads), with primary/secondary actions maintained.
          </div>
        </Card>
      </div>
    </Shell>
  );
}
