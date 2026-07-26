import { db } from "@/lib/db";
import { sendFollowUpEmail } from "@/lib/email";
import { sendFollowUpSms } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const due = await db.followUp.findMany({
    where: {
      status: "PENDING",
      scheduledAt: { lte: now },
    },
    include: {
      quote: {
        include: { user: true },
      },
    },
    take: 50,
  });

  const results = await Promise.allSettled(
    due.map(async (followUp) => {
      // Skip if quote no longer needs follow-up
      if (["ACCEPTED", "DECLINED", "EXPIRED"].includes(followUp.quote.status)) {
        await db.followUp.update({
          where: { id: followUp.id },
          data: { status: "SKIPPED" },
        });
        return;
      }

      try {
        if (followUp.channel === "SMS") {
          await sendFollowUpSms(followUp);
        } else {
          await sendFollowUpEmail(followUp);
        }
        await db.followUp.update({
          where: { id: followUp.id },
          data: { status: "SENT", sentAt: now },
        });
      } catch (err) {
        await db.followUp.update({
          where: { id: followUp.id },
          data: { status: "FAILED", error: String(err) },
        });
      }
    })
  );

  const failed = results.filter((r) => r.status === "rejected").length;

  return Response.json({
    processed: due.length,
    failed,
  });
}
