import type { Handler } from "@netlify/functions";
import weeks from "./_data/demo_weeks.json";

function pct(a: number, b: number) {
  if (!b) return 0;
  return (a / b) * 100;
}

export const handler: Handler = async () => {
  const w = weeks as any[];
  const latest = w[w.length - 1];
  const prev = w[w.length - 2] || latest;
  const prev3 = w.slice(-4, -1);

  const completionLatest = latest.ga4.registration_complete / Math.max(1, latest.ga4.registration_start);
  const completionPrevAvg = prev3.reduce((s, x) => s + (x.ga4.registration_complete / Math.max(1, x.ga4.registration_start)), 0) / Math.max(1, prev3.length);

  const complaintsRateLatest = latest.email.complaint / Math.max(1, latest.email.delivered);
  const complaintsRatePrev = prev.email.complaint / Math.max(1, prev.email.delivered);

  const blendedCpaLatest = latest.blended_cpa;
  const blendedCpaPrev = prev.blended_cpa;

  const cards = [
    {
      id: "constraint-step2",
      type: "diagnosis",
      title: "Binding constraint: registration completion drop (Step 2 friction)",
      diagnosis: `Registration completion rate dropped to ${pct(completionLatest, 1).toFixed(1)}% (vs ~${pct(completionPrevAvg, 1).toFixed(1)}% recent baseline).`,
      whyItMatters: "This is the highest-leverage fix because it lifts every channel and improves forecasted pace with minimal budget.",
      evidence: {
        bullets: [
          "Reg starts stayed stable while completions fell (downstream leakage).",
          `Latest: ${latest.ga4.registration_start} starts → ${latest.ga4.registration_complete} completes.`,
          "Pattern is concentrated in the most recent weeks (suggesting a site/reg-flow change)."
        ]
      },
      prediction: { metric: "Registrations", liftRange: [5, 8], confidence: 0.78, horizon: "next 14 days" },
      recommendation: {
        actions: [
          { label: "Remove non-essential fields + enable autofill on step 2", owner: "web", effort: "M", etaDays: 3 },
          { label: "Add GA4 step event logging + validate conversion imports", owner: "analytics", effort: "S", etaDays: 2 },
          { label: "Run 2-variant form experiment (short vs long)", owner: "marketing", effort: "M", etaDays: 7 }
        ]
      }
    },
    {
      id: "retargeting-cannibalization",
      type: "recommendation",
      title: "Paid efficiency: rebalance retargeting and prospecting (cross-platform)",
      diagnosis: `Blended CPA moved from £${blendedCpaPrev.toFixed(2)} → £${blendedCpaLatest.toFixed(2)} while completions weakened.`,
      whyItMatters: "When completions weaken, retargeting spend often becomes less incremental. Budget is better allocated to high-intent acquisition or partners until completion is repaired.",
      evidence: {
        bullets: [
          "CPA worsening coincides with completion drop-off (conversion pipeline degraded).",
          "Meta and LinkedIn conversions appear flatter relative to spend growth (demo inference).",
          "Reallocating can stabilize pace while you fix the bottleneck."
        ]
      },
      prediction: { metric: "Incremental VP+ registrations", liftRange: [3, 6], confidence: 0.62, horizon: "next 21 days" },
      recommendation: {
        actions: [
          { label: "Shift 15% retargeting budget → high-intent search + partner audiences", owner: "paid media", effort: "S", etaDays: 2 },
          { label: "Cap frequency and refresh top creatives (fatigue control)", owner: "creative", effort: "M", etaDays: 5 }
        ]
      }
    },
    {
      id: "deliverability-risk",
      type: "alert",
      title: "Email risk: complaints increasing (deliverability warning)",
      diagnosis: `Complaint rate moved ${(complaintsRatePrev*10000).toFixed(2)} → ${(complaintsRateLatest*10000).toFixed(2)} per 10k delivered (demo).`,
      whyItMatters: "Deliverability issues reduce nurture contribution and show-up reinforcement — critical close to event date.",
      evidence: {
        bullets: [
          "Complaints rose in the most recent week while opens declined (signal of inbox placement risk).",
          "Segment hygiene and cadence adjustments typically improve within days.",
          "This impacts show-up and late-stage conversions."
        ]
      },
      prediction: { metric: "Show-up rate", liftRange: [2, 4], confidence: 0.58, horizon: "next 10 days" },
      recommendation: {
        actions: [
          { label: "Suppress unengaged 90-day segment + warm engaged segment", owner: "email", effort: "S", etaDays: 2 },
          { label: "Tighten subject/value framing for VP+ segments", owner: "marketing", effort: "S", etaDays: 3 }
        ]
      }
    }
  ];

  return { statusCode: 200, body: JSON.stringify(cards) };
};
