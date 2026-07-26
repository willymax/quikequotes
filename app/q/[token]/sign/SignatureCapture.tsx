"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import SignaturePad from "signature_pad";
import { acceptQuote } from "@/app/actions/quotes";
import { useRouter } from "next/navigation";

export function SignatureCapture({
  token,
  tierId,
  clientName,
}: {
  token: string;
  tierId: string;
  clientName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [name, setName] = useState(clientName);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // Scale for device pixel ratio to avoid blurry signatures on HiDPI
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(ratio, ratio);

    padRef.current = new SignaturePad(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
    });
    padRef.current.addEventListener("endStroke", () => {
      setIsEmpty(padRef.current?.isEmpty() ?? true);
    });

    return () => {
      padRef.current?.off();
    };
  }, []);

  function clearPad() {
    padRef.current?.clear();
    setIsEmpty(true);
  }

  function handleAccept() {
    if (!padRef.current || padRef.current.isEmpty()) {
      setError("Please sign above before accepting.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    const signatureDataUrl = padRef.current.toDataURL("image/png");
    setError("");

    startTransition(async () => {
      const result = await acceptQuote({
        token,
        signatureDataUrl,
        signedByName: name.trim(),
        acceptedTierId: tierId,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push(`/q/${token}`);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="signerName">
          Your Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="signerName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-12 px-4 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium">
            Signature <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={clearPad}
            className="text-xs text-zinc-500 underline"
          >
            Clear
          </button>
        </div>
        <div className="rounded-xl border-2 border-zinc-300 bg-white overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-40 touch-none block"
            style={{ touchAction: "none" }}
          />
        </div>
        <p className="text-xs text-zinc-400 mt-1.5">Sign in the box above with your finger or mouse.</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}

      <button
        type="button"
        onClick={handleAccept}
        disabled={isPending || isEmpty}
        className="w-full h-12 rounded-xl bg-zinc-900 text-white font-bold text-base disabled:opacity-50"
      >
        {isPending ? "Accepting..." : "Accept & Sign"}
      </button>

      <p className="text-xs text-zinc-400 text-center leading-relaxed">
        By clicking &quot;Accept &amp; Sign,&quot; you agree to the terms of this quote and
        authorize the work described above.
      </p>
    </div>
  );
}
