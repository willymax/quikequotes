import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";
import { db } from "./db";

export async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function getDbUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return db.user.findUnique({ where: { supabaseId: user.id } });
}

export async function requireDbUser() {
  const authUser = await requireAuth();

  let dbUser = await db.user.findUnique({ where: { supabaseId: authUser.id } });

  // Auto-create DB user on first login
  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        supabaseId: authUser.id,
        email: authUser.email ?? "",
      },
    });
  }

  // Redirect to settings until business name is set
  if (!dbUser.businessName) redirect("/settings");

  return dbUser;
}
