import type { Handler } from "@netlify/functions";
import weeks from "./_data/demo_weeks.json";

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }

export const handler: Handler = async (event) => {
  const url = new URL(event.rawUrl);
  const shift = parseFloat(url.searchParams.get("shiftRetargeting") || "0.0"); // 0..1
  const improve = parseFloat(url.searchParams.get("improveCompletion") || "0.0"); // absolute rate +0.06

  const w = weeks as any[];
  const latest = w[w.length - 1];

  const baseCompletion = latest.ga4.registration_complete / Math.max(1, latest.ga4.registration_start);
  const newCompletion = clamp(baseCompletion + improve, 0.05, 0.95);

  // simplistic response curve: shifting budget improves acquisition quality modestly when completion is healthy
  const budget = latest.total_spend;
  const liftFromShift = (shift * 0.05) * (newCompletion / Math.max(0.2, baseCompletion)); // scaled

  const newRegs = Math.round(latest.ga4.registration_complete * (1 + liftFromShift) * (newCompletion / baseCompletion));
  const newShow = Math.round(latest.ga4.show_up * (1 + liftFromShift) * 1.02);

  const out = {
    inputs: { shiftRetargeting: shift, improveCompletion: improve },
    baseline: {
      completionRate: baseCompletion,
      registrations: latest.ga4.registration_complete,
      showUps: latest.ga4.show_up,
      spend: budget
    },
    scenario: {
      completionRate: newCompletion,
      registrations: newRegs,
      showUps: newShow,
      impliedLiftPct: Math.round(((newRegs / latest.ga4.registration_complete) - 1) * 1000) / 10
    },
    notes: [
      "This demo uses a simplified response curve + funnel constraint scaling.",
      "In production, this would use channel response curves, pace models, and incrementality-aware adjustments."
    ]
  };

  return { statusCode: 200, body: JSON.stringify(out) };
};
