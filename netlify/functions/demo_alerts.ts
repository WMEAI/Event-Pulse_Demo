import type { Handler } from "@netlify/functions";
import weeks from "./_data/demo_weeks.json";

function pct(n: number) { return Math.round(n*1000)/10; }

export const handler: Handler = async () => {
  const w = weeks as any[];
  const latest = w[w.length - 1];
  const prev = w[w.length - 2] || latest;

  const completionLatest = latest.ga4.registration_complete / Math.max(1, latest.ga4.registration_start);
  const completionPrev = prev.ga4.registration_complete / Math.max(1, prev.ga4.registration_start);

  const complaintRateLatest = latest.email.complaint / Math.max(1, latest.email.delivered);
  const complaintRatePrev = prev.email.complaint / Math.max(1, prev.email.delivered);

  const vpSeg = (latest.segments || []).find((s: any) => s.segment === "VP+ EMEA");
  const vpPrev = (prev.segments || []).find((s: any) => s.segment === "VP+ EMEA");

  const alerts = [
    {
      id: "pace-risk",
      severity: completionLatest < completionPrev ? "high" : "medium",
      title: "Pace risk: registration completion weakening",
      message: `Completion rate is ${pct(completionLatest)}% vs ${pct(completionPrev)}% last week. Primary constraint: Step 2 drop-off.`,
      recommendedNext: ["Shorten form + enable autofill", "Validate GA4 step events and conversion imports"]
    },
    {
      id: "deliverability",
      severity: complaintRateLatest > complaintRatePrev ? "medium" : "low",
      title: "Deliverability risk: complaint rate trend",
      message: `Complaints per 10k delivered: ${(complaintRateLatest*10000).toFixed(2)} vs ${(complaintRatePrev*10000).toFixed(2)}.`,
      recommendedNext: ["Suppress 90-day unengaged segment", "Tighten value framing for VP+ audiences"]
    },
    {
      id: "icp-drift",
      severity: (vpSeg && vpPrev && vpSeg.icp_score < vpPrev.icp_score) ? "medium" : "low",
      title: "Audience quality: ICP drift in VP+ EMEA",
      message: vpSeg && vpPrev
        ? `VP+ EMEA ICP score is ${vpSeg.icp_score} vs ${vpPrev.icp_score} last week, with reg share ${vpSeg.registrations}/${latest.ga4.registration_complete}.`
        : "Segment data unavailable.",
      recommendedNext: ["Shift budget to VP+ segments on LinkedIn", "Update messaging from networking → pipeline outcomes"]
    }
  ];

  return { statusCode: 200, body: JSON.stringify({ week: latest.week, week_label: latest.week_label, alerts }) };
};

// Default export wrapper for Netlify bundler compatibility
export default { handler };
