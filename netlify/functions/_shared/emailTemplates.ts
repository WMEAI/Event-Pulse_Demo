type Alert = { title: string; severity: string; message: string; recommendedNext: string[] };
type Narrative = {
  title: string;
  summary: string[];
  whatChanged: string[];
  why: string[];
  next7DaysPlan: string[];
  forecast: { risk: string; withFixes: string; withoutFixes: string };
};

function badge(text: string, tone: "mint"|"violet"|"coral") {
  const bg = tone==="mint" ? "#3ECDA32E" : tone==="coral" ? "#F071672E" : "#7B6EF62E";
  const border = tone==="mint" ? "#3ECDA359" : tone==="coral" ? "#F0716759" : "#7B6EF659";
  const color = tone==="mint" ? "#3ECDA3" : tone==="coral" ? "#F07167" : "#7B6EF6";
  return `<span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${bg};border:1px solid ${border};color:${color};font-weight:800;font-size:12px;letter-spacing:.4px">${text}</span>`;
}

function card(title: string, body: string) {
  return `
  <div style="border:1px solid rgba(240,244,248,0.14);border-radius:18px;padding:14px;margin:12px 0;background:rgba(240,244,248,0.06)">
    <div style="font-weight:900;margin-bottom:8px">${title}</div>
    <div style="opacity:.92;line-height:1.5">${body}</div>
  </div>`;
}

export function buildDigestEmail(opts: {
  productUrl: string;
  header: string;
  narrative: Narrative;
  alerts: Alert[];
  topFixes: Array<{ title: string; impact: string; confidence: string; steps: string[] }>;
}) {
  const { productUrl, header, narrative, alerts, topFixes } = opts;

  const alertsHtml = alerts.map(a => {
    const tone = a.severity==="high" ? "coral" : a.severity==="medium" ? "violet" : "mint";
    return card(`${badge(a.severity.toUpperCase(), tone as any)}&nbsp;&nbsp;${a.title}`, `
      <div>${a.message}</div>
      <div style="margin-top:10px;font-weight:800">Recommended fixes</div>
      <ul style="margin:6px 0 0 18px">${a.recommendedNext.map(x=>`<li>${x}</li>`).join("")}</ul>
    `);
  }).join("");

  const fixesHtml = topFixes.map(f => card(
    `${badge(f.confidence.toUpperCase(), "violet")} &nbsp;&nbsp; ${f.title} <span style="opacity:.7">(${f.impact})</span>`,
    `<ol style="margin:6px 0 0 18px">${f.steps.map(x=>`<li>${x}</li>`).join("")}</ol>`
  )).join("");

  const narrativeHtml = card(narrative.title, `
    <div style="font-weight:800;margin-top:6px">Summary</div>
    <ul style="margin:6px 0 0 18px">${narrative.summary.map(x=>`<li>${x}</li>`).join("")}</ul>

    <div style="font-weight:800;margin-top:10px">What changed</div>
    <ul style="margin:6px 0 0 18px">${narrative.whatChanged.map(x=>`<li>${x}</li>`).join("")}</ul>

    <div style="font-weight:800;margin-top:10px">Why</div>
    <ul style="margin:6px 0 0 18px">${narrative.why.map(x=>`<li>${x}</li>`).join("")}</ul>

    <div style="font-weight:800;margin-top:10px">Recommended plan</div>
    <ol style="margin:6px 0 0 18px">${narrative.next7DaysPlan.map(x=>`<li>${x}</li>`).join("")}</ol>

    <div style="margin-top:10px;opacity:.9"><b>Forecast:</b> ${badge(narrative.forecast.risk.toUpperCase(), narrative.forecast.risk==="elevated" ? "coral" : "mint")}<br/>
    <div style="margin-top:6px">With fixes: ${narrative.forecast.withFixes}</div>
    <div>Without fixes: ${narrative.forecast.withoutFixes}</div>
    </div>
  `);

  return `
  <div style="background:#0b1020;color:#F0F4F8;padding:26px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
    <div style="max-width:860px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:12px;height:12px;border-radius:6px;background:#3ECDA3;box-shadow:0 0 0 4px rgba(62,205,163,0.12),0 0 24px rgba(62,205,163,0.25)"></div>
        <div style="font-weight:950;letter-spacing:.2px">Event Pulse</div>
        <div style="margin-left:auto">${badge("AI DIGEST", "violet")}</div>
      </div>

      <div style="margin-top:10px;opacity:.85">${header}</div>
      <div style="margin-top:14px">
        <a href="${productUrl}" style="color:#F0F4F8;text-decoration:none;border:1px solid rgba(240,244,248,0.18);padding:10px 14px;border-radius:14px;display:inline-block;background:rgba(240,113,103,0.18)">
          Open Event Pulse dashboard
        </a>
      </div>

      ${narrativeHtml}

      ${alerts.length ? card("Live alerts (last check)", alertsHtml) : ""}
      ${card("Top recommended fixes (ranked)", fixesHtml)}

      <div style="opacity:.65;margin-top:18px;font-size:12px">
        This is a demo digest. In production, every recommendation includes data lineage and measurable lift tracking.
      </div>
    </div>
  </div>`;
}
