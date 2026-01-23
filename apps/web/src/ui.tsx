import React from "react";

export function Shell(props: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>
      <aside
        style={{
          padding: 18,
          borderRight: "1px solid var(--border)",
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.4))",
          boxShadow: "inset -1px 0 0 rgba(255,255,255,0.05)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 6,
              background: "var(--cyan)",
              boxShadow: "0 0 0 4px rgba(0, 242, 255, 0.15), 0 0 24px rgba(0, 242, 255, 0.3)"
            }}
          />
          <div style={{ fontWeight: 900, letterSpacing: 0.2, color: "var(--text)" }}>Event Pulse</div>
        </div>
        <div style={{ opacity: 0.6, marginTop: 6, fontSize: 12, color: "var(--text-secondary)" }}>AI Marketing Diagnostics</div>

        <nav style={{ marginTop: 18, display: "grid", gap: 6, fontSize: 14 }}>
          <NavLink href="/" label="Command Center" tone="cyan" active />
          <NavLink href="/overview" label="Overview" />
          <NavLink href="/funnel" label="Funnel X‑Ray" />
          <NavLink href="/roadmap" label="Roadmap" />
          <NavLink href="/simulate" label="Simulation" />
          <NavLink href="/integrations" label="Integrations" />
          <div style={{ height: 10 }} />
          <NavLink href="/alerts" label="Alerts" tone="critical" />
          <NavLink href="/segments" label="Segments" tone="cyan" />
          <NavLink href="/creative" label="Creative" tone="purple" />
          <NavLink href="/narrative" label="Exec Narrative" tone="purple" />
          <NavLink href="/copilot" label="AI Copilot" tone="cyan" />
        </nav>

        <div style={{ 
          marginTop: 22, 
          padding: 14, 
          borderRadius: 16, 
          background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", 
          border: "1px solid var(--glass-border)", 
          boxShadow: "var(--shadow-card)", 
          WebkitBackdropFilter: "var(--blur)", 
          backdropFilter: "var(--blur)" 
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.85, color: "var(--text)" }}>AI Analyst</div>
            <Pill tone="purple">ACTIVE</Pill>
          </div>
          <div style={{ fontSize: 13, marginTop: 8, opacity: 0.9, color: "var(--text)" }}>
            Monitoring shifts every 15 min.
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
            Evidence → Forecast → Actions
          </div>
        </div>
      </aside>

      <main style={{ padding: 22, background: "transparent" }}>{props.children}</main>
    </div>
  );
}

function NavLink(props: { href: string; label: string; tone?: "cyan" | "purple" | "critical" | "warning" | "success"; active?: boolean }) {
  const tone = props.tone ?? "purple";
  const dotColors: Record<string, string> = {
    cyan: "var(--cyan)",
    purple: "var(--purple)",
    critical: "var(--critical)",
    warning: "var(--warning)",
    success: "var(--success)"
  };
  const dot = dotColors[tone] || "var(--purple)";
  
  const glowColors: Record<string, string> = {
    cyan: "rgba(0, 242, 255, 0.15)",
    purple: "rgba(138, 43, 226, 0.15)",
    critical: "rgba(255, 77, 77, 0.15)",
    warning: "rgba(255, 138, 0, 0.15)",
    success: "rgba(34, 197, 94, 0.15)"
  };
  const glow = glowColors[tone] || "rgba(138, 43, 226, 0.15)";

  return (
    <a href={props.href} style={{ textDecoration: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 12,
          border: props.active ? "1px solid var(--border-active)" : "1px solid transparent",
          background: props.active ? "linear-gradient(90deg, rgba(0, 242, 255, 0.1) 0%, transparent 100%)" : "transparent",
          color: "var(--text)",
          opacity: 0.92,
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          if (!props.active) {
            (e.currentTarget as HTMLDivElement).style.border = "1px solid var(--border)";
            (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
          }
        }}
        onMouseLeave={(e) => {
          if (!props.active) {
            (e.currentTarget as HTMLDivElement).style.border = "1px solid transparent";
            (e.currentTarget as HTMLDivElement).style.background = "transparent";
          }
        }}
      >
        <span style={{ 
          width: 8, 
          height: 8, 
          borderRadius: 999, 
          background: dot, 
          boxShadow: `0 0 0 4px ${glow}` 
        }} />
        <span style={{ color: "var(--text)" }}>{props.label}</span>
      </div>
    </a>
  );
}

export function Card(props: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section
      className="glass"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid var(--glass-border)",
        borderRadius: 16,
        padding: 18,
        boxShadow: "var(--shadow-card)", 
        WebkitBackdropFilter: "var(--blur)", 
        backdropFilter: "var(--blur)",
        transition: "all 0.3s ease"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
        <div style={{ fontWeight: 700, color: "var(--text)" }}>{props.title}</div>
        {props.right}
      </div>
      <div style={{ marginTop: 12 }}>{props.children}</div>
    </section>
  );
}

