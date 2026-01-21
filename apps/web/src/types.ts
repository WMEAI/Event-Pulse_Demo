export type WeekRecord = {
  week: number;
  week_label: string;
  total_conversions: number;
  total_spend: number;
  blended_cpa: number;
  channels: {
    google_ads: { spend: number; conversions: number };
    meta_ads: { spend: number; conversions: number };
    linkedin_ads: { spend: number; conversions: number };
  };
  ga4: {
    sessions: number;
    landing_page_views: number;
    registration_start: number;
    registration_complete: number;
    show_up: number;
  };
  crm: {
    mql: number;
    sql: number;
    opportunities: number;
    won_deals: number;
    sponsor_pipeline: number;
    sponsor_closed: number;
  };
  email: {
    sends: number;
    delivered: number;
    open: number;
    click: number;
    bounce: number;
    complaint: number;
    unsub: number;
  };
};

export type AiCard = {
  id: string;
  type: "diagnosis" | "recommendation" | "alert" | "forecast";
  title: string;
  diagnosis: string;
  whyItMatters: string;
  evidence: { bullets: string[] };
  prediction: { metric: string; liftRange: [number, number]; confidence: number; horizon: string };
  recommendation: { actions: Array<{ label: string; owner: string; effort: "S" | "M" | "L"; etaDays: number }> };
};
