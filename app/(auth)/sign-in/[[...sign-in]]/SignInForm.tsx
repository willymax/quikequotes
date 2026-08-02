"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buttonClass, inputClass, labelClass } from "@/lib/ui";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass()}
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-sm text-danger font-semibold">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={buttonClass({ variant: "accent", size: "lg", block: true })}
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-ink-muted">
        No account?{" "}
        <Link
          href="/sign-up"
          className="text-ink font-semibold underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
