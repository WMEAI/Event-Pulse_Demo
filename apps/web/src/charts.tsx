import React from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from "recharts";
import type { WeekRecord } from "./types";

export function PaceChart({ weeks }: { weeks: WeekRecord[] }) {
  const data = weeks.map(w => ({ name: `W${w.week}`, regs: w.ga4.registration_complete, show: w.ga4.show_up }));
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
          <YAxis stroke="rgba(255,255,255,0.6)" />
          <Tooltip contentStyle={{ background: "rgba(12,16,28,0.70)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)" }} />
          <Line type="monotone" dataKey="regs" stroke="var(--mint)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="show" stroke="var(--violet)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SpendChart({ weeks }: { weeks: WeekRecord[] }) {
  const data = weeks.map(w => ({
    name: `W${w.week}`,
    Google: w.channels.google_ads.spend,
    Meta: w.channels.meta_ads.spend,
    LinkedIn: w.channels.linkedin_ads.spend
  }));
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
          <YAxis stroke="rgba(255,255,255,0.6)" />
          <Tooltip contentStyle={{ background: "rgba(12,16,28,0.70)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)" }} />
          <Legend />
          <Bar dataKey="Google" fill="var(--mint)" />
          <Bar dataKey="Meta" fill="var(--coral)" />
          <Bar dataKey="LinkedIn" fill="var(--violet)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
