"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await createSupabaseBrowserClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full h-12 rounded-xl border border-zinc-300 text-zinc-700 font-medium text-base hover:bg-zinc-50 transition-colors"
    >
      Sign out
    </button>
  );
}
