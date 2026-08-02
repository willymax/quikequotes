"use client";

import { useTransition } from "react";
import { sendQuote } from "@/app/actions/quotes";
import { useRouter } from "next/navigation";
import { buttonClass } from "@/lib/ui";

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
      className={buttonClass({ variant: "accent", className: "flex-1" })}
    >
      {isPending ? "Sending…" : status === "DRAFT" ? "Send to client" : "Resend"}
    </button>
  );
}
