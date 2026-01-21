import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, API_BASE } from "./api";
import { Shell, Card, Pill, Button } from "./ui";
import type { WeekRecord } from "./types";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from "recharts";

export function AlertsPage() {
  const q = useQuery({ queryKey: ["alerts"], queryFn: () => apiGet<any>("/demo/alerts") });
  if (q.isLoading) return <Shell><div>Loading…</div></Shell>;
  const data = q.data!;
  return (
    <Shell>
      <div style={{ fontSize: 22, fontWeight: 850 }}>Alerts</div>
      <div style={{ opacity: 0.75, marginTop: 6 }}>Plain-language alerts triggered by performance shifts.</div>

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        {data.alerts.map((a: any) => (
          <Card key={a.id} title={a.title} right={<Pill tone={a.severity==="high" ? "coral" : a.severity==="medium" ? "violet" : "mint"}>{String(a.severity).toUpperCase()}</Pill>}>
            <div style={{ opacity: 0.9 }}>{a.message}</div>
            <div style={{ marginTop: 10, fontWeight: 700 }}>Recommended next:</div>
            <ul style={{ margin: "6px 0 0 18px" }}>
              {a.recommendedNext.map((x: string, i: number) => <li key={i}>{x}</li>)}
            </ul>
          </Card>
        ))}
      </div>
    </Shell>
  );
}

export function SegmentsPage() {
  const seg = useQuery({ queryKey: ["segments"], queryFn: () => apiGet<any>("/demo/segments") });
  const weeksQ = useQuery({ queryKey: ["weeks"], queryFn: () => apiGet<WeekRecord[]>("/demo/weeks") });

  if (seg.isLoading || weeksQ.isLoading) return <Shell><div>Loading…</div></Shell>;
  const latest = seg.data!;
  const weeks = weeksQ.data!;

  const chartData = useMemo(() => {
    return weeks.map(w => {
      const vp = (w as any).segments?.find((s: any) => s.segment === "VP+ EMEA");
      const smb = (w as any).segments?.find((s: any) => s.segment === "SMB Prospect");
      return {
        name: `W${w.week}`,
        vpRegs: vp?.registrations ?? 0,
        vpIcp: vp?.icp_score ?? 0,
        smbRegs: smb?.registrations ?? 0
      };
    });
  }, [weeks]);

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 850 }}>Segments & Quality</div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>Attendee quality is the product — not just volume.</div>
        </div>
        <Pill>Latest: {latest.week_label}</Pill>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
        <Card title="VP+ EMEA registrations trend">
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.15)" }} />
                <Line type="monotone" dataKey="vpRegs" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="smbRegs" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>Signals ICP drift when VP+ volume falls while SMB rises.</div>
        </Card>

        <Card title="Latest segment snapshot">
          <div style={{ display: "grid", gap: 10 }}>
            {latest.segments.map((s: any) => (
              <div key={s.segment} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 700 }}>{s.segment}</div>
                <div style={{ opacity: 0.9 }}>
                  {s.registrations} regs • ICP {s.icp_score} • show {Math.round(s.show_up_rate*100)}%
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Shell>
  );
}

export function CreativePage() {
  const q = useQuery({ queryKey: ["fatigue"], queryFn: () => apiGet<any>("/demo/fatigue") });
  if (q.isLoading) return <Shell><div>Loading…</div></Shell>;
  const data = q.data!;
  const rows = data.fatigue.map((f: any) => {
    const d = data.deltas.find((x: any) => x.platform === f.platform);
    return { ...f, ...d };
  });

  const chartData = rows.map((r: any) => ({
    name: r.platform.replace("_", " "),
    fatigue: r.fatigue_index,
    frequency: r.frequency
  }));

  return (
    <Shell>
      <div style={{ fontSize: 22, fontWeight: 850 }}>Creative & Message Diagnostics</div>
      <div style={{ opacity: 0.75, marginTop: 6 }}>Cross-channel fatigue detection + refresh recommendations.</div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
        <Card title="Fatigue index by platform">
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.15)" }} />
                <Legend />
                <Bar dataKey="fatigue" />
                <Bar dataKey="frequency" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Recommended actions">
          <ol style={{ margin: "6px 0 0 18px" }}>
            {rows.filter((r: any) => r.recommended_refresh).map((r: any) => (
              <li key={r.platform}>
                Refresh creatives on <b>{r.platform}</b> (fatigue {r.fatigue_index}, freq {r.frequency}, CTR {r.ctr})
              </li>
            ))}
            <li>Cap frequency on retargeting sets and rotate new value props.</li>
            <li>Run message variant test: “pipeline outcomes” vs “networking”.</li>
          </ol>
        </Card>
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        {rows.map((r: any) => (
          <Card key={r.platform} title={r.platform.replace("_", " ").toUpperCase()} right={<Pill>{r.recommended_refresh ? "REFRESH" : "OK"}</Pill>}>
            <div style={{ display: "grid", gap: 6, opacity: 0.92 }}>
              <div>Frequency: <b>{r.frequency}</b> (Δ {r.frequency_delta})</div>
              <div>CTR: <b>{r.ctr}</b> (Δ {r.ctr_delta})</div>
              <div>Fatigue index: <b>{r.fatigue_index}</b> (Δ {r.fatigue_delta})</div>
              <div>CPA: <b>{r.cpa ?? "—"}</b></div>
            </div>
          </Card>
        ))}
      </div>
    </Shell>
  );
}

