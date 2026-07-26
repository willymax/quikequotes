import twilio from "twilio";
import type { FollowUp, Quote, User } from "@prisma/client";

let _client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!_client) {
    _client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }
  return _client;
}

type FollowUpWithQuoteAndUser = FollowUp & {
  quote: Quote & { user: User };
};

export async function sendFollowUpSms(followUp: FollowUpWithQuoteAndUser) {
  const { quote } = followUp;
  if (!quote.clientPhone) throw new Error("No client phone for SMS follow-up");

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/q/${quote.shareToken}`;
  const businessName = quote.user.businessName ?? "Your contractor";

  const messages: Record<string, string> = {
    DAY_1: `Hi ${quote.clientName}, ${businessName} sent you a quote. Any questions? View it here: ${url}`,
    DAY_7: `Hi ${quote.clientName}, just a reminder — ${businessName}'s quote is still available: ${url}. We're booking up for next month!`,
  };

  const body = messages[followUp.day] ?? messages.DAY_1;

  await getClient().messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: quote.clientPhone,
  });
}
