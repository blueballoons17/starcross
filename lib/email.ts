import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "StarCross <hello@starcross.app>";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

// ── Welcome email ─────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name?: string) {
  const resend = getResend();
  if (!resend) return; // no-op if not configured

  const firstName = name?.split(" ")[0] ?? "there";
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to StarCross ✦",
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#080B18;font-family:'Georgia',serif;color:#e7e5e4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;padding:0 20px;">
    <tr><td style="text-align:center;padding-bottom:32px;">
      <span style="font-size:28px;letter-spacing:0.18em;text-transform:uppercase;color:#fff;">
        ✦ StarCross
      </span>
    </td></tr>
    <tr><td style="background:#0f1220;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:40px 36px;">
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:600;color:#fff;line-height:1.2;">
        Welcome, ${firstName}.
      </h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a8a29e;">
        Your birth chart is your compass. StarCross uses your Sun, Moon, and Rising signs together to find people who are genuinely compatible with the way you think, feel, and connect.
      </p>
      <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#a8a29e;">
        Start by completing your profile — the more detail you give us, the more precisely the stars align you with someone real.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://starcross.app"}/profile"
         style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:999px;">
        Complete your profile →
      </a>
    </td></tr>
    <tr><td style="text-align:center;padding:28px 0 0;color:#44403c;font-size:12px;line-height:1.6;">
      You're receiving this because you created a StarCross account.<br/>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://starcross.app"}/privacy" style="color:#57534e;text-decoration:underline;">Privacy policy</a>
    </td></tr>
  </table>
</body>
</html>`,
  }).catch((err) => console.error("[email] welcome send failed:", err));
}

// ── Match notification ────────────────────────────────────────────────────────
export async function sendMatchEmail(opts: {
  toEmail: string;
  toName: string;
  matchName: string;
  matchScore: number;
  matchId: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const { toEmail, toName, matchName, matchScore, matchId } = opts;
  const firstName = toName.split(" ")[0];

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `You matched with ${matchName} ✨`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#080B18;font-family:'Georgia',serif;color:#e7e5e4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;padding:0 20px;">
    <tr><td style="text-align:center;padding-bottom:32px;">
      <span style="font-size:28px;letter-spacing:0.18em;text-transform:uppercase;color:#fff;">
        ✦ StarCross
      </span>
    </td></tr>
    <tr><td style="background:#0f1220;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:40px 36px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6366f1;">New match</p>
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:600;color:#fff;line-height:1.2;">
        You and ${matchName} liked each other.
      </h1>
      <p style="margin:0 0 8px;font-size:15px;color:#a8a29e;line-height:1.7;">
        Hi ${firstName} — the stars aligned. Your compatibility score with ${matchName} is <strong style="color:#fff;">${matchScore}%</strong>.
      </p>
      <p style="margin:0 0 32px;font-size:15px;color:#a8a29e;line-height:1.7;">
        Say hello before someone else does.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://starcross.app"}/messages/${matchId}"
         style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:999px;">
        Send a message →
      </a>
    </td></tr>
    <tr><td style="text-align:center;padding:28px 0 0;color:#44403c;font-size:12px;line-height:1.6;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://starcross.app"}/privacy" style="color:#57534e;text-decoration:underline;">Privacy policy</a>
    </td></tr>
  </table>
</body>
</html>`,
  }).catch((err) => console.error("[email] match send failed:", err));
}
