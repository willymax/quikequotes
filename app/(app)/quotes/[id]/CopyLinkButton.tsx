"use client";

import { useState } from "react";

export function CopyLinkButton({ publicUrl }: { publicUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mt-2 text-xs font-medium text-zinc-900 underline underline-offset-2"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
