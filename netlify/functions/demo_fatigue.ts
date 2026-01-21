import type { Handler } from "@netlify/functions";
import weeks from "./_data/demo_weeks.json";

export const handler: Handler = async () => {
  const w = weeks as any[];
  const latest = w[w.length - 1];
  const prev = w[w.length - 2] || latest;
  return { 
    statusCode: 200, 
    body: JSON.stringify({ 
      week: latest.week, 
      week_label: latest.week_label,
      fatigue: latest.creative_fatigue,
      deltas: latest.creative_fatigue.map((x: any) => {
        const p = (prev.creative_fatigue || []).find((y: any) => y.platform === x.platform) || x;
        return { platform: x.platform, frequency_delta: +(x.frequency - p.frequency).toFixed(2), ctr_delta: +(x.ctr - p.ctr).toFixed(4), fatigue_delta: +(x.fatigue_index - p.fatigue_index).toFixed(2) };
      })
    }) 
  };
};
