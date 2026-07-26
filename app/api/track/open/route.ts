import { db } from "@/lib/db";

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t");

  if (token) {
    try {
      const quote = await db.quote.findUnique({ where: { shareToken: token } });
      if (quote && quote.status === "SENT" && !quote.viewedAt) {
        await db.quote.update({
          where: { id: quote.id },
          data: { viewedAt: new Date(), status: "VIEWED" },
        });
      }
    } catch {
      // Non-fatal — don't break email rendering
    }
  }

  return new Response(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
