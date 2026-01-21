import type { Handler } from "@netlify/functions";
import weeks from "./_data/demo_weeks.json";
import { sendEmail } from "./_shared/mailer";
import { buildDigestEmail } from "./_shared/emailTemplates";
import narrative from "./demo_narrative";
import alertsFn from "./demo_alerts";

function pct(n: number) { return Math.round(n*1000)/10; }
function money(n: number) { return `£${Math.round(n).toLocaleString()}`; }

export const handler: Handler = async () => {
  const w = weeks as any[];
  const latest = w[w.length - 1];
  const prev = w[w.length - 2] || latest;

  const completionLatest = latest.ga4.registration_complete / Math.max(1, latest.ga4.registration_start);
  const completionPrev = prev.ga4.registration_complete / Math.max(1, prev.ga4.registration_start);

  const cpaLatest = latest.blended_cpa;
  const cpaPrev = prev.blended_cpa;

  const completionDelta = completionLatest - completionPrev;
  const cpaDelta = (cpaPrev > 0) ? (cpaLatest - cpaPrev) / cpaPrev : 0;

  const bigDown = completionDelta <= -0.05 || cpaDelta >= 0.20;
  const bigUp = completionDelta >= 0.05 || cpaDelta <= -0.20;

  if (!bigDown && !bigUp) {
    return { statusCode: 200, body: JSON.stringify({ ok: true, sent: false, reason: "no major shift" }) };
  }

  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || "http://localhost:8888";
  const n = JSON.parse((await (narrative as any).handler({} as any)).body);
  const a = JSON.parse((await (alertsFn as any).handler({} as any)).body);

  const headline = bigDown ? "MAJOR DOWNTICK" : "MAJOR UPTICK";
  const header = bigDown
    ? `Real-time alert — completion fell to ${pct(completionLatest)}% (Δ ${pct(completionDelta)}pp) or CPA jumped to ${money(cpaLatest)}.`
    : `Real-time alert — completion rose to ${pct(completionLatest)}% (Δ +${pct(completionDelta)}pp) or CPA improved to ${money(cpaLatest)}.`;

  const html = buildDigestEmail({
    productUrl: `${siteUrl}/alerts`,
    header,
    narrative: n,
    alerts: a.alerts,
    topFixes: [
      { title: "Check tracking integrity + conversion imports", impact: "protects decisions", confidence: "high", steps: ["Verify GA4 key events fired", "Confirm Google Ads conversion imports", "Confirm no landing changes broke flow"] },
      { title: "Apply emergency budget shift / scaling move", impact: "stabilize pace", confidence: "medium", steps: ["If down: pause worst CPA adsets and cap frequency", "If up: scale best cohort and refresh creatives to avoid fatigue"] }
    ]
  });

  const subject = `Event Pulse ALERT — ${headline} detected`;
  const to = process.env.EMAIL_TO || "";
  const res = await sendEmail({ to, subject, html });

  return { statusCode: 200, body: JSON.stringify({ ok: true, sent: true, headline, completionDelta, cpaDelta, ...res }) };
};
