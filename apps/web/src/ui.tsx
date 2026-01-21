import React from "react";

export function Shell(props: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "100vh" }}>
      <aside
        style={{
          padding: 18,
          borderRight: "1px solid var(--border)",
          background: "linear-gradient(180deg, rgba(240,244,248,0.10), rgba(240,244,248,0.04))",boxShadow: "inset -1px 0 0 rgba(240,244,248,0.06)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 6,
              background: "var(--mint)",
              boxShadow: "0 0 0 4px rgba(62,205,163,0.12), 0 0 24px rgba(62,205,163,0.25)"
            }}
          />
          <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>Event Pulse</div>
        </div>
        <div style={{ opacity: 0.75, marginTop: 6, fontSize: 12 }}>AI Marketing Operating System (Demo)</div>

        <nav style={{ marginTop: 18, display: "grid", gap: 10, fontSize: 14 }}>
          <NavLink href="/" label="Command Center" tone="mint" />
          <NavLink href="/overview" label="Overview" />
          <NavLink href="/funnel" label="Funnel X‑Ray" />
          <NavLink href="/roadmap" label="Roadmap" />
          <NavLink href="/simulate" label="Simulation" />
          <NavLink href="/integrations" label="Integrations" />
          <div style={{ height: 10 }} />
          <NavLink href="/alerts" label="Alerts" tone="coral" />
          <NavLink href="/segments" label="Segments" tone="mint" />
          <NavLink href="/creative" label="Creative" tone="violet" />
          <NavLink href="/narrative" label="Exec Narrative" tone="violet" />
          <NavLink href="/copilot" label="AI Copilot" tone="mint" />
        </nav>

        <div style={{ marginTop: 22, padding: 14, borderRadius: 18, background: "rgba(240,244,248,0.05)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)", WebkitBackdropFilter: "var(--blur)", backdropFilter: "var(--blur)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.85 }}>AI Analyst</div>
            <Pill tone="violet">ACTIVE</Pill>
          </div>
          <div style={{ fontSize: 13, marginTop: 8, opacity: 0.9 }}>
            Monitoring shifts every 15 minutes.
          </div>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.72 }}>
            Evidence → Forecast → Actions → Learning loop
          </div>
        </div>
      </aside>

      <main style={{ padding: 22 }}>{props.children}</main>
    </div>
  );
}

function NavLink(props: { href: string; label: string; tone?: "mint" | "violet" | "coral" }) {
  const tone = props.tone ?? "violet";
  const dot = tone === "mint" ? "var(--mint)" : tone === "coral" ? "var(--coral)" : "var(--violet)";
  return (
    <a href={props.href} style={{ textDecoration: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 10px",
          borderRadius: 16,
          border: "1px solid transparent",
          color: "var(--text)",
          opacity: 0.92
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.border = "1px solid var(--border)";
          (e.currentTarget as HTMLDivElement).style.background = "rgba(240,244,248,0.04)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.border = "1px solid transparent";
          (e.currentTarget as HTMLDivElement).style.background = "transparent";
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 999, background: dot, boxShadow: `0 0 0 4px ${dot}22` }} />
        <span>{props.label}</span>
      </div>
    </a>
  );
}

export function Card(props: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section
      style={{
        background: "linear-gradient(180deg, rgba(240,244,248,0.10), rgba(240,244,248,0.04))",border: "1px solid var(--glass-border)",
        borderRadius: 24,
        padding: 16,
        boxShadow: "var(--shadow-card)", WebkitBackdropFilter: "var(--blur)", backdropFilter: "var(--blur)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
        <div style={{ fontWeight: 800 }}>{props.title}</div>
        {props.right}
      </div>
      <div style={{ marginTop: 10 }}>{props.children}</div>
    </section>
  );
}

export function Pill(props: { children: React.ReactNode; tone?: "mint" | "violet" | "coral" }) {
  const tone = props.tone ?? "violet";
  const bg =
    tone === "mint"
      ? "rgba(62,205,163,0.18)"
      : tone === "coral"
      ? "rgba(240,113,103,0.18)"
      : "rgba(123,110,246,0.18)";

  const border =
    tone === "mint"
      ? "rgba(62,205,163,0.35)"
      : tone === "coral"
      ? "rgba(240,113,103,0.35)"
      : "rgba(123,110,246,0.35)";

  const txt = tone === "mint" ? "var(--mint)" : tone === "coral" ? "var(--coral)" : "var(--violet)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        background: `linear-gradient(180deg, ${bg}, rgba(240,244,248,0.06))`,
        border: `1px solid ${border}` , WebkitBackdropFilter: "var(--blur)", backdropFilter: "var(--blur)",
        color: txt,
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: 0.35
      }}
    >
      {props.children}
    </span>
  );
}

export function Button(props: { children: React.ReactNode; onClick?: () => void; tone?: "mint" | "violet" | "coral"; style?: React.CSSProperties }) {
  const tone = props.tone ?? "coral";
  const bg =
    tone === "mint"
      ? "rgba(62,205,163,0.22)"
      : tone === "violet"
      ? "rgba(123,110,246,0.22)"
      : "rgba(240,113,103,0.22)";
  const border =
    tone === "mint"
      ? "rgba(62,205,163,0.35)"
      : tone === "violet"
      ? "rgba(123,110,246,0.35)"
      : "rgba(240,113,103,0.35)";

  return (
    <button
      onClick={props.onClick}
      style={{
        padding: "10px 14px",
        borderRadius: 16,
        border: `1px solid ${border}` , WebkitBackdropFilter: "var(--blur)", backdropFilter: "var(--blur)",
        background: `linear-gradient(180deg, ${bg}, rgba(240,244,248,0.06))`,
        color: "var(--text)",
        fontWeight: 950,
        cursor: "pointer",
        ...props.style
      }}
    >
      {props.children}
    </button>
  );
}