export function NarrativePage() {
  const q = useQuery({ queryKey: ["narrative"], queryFn: () => apiGet<any>("/demo/narrative") });
  if (q.isLoading) return <Shell><div>Loading…</div></Shell>;
  const n = q.data!;
  return (
    <Shell>
      <div style={{ fontSize: 22, fontWeight: 850 }}>Exec Narrative</div>
      <div style={{ opacity: 0.75, marginTop: 6 }}>Auto-generated weekly CMO-ready storyline (demo).</div>

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <Card title={n.title} right={<Pill>{String(n.forecast.risk).toUpperCase()}</Pill>}>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 800 }}>Summary</div>
              <ul style={{ margin: "6px 0 0 18px" }}>{n.summary.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>What changed</div>
              <ul style={{ margin: "6px 0 0 18px" }}>{n.whatChanged.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>Why</div>
              <ul style={{ margin: "6px 0 0 18px" }}>{n.why.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>Next 7 days plan</div>
              <ol style={{ margin: "6px 0 0 18px" }}>{n.next7DaysPlan.map((x: string, i: number) => <li key={i}>{x}</li>)}</ol>
            </div>
            <div style={{ opacity: 0.85 }}>
              <b>Forecast:</b> With fixes: {n.forecast.withFixes} • Without fixes: {n.forecast.withoutFixes}
            </div>
          </div>
        </Card>
      </div>
    </Shell>
  );
}

export function CopilotPage() {
  const [msg, setMsg] = useState("");
  const [thread, setThread] = useState<Array<{ role: "user"|"ai"; text: string }>>([
    { role: "ai", text: "Hi — I’m your AI Marketing Analyst (demo). Ask about bottlenecks, budget shifts, creative fatigue, segment quality, or weekly narrative." }
  ]);

  async function send() {
    const text = msg.trim();
    if (!text) return;
    setThread(t => [...t, { role: "user", text }]);
    setMsg("");
    const res = await fetch(`${API_BASE}/copilot_chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    setThread(t => [...t, { role: "ai", text: data.reply }]);
  }

  return (
    <Shell>
      <div style={{ fontSize: 22, fontWeight: 850 }}>AI Copilot</div>
      <div style={{ opacity: 0.75, marginTop: 6 }}>Conversational analyst interface (simulated in demo).</div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <Card title="Conversation">
          <div style={{ display: "grid", gap: 10 }}>
            {thread.map((m, i) => (
              <div key={i} style={{
                padding: 10,
                borderRadius: 14,
                background: m.role === "ai" ? "rgba(110,168,254,0.12)" : "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)"
              }}>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>{m.role === "ai" ? "AI Analyst" : "You"}</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Ask: What changed this week and why?"
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid var(--glass-border-strong)",
                background: "linear-gradient(180deg, rgba(240,244,248,0.12), rgba(240,244,248,0.06))",
            WebkitBackdropFilter: "var(--blur)",
            backdropFilter: "var(--blur)",
                color: "#e8ecff"
              }}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            />
            <Button tone="coral" onClick={send}>Send</Button>
          </div>
        </Card>

        <Card title="Suggested prompts">
          <ul style={{ margin: "6px 0 0 18px" }}>
            <li>What changed this week and why?</li>
            <li>Where is the bottleneck and what should we fix first?</li>
            <li>Should we cut retargeting and reallocate budget?</li>
            <li>Is creative fatigue impacting results?</li>
            <li>Are we drifting away from VP+ EMEA quality?</li>
          </ul>
        </Card>
      </div>
    </Shell>
  );
}
