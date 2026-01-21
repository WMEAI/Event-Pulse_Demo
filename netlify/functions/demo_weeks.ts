import type { Handler } from "@netlify/functions";
import weeks from "./_data/demo_weeks.json";

export const handler: Handler = async () => {
  return { statusCode: 200, body: JSON.stringify(weeks) };
};
