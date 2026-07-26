import { addDays } from "date-fns";
import { db } from "./db";

export async function scheduleFollowUps(quoteId: string) {
  const now = new Date();
  await db.followUp.createMany({
    data: [
      {
        quoteId,
        day: "DAY_1",
        channel: "SMS",
        status: "PENDING",
        scheduledAt: addDays(now, 1),
      },
      {
        quoteId,
        day: "DAY_3",
        channel: "EMAIL",
        status: "PENDING",
        scheduledAt: addDays(now, 3),
      },
      {
        quoteId,
        day: "DAY_7",
        channel: "SMS",
        status: "PENDING",
        scheduledAt: addDays(now, 7),
      },
    ],
    skipDuplicates: true,
  });
}

export async function cancelPendingFollowUps(quoteId: string) {
  await db.followUp.updateMany({
    where: { quoteId, status: "PENDING" },
    data: { status: "SKIPPED" },
  });
}
