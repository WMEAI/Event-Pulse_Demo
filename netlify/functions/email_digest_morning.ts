import type { Handler } from "@netlify/functions";
import digest from "./email_digest";
export const handler: Handler = async () => (digest as any).handler({ queryStringParameters: { when: "morning" } } as any);
