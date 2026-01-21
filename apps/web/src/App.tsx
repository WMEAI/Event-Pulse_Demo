import React from "react";
import { Routes, Route } from "react-router-dom";
import { Overview, FunnelXray, Roadmap, Simulation, Integrations } from "./pages";
import { CommandCenter } from "./commandCenter";
import { AlertsPage, SegmentsPage, CreativePage, NarrativePage, CopilotPage } from "./extraPages";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CommandCenter />} />
      <Route path="/overview" element={<Overview />} />
      <Route path="/funnel" element={<FunnelXray />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/simulate" element={<Simulation />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/segments" element={<SegmentsPage />} />
      <Route path="/creative" element={<CreativePage />} />
      <Route path="/narrative" element={<NarrativePage />} />
      <Route path="/copilot" element={<CopilotPage />} />
    </Routes>
  );
}
