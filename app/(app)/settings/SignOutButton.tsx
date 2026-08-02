"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buttonClass } from "@/lib/ui";

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
      className={buttonClass({ variant: "outline", size: "lg", block: true })}
    >
      Sign out
    </button>
  );
}
