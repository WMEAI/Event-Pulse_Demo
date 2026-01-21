import type { Handler } from "@netlify/functions";

/**
 * Demo scheduled job. In production, this would:
 * 1) pull GA4/Ads/HubSpot deltas
 * 2) update spine + lineage
 * 3) run anomaly + constraint + forecast refresh
 */
export const handler: Handler = async () => {
  return { statusCode: 200, body: JSON.stringify({ ok: true, demo: true, ranAt: new Date().toISOString() }) };
};
