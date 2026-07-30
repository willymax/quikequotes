import { NextResponse } from "next/server";
import { declineQuote } from "@/app/actions/quotes";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  await declineQuote(token);
  return NextResponse.redirect(new URL(`/q/${token}`, request.url), 303);
}