export function Pill(props: { children: React.ReactNode; tone?: "cyan" | "purple" | "critical" | "warning" | "success" }) {
  const tone = props.tone ?? "purple";
  
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    cyan: {
      bg: "rgba(0, 242, 255, 0.15)",
      border: "rgba(0, 242, 255, 0.3)",
      text: "var(--cyan)"
    },
    purple: {
      bg: "rgba(138, 43, 226, 0.15)",
      border: "rgba(138, 43, 226, 0.3)",
      text: "var(--purple)"
    },
    critical: {
      bg: "rgba(255, 77, 77, 0.15)",
      border: "rgba(255, 77, 77, 0.3)",
      text: "var(--critical)"
    },
    warning: {
      bg: "rgba(255, 138, 0, 0.15)",
      border: "rgba(255, 138, 0, 0.3)",
      text: "var(--warning)"
    },
    success: {
      bg: "rgba(34, 197, 94, 0.15)",
      border: "rgba(34, 197, 94, 0.3)",
      text: "var(--success)"
    }
  };
  
  const c = colors[tone] || colors.purple;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 10px",
        borderRadius: 999,
        background: c.bg,
        border: `1px solid ${c.border}`,
        WebkitBackdropFilter: "var(--blur)", 
        backdropFilter: "var(--blur)",
        color: c.text,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: "uppercase"
      }}
    >
      {props.children}
    </span>
  );
}

export function Button(props: { children: React.ReactNode; onClick?: () => void; tone?: "cyan" | "purple" | "critical" | "warning" | "success"; style?: React.CSSProperties }) {
  const tone = props.tone ?? "cyan";
  
  const colors: Record<string, { bg: string; border: string; hoverBg: string }> = {
    cyan: {
      bg: "rgba(0, 242, 255, 0.15)",
      border: "rgba(0, 242, 255, 0.3)",
      hoverBg: "rgba(0, 242, 255, 0.25)"
    },
    purple: {
      bg: "rgba(138, 43, 226, 0.15)",
      border: "rgba(138, 43, 226, 0.3)",
      hoverBg: "rgba(138, 43, 226, 0.25)"
    },
    critical: {
      bg: "rgba(255, 77, 77, 0.15)",
      border: "rgba(255, 77, 77, 0.3)",
      hoverBg: "rgba(255, 77, 77, 0.25)"
    },
    warning: {
      bg: "rgba(255, 138, 0, 0.15)",
      border: "rgba(255, 138, 0, 0.3)",
      hoverBg: "rgba(255, 138, 0, 0.25)"
    },
    success: {
      bg: "rgba(34, 197, 94, 0.15)",
      border: "rgba(34, 197, 94, 0.3)",
      hoverBg: "rgba(34, 197, 94, 0.25)"
    }
  };
  
  const c = colors[tone] || colors.cyan;

  return (
    <button
      onClick={props.onClick}
      style={{
        padding: "10px 16px",
        borderRadius: 12,
        border: `1px solid ${c.border}`,
        WebkitBackdropFilter: "var(--blur)", 
        backdropFilter: "var(--blur)",
        background: c.bg,
        color: "var(--text)",
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
        transition: "all 0.2s ease",
        ...props.style
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = c.hoverBg;
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = c.bg;
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
      }}
    >
      {props.children}
    </button>
  );
}