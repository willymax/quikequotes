import { Resend } from "resend";
import type { FollowUp, Quote, User } from "@prisma/client";

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

type FollowUpWithQuoteAndUser = FollowUp & {
  quote: Quote & { user: User };
};

export async function sendFollowUpEmail(followUp: FollowUpWithQuoteAndUser) {
  const { quote } = followUp;
  if (!quote.clientEmail)
    throw new Error("No client email for email follow-up");

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/q/${quote.shareToken}`;
  const trackingPixel = `${process.env.NEXT_PUBLIC_APP_URL}/api/track/open?t=${quote.shareToken}`;
  const businessName = quote.user.businessName ?? "Your contractor";

  const subjects: Record<string, string> = {
    DAY_3: `Following up on your quote from ${businessName}`,
  };

  const bodies: Record<string, string> = {
    DAY_3: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <p>Hi ${quote.clientName},</p>
        <p>${businessName} sent you a quote a few days ago. Do you have any questions?</p>
        <p>
          <a href="${url}" style="display:inline-block;padding:14px 28px;background:#18181b;color:#fff;font-weight:700;border-radius:12px;text-decoration:none;">
            View Quote
          </a>
        </p>
        <p style="font-size:12px;color:#71717a;">
          This quote is for ${quote.title}. Reply to this email with any questions.
        </p>
        <img src="${trackingPixel}" width="1" height="1" alt="" style="display:block;" />
      </div>
    `,
  };

  const subject = subjects[followUp.day] ?? `Quote from ${businessName}`;
  const html = bodies[followUp.day] ?? bodies.DAY_3;

  await getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to: quote.clientEmail,
    subject,
    html,
  });
}

export async function sendQuoteNotificationEmail(
  quote: Quote & { user: User },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _user?: User
) {
  if (!quote.clientEmail) return;

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/q/${quote.shareToken}`;
  const trackingPixel = `${process.env.NEXT_PUBLIC_APP_URL}/api/track/open?t=${quote.shareToken}`;
  const businessName = quote.user.businessName ?? "Your contractor";

  await getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to: quote.clientEmail,
    subject: `Your quote from ${businessName} is ready`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <p>Hi ${quote.clientName},</p>
        <p>${businessName} has sent you a quote for <strong>${quote.title}</strong>.</p>
        <p>
          <a href="${url}" style="display:inline-block;padding:14px 28px;background:#18181b;color:#fff;font-weight:700;border-radius:12px;text-decoration:none;">
            View &amp; Accept Quote
          </a>
        </p>
        <p style="font-size:12px;color:#71717a;">
          You can review options, ask questions, and sign directly from the link above.
        </p>
        <img src="${trackingPixel}" width="1" height="1" alt="" style="display:block;" />
      </div>
    `,
  });
}
