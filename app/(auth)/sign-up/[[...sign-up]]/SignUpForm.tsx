"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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
        <p className="text-2xl">📬</p>
        <p className="font-semibold">Check your email</p>
        <p className="text-sm text-zinc-500">
          We sent a confirmation link to <span className="font-medium text-zinc-700">{email}</span>.
          Click it to activate your account.
        </p>
        <button
          type="button"
          onClick={() => router.push("/sign-in")}
          className="text-sm text-zinc-900 underline underline-offset-2"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 px-4 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-12 px-4 text-base border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
          placeholder="Min. 8 characters"
        />
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-zinc-900 text-white font-semibold text-base disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-zinc-900 font-medium underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </form>
  );
}
