import type { Handler } from "@netlify/functions";
import taxonomy from "./_data/taxonomy.json";

export const handler: Handler = async () => {
  return { statusCode: 200, body: JSON.stringify(taxonomy) };
};
