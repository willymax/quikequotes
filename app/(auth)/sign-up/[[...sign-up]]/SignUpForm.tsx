"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buttonClass, inputClass, labelClass } from "@/lib/ui";
import { MailIcon } from "@/app/components/icons";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/settings`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setVerifying(true);
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <div className="text-center space-y-3">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-wash text-amber-deep">
          <MailIcon size={22} />
        </span>
        <p className="font-semibold">Check your email</p>
        <p className="text-sm text-ink-muted leading-relaxed">
          A confirmation link is on its way to{" "}
          <span className="font-semibold text-ink">{email}</span>. Open it to
          activate your account.
        </p>
        <button
          type="button"
          onClick={() => router.push("/sign-in")}
          className="text-sm font-semibold text-ink underline underline-offset-4"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass()} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass()}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className={labelClass()} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass()}
          placeholder="At least 8 characters"
        />
      </div>

      {error && <p className="text-sm text-danger font-semibold">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={buttonClass({ variant: "accent", size: "lg", block: true })}
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-ink font-semibold underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
