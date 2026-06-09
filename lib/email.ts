import { Resend } from "resend";

const FROM    = process.env.EMAIL_FROM    ?? "Kindred Stars <hello@kindredstars.org>";
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "admin.kindredstars@gmail.com";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

// ── Welcome email ─────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name?: string) {
  const resend = getResend();
  if (!resend) return; // no-op if not configured

  const firstName = name?.split(" ")[0] ?? "there";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kindredstars.org";

  await resend.emails.send({
    from: FROM,
    to,
    reply_to: REPLY_TO,
    subject: "Welcome to Kindred Stars ✦",
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#080B18;font-family:'Georgia',serif;color:#e7e5e4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;padding:0 20px;">
    <tr><td style="text-align:center;padding-bottom:32px;">
      <span style="font-size:28px;letter-spacing:0.18em;text-transform:uppercase;color:#fff;">
        ✦ Kindred Stars
      </span>
    </td></tr>
    <tr><td style="background:#0f1220;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:40px 36px;">
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:600;color:#fff;line-height:1.2;">
        Welcome, ${firstName}.
      </h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a8a29e;">
        Your birth chart is your compass. Kindred Stars uses your Sun, Moon, and Rising signs together to find people who are genuinely compatible with the way you think, feel, and connect.
      </p>
      <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#a8a29e;">
        Start by completing your profile. The more detail you give us, the more precisely the stars align you with someone real.
      </p>
      <a href="${appUrl}/profile"
         style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:999px;">
        Complete your profile →
      </a>
    </td></tr>
    <tr><td style="text-align:center;padding:28px 0 0;color:#44403c;font-size:12px;line-height:1.6;">
      You're receiving this because you created a Kindred Stars account.<br/>
      <a href="${appUrl}/privacy" style="color:#57534e;text-decoration:underline;">Privacy policy</a>
    </td></tr>
  </table>
</body>
</html>`,
  }).catch((err) => console.error("[email] welcome send failed:", err));
}

// ── Subscription confirmation ─────────────────────────────────────────────────
export async function sendSubscriptionConfirmationEmail(to: string, name?: string) {
  const resend = getResend();
  if (!resend) return;

  const firstName = name?.split(" ")[0] ?? "there";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kindredstars.org";

  await resend.emails.send({
    from: FROM,
    to,
    reply_to: REPLY_TO,
    subject: "You're now a Kindred Stars+ member ✦",
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#080B18;font-family:'Georgia',serif;color:#e7e5e4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;padding:0 20px;">
    <tr><td style="text-align:center;padding-bottom:32px;">
      <span style="font-size:28px;letter-spacing:0.18em;text-transform:uppercase;color:#fff;">
        ✦ Kindred Stars
      </span>
    </td></tr>
    <tr><td style="background:#0f1220;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:40px 36px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6366f1;">Kindred Stars+</p>
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:600;color:#fff;line-height:1.2;">
        Welcome to the full experience, ${firstName}.
      </h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#a8a29e;">
        Your subscription is active. You now have unlimited matches, full synastry reports for every profile, and priority placement in the feed.
      </p>
      <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#a8a29e;">
        The stars have a lot more to show you.
      </p>
      <a href="${appUrl}/matches"
         style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:999px;">
        See your matches →
      </a>
    </td></tr>
    <tr><td style="text-align:center;padding:28px 0 0;color:#44403c;font-size:12px;line-height:1.6;">
      You're receiving this because you subscribed to Kindred Stars+.<br/>
      <a href="${appUrl}/privacy" style="color:#57534e;text-decoration:underline;">Privacy policy</a>
    </td></tr>
  </table>
</body>
</html>`,
  }).catch((err) => console.error("[email] subscription confirmation send failed:", err));
}

