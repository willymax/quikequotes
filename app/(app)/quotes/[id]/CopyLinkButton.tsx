"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "copied" | "failed";

export function CopyLinkButton({ publicUrl }: { publicUrl: string }) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleCopy() {
    try {
      // Undefined on a non-secure origin — otherwise the click throws silently
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(publicUrl);
      setState("copied");
    } catch {
      setState("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`mt-2.5 block text-xs font-semibold underline underline-offset-4 ${
        state === "failed" ? "text-danger" : "text-ink"
      }`}
    >
      {state === "copied"
        ? "Copied!"
        : state === "failed"
          ? "Copy failed — select the link above"
          : "Copy link"}
    </button>
  );
}
