import sgMail from "@sendgrid/mail";

type SendArgs = { to: string | string[]; subject: string; html: string; from?: string };

function env(name: string) {
  const v = process.env[name];
  return v ? v : "";
}

export async function sendEmail(args: SendArgs) {
  const apiKey = env("SENDGRID_API_KEY");
  const from = args.from || env("EMAIL_FROM") || "demo@eventpulse.local";
  const to = args.to || env("EMAIL_TO");

  const payload = { to, from, subject: args.subject, html: args.html };

  if (!apiKey || !to || String(from).endsWith(".local")) {
    console.log("[EMAIL_SIMULATED]", JSON.stringify(payload, null, 2));
    return { ok: true, simulated: true, payload };
  }

  sgMail.setApiKey(apiKey);
  await sgMail.send(payload as any);
  return { ok: true, simulated: false };
}
