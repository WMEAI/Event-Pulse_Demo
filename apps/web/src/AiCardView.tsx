import React from "react";
import type { AiCard } from "./types";
import { Card, Pill } from "./ui";

export function AiCardView({ card }: { card: AiCard }) {
  return (
    <Card title={card.title} right={<Pill tone={card.type==="alert" ? "coral" : card.type==="forecast" ? "violet" : "mint"}>{card.type.toUpperCase()}</Pill>}>
      <div style={{ display: "grid", gap: 10 }}>
        <div><b>Diagnosis:</b> {card.diagnosis}</div>
        <div><b>Why it matters:</b> {card.whyItMatters}</div>
        <div>
          <b>Evidence:</b>
          <ul style={{ margin: "6px 0 0 18px", opacity: 0.92 }}>
            {card.evidence.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
        <div>
          <b>Prediction:</b> {card.prediction.metric} lift {card.prediction.liftRange[0]}–{card.prediction.liftRange[1]}% (confidence {Math.round(card.prediction.confidence*100)}%) • {card.prediction.horizon}
        </div>
        <div>
          <b>Next best actions:</b>
          <ol style={{ margin: "6px 0 0 18px" }}>
            {card.recommendation.actions.map((a, i) => (
              <li key={i}>
                {a.label} <span style={{ opacity: 0.7 }}>({a.owner}, effort {a.effort}, ~{a.etaDays}d)</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Card>
  );
}
