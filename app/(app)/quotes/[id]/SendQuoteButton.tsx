"use client";

import { useTransition } from "react";
import { sendQuote } from "@/app/actions/quotes";
import { useRouter } from "next/navigation";

export function SendQuoteButton({
  quoteId,
  status,
}: {
  quoteId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSend() {
    startTransition(async () => {
      const result = await sendQuote(quoteId);
      if (result?.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={handleSend}
      disabled={isPending}
      className="flex-1 h-11 rounded-xl bg-zinc-900 text-white font-semibold text-sm disabled:opacity-60"
    >
      {isPending ? "Sending..." : status === "DRAFT" ? "Send to Client" : "Resend"}
    </button>
  );
}
