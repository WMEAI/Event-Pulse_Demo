import type { Handler } from "@netlify/functions";
import { sendEmail } from "./_shared/mailer";
import { buildDigestEmail } from "./_shared/emailTemplates";

import narrative from "./demo_narrative";
import alertsFn from "./demo_alerts";

export const handler: Handler = async (event) => {
  const when = (event.queryStringParameters?.when || "morning").toLowerCase();
  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || "http://localhost:8888";

  const n = JSON.parse((await (narrative as any).handler({} as any)).body);
  const a = JSON.parse((await (alertsFn as any).handler({} as any)).body);

  const topFixes = [
    {
      title: "Fix Step 2 drop-off in registration flow",
      impact: "+5–8% reg completion (demo)",
      confidence: "high",
      steps: ["Remove non-essential form fields", "Enable autofill / LinkedIn autofill where applicable", "Monitor step events daily and validate tracking"]
    },
    {
      title: "Shift 15% retargeting spend into high-intent acquisition",
      impact: "+3–6% incremental VP+ regs (demo)",
      confidence: "medium",
      steps: ["Reduce retargeting budgets across platforms", "Increase high-intent search and partner audiences", "Re-open retargeting once completion recovers"]
    },
    {
      title: "Refresh fatigued creatives and pivot VP+ messaging to outcomes",
      impact: "+2–4% CVR (demo)",
      confidence: "medium",
      steps: ["Refresh top creatives on fatigued platforms", "Test ‘pipeline outcomes’ vs ‘networking’ message", "Cap frequency and rotate weekly"]
    }
  ];

  const header =
    when === "afternoon"
      ? "4pm update — performance shifts, forecast risk, and next best actions."
      : "6am briefing — overnight changes, constraints, and what to do today.";

  const html = buildDigestEmail({
    productUrl: `${siteUrl}/`,
    header,
    narrative: n,
    alerts: a.alerts,
    topFixes
  });

  const subject = when === "afternoon" ? "Event Pulse — 4pm Debrief & Fix Plan" : "Event Pulse — 6am Briefing & Recommended Fixes";
  const to = process.env.EMAIL_TO || "";
  const res = await sendEmail({ to, subject, html });

  return { statusCode: 200, body: JSON.stringify({ ok: true, when, ...res }) };
};

// Default export wrapper for Netlify bundler compatibility
export default { handler };
