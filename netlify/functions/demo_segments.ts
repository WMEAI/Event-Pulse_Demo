import type { Handler } from "@netlify/functions";
import weeks from "./_data/demo_weeks.json";

export const handler: Handler = async () => {
  const w = weeks as any[];
  const latest = w[w.length - 1];
  return { statusCode: 200, body: JSON.stringify({ week: latest.week, week_label: latest.week_label, segments: latest.segments }) };
};
