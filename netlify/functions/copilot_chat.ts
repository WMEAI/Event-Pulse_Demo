import type { Handler } from "@netlify/functions";
import weeks from "./_data/demo_weeks.json";

/**
 * Simulated copilot:
 * - Uses simple intent heuristics over the latest week
 * - Returns an 'analyst-style' response with reasoning + suggested actions
 * In production this endpoint would call an LLM + tool functions.
 */
export const handler: Handler = async (event) => {
  const body = event.body ? JSON.parse(event.body) : { message: "" };
  const message = String(body.message || "").toLowerCase();

  const w = weeks as any[];
  const latest = w[w.length - 1];
  const prev = w[w.length - 2] || latest;

  const completionLatest = latest.ga4.registration_complete / Math.max(1, latest.ga4.registration_start);
  const completionPrev = prev.ga4.registration_complete / Math.max(1, prev.ga4.registration_start);

  const fatigueTop = (latest.creative_fatigue || []).slice().sort((a: any,b: any) => b.fatigue_index - a.fatigue_index)[0];

  let answer = "";
  if (message.includes("what changed") || message.includes("why")) {
    answer = `This week, the biggest change is a drop in registration completion (start→complete) from ${(completionPrev*100).toFixed(1)}% to ${(completionLatest*100).toFixed(1)}%. Starts are not collapsing, so the constraint is in the reg flow (often Step 2 friction, validation errors, or UX).`;
  } else if (message.includes("retarget") || message.includes("budget")) {
    answer = `Given completion is currently the binding constraint, incremental value from retargeting is likely lower. A safe move is to shift ~15% retargeting spend into high-intent acquisition (search) and partner audiences until completion recovers. Then re-open retargeting once the funnel is healthy.`;
  } else if (message.includes("creative") || message.includes("fatigue")) {
    answer = fatigueTop
      ? `Creative fatigue is highest on ${fatigueTop.platform}. Frequency is ${fatigueTop.frequency} with fatigue index ${fatigueTop.fatigue_index}. Recommend: refresh top 3 creatives, cap frequency, and rotate new value-prop variants (pipeline outcomes vs networking).`
      : "I don't have fatigue data for this week in the demo.";
  } else if (message.includes("vp") || message.includes("quality") || message.includes("icp")) {
    const vp = (latest.segments || []).find((s: any) => s.segment === "VP+ EMEA");
    answer = vp
      ? `VP+ EMEA has ${vp.registrations} registrations this week with ICP score ${vp.icp_score}. If the goal is higher-quality attendance, bias spend + messaging toward VP+ segments on LinkedIn, and reduce broad/SMB expansion until late-stage conversion is repaired.`
      : "Segment quality data isn't available in this demo slice.";
  } else {
    answer = `Ask me about: completion drop-off, retargeting budget shifts, creative fatigue, VP+ quality, or weekly narrative. (This is a simulated copilot in the demo.)`;
  }

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      reply: answer,
      suggestedPrompts: [
        "What changed this week and why?",
        "Where is the bottleneck and what should we fix first?",
        "Should we cut retargeting and reallocate budget?",
        "Is creative fatigue impacting results?",
        "Are we drifting away from VP+ EMEA quality?"
      ]
    })
  };
};
