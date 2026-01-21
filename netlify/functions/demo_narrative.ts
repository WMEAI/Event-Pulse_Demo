import type { Handler } from "@netlify/functions";
import weeks from "./_data/demo_weeks.json";

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

  const vp = (latest.segments || []).find((s: any) => s.segment === "VP+ EMEA");
  const vpRes = (latest.message_resonance || []).find((x: any) => x.segment === "VP+ EMEA");

  const fatigueTop = (latest.creative_fatigue || []).slice().sort((a: any,b: any) => b.fatigue_index - a.fatigue_index)[0];

  const narrative = {
    title: `Weekly Exec Narrative — Week ${latest.week}`,
    summary: [
      `Registrations completed: ${latest.ga4.registration_complete} (show-ups forecast proxy: ${latest.ga4.show_up}).`,
      `Paid spend: ${money(latest.total_spend)} with blended CPA ${money(cpaLatest)} (prev ${money(cpaPrev)}).`,
      `Primary constraint: reg start → reg complete completion ${pct(completionLatest)}% (prev ${pct(completionPrev)}%).`
    ],
    whatChanged: [
      `Registration completion weakened while starts remained comparatively stable — indicates step-level friction rather than demand collapse.`,
      fatigueTop ? `Creative fatigue highest on ${fatigueTop.platform} (fatigue index ${fatigueTop.fatigue_index}, frequency ${fatigueTop.frequency}).` : "Creative fatigue unavailable.",
      vp ? `VP+ EMEA segment: ${vp.registrations} regs, ICP score ${vp.icp_score}.` : "VP+ segment unavailable."
    ],
    why: [
      "A late-stage reg-flow change (form complexity, autofill, validation errors) typically causes abrupt completion drops.",
      "Rising frequency with CTR decay is consistent with saturation/fatigue in retargeting-heavy mixes.",
      vpRes ? `Message resonance dipped for VP+ EMEA (score ${vpRes.resonance_score}) suggesting value prop mismatch.` : "Message resonance unavailable."
    ],
    next7DaysPlan: [
      "Fix step 2 friction: shorten fields, enable autofill, monitor step events daily.",
      "Rebalance spend: reduce retargeting by ~15% and move to high-intent search + partner audiences until completion recovers.",
      "Refresh creatives for fatigued platforms; shift VP+ messaging to ‘pipeline outcomes’ with proof points."
    ],
    forecast: {
      risk: completionLatest < completionPrev ? "elevated" : "stable",
      withFixes: "Forecast returns to target by ~Day -12 (demo assumption).",
      withoutFixes: "Risk of missing registration target by high single-digits (demo assumption)."
    }
  };

  return { statusCode: 200, body: JSON.stringify(narrative) };
};

// Default export wrapper for Netlify bundler compatibility
export default { handler };