// ── User report: admin notification ──────────────────────────────────────────
export async function sendReportEmail(opts: {
  reporterEmail: string;
  reporterName: string;
  reportedName: string;
  reportedEmail: string;
  reportedUserId: string;
  reason: string;
  details?: string | null;
}) {
  const resend = getResend();
  if (!resend) return;

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin.kindredstars@gmail.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kindredstars.org";

  const reasonLabel: Record<string, string> = {
    spam: "Spam or scam",
    harassment: "Harassment or mean behavior",
    fake_profile: "Fake or impersonation account",
    inappropriate_content: "Inappropriate photos or content",
    underage: "Appears to be underage",
    other: "Other",
  };

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    reply_to: REPLY_TO,
    subject: `[Kindred Stars] User report: ${opts.reportedName} (${opts.reason})`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,sans-serif;color:#1c1917;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;padding:0 20px;">
    <tr><td style="background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:32px 36px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#ef4444;">
        User Report Received
      </p>
      <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#0c0a09;">
        ${opts.reportedName} was reported
      </h1>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td style="padding:10px 14px;background:#fef2f2;border-radius:8px 8px 0 0;border:1px solid #fecaca;">
            <p style="margin:0;font-size:12px;font-weight:600;color:#991b1b;text-transform:uppercase;letter-spacing:0.08em;">Reported User</p>
            <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#1c1917;">${opts.reportedName}</p>
            <p style="margin:2px 0 0;font-size:13px;color:#78716c;">${opts.reportedEmail}</p>
            <p style="margin:2px 0 0;font-size:12px;color:#a8a29e;font-family:monospace;">${opts.reportedUserId}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 14px;background:#f7f6f5;border-radius:0 0 8px 8px;border:1px solid #e7e5e4;border-top:0;">
            <p style="margin:0;font-size:12px;font-weight:600;color:#57534e;text-transform:uppercase;letter-spacing:0.08em;">Reported By</p>
            <p style="margin:4px 0 0;font-size:14px;color:#1c1917;">${opts.reporterName} · ${opts.reporterEmail}</p>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td style="padding:12px 14px;background:#fff7ed;border-radius:8px;border:1px solid #fed7aa;">
            <p style="margin:0;font-size:12px;font-weight:600;color:#9a3412;text-transform:uppercase;letter-spacing:0.08em;">Reason</p>
            <p style="margin:6px 0 0;font-size:15px;font-weight:600;color:#1c1917;">${reasonLabel[opts.reason] ?? opts.reason}</p>
            ${opts.details ? `<p style="margin:8px 0 0;font-size:14px;color:#57534e;line-height:1.6;white-space:pre-wrap;">${opts.details}</p>` : ""}
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:13px;color:#a8a29e;">
        Review and take action from your admin dashboard, or reply to this email.
      </p>
    </td></tr>
    <tr><td style="text-align:center;padding:20px 0 0;font-size:11px;color:#a8a29e;">
      Kindred Stars admin alert · <a href="${appUrl}" style="color:#a8a29e;">${appUrl}</a>
    </td></tr>
  </table>
</body>
</html>`,
  }).catch((err) => console.error("[email] report send failed:", err));
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kindredstars.org";

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    reply_to: REPLY_TO,
    subject: `You matched with ${matchName} ✨`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#080B18;font-family:'Georgia',serif;color:#e7e5e4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;padding:0 20px;">
    <tr><td style="text-align:center;padding-bottom:32px;">
      <span style="font-size:28px;letter-spacing:0.18em;text-transform:uppercase;color:#fff;">
        ✦ Kindred Stars
      </span>
    </td></tr>
    <tr><td style="background:#0f1220;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:40px 36px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6366f1;">New match</p>
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:600;color:#fff;line-height:1.2;">
        You and ${matchName} liked each other.
      </h1>
      <p style="margin:0 0 8px;font-size:15px;color:#a8a29e;line-height:1.7;">
        Hi ${firstName}, your compatibility score with ${matchName} is <strong style="color:#fff;">${matchScore}%</strong>.
      </p>
      <p style="margin:0 0 32px;font-size:15px;color:#a8a29e;line-height:1.7;">
        Say hello before someone else does.
      </p>
      <a href="${appUrl}/messages/${matchId}"
         style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:999px;">
        Send a message →
      </a>
    </td></tr>
    <tr><td style="text-align:center;padding:28px 0 0;color:#44403c;font-size:12px;line-height:1.6;">
      <a href="${appUrl}/privacy" style="color:#57534e;text-decoration:underline;">Privacy policy</a>
    </td></tr>
  </table>
</body>
</html>`,
  }).catch((err) => console.error("[email] match send failed:", err));
}
