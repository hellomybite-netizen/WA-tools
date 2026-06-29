import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getAuthUser } from "@/lib/supabase-server";

const db = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { cookies: { getAll: () => [], setAll: () => {} } }
);

async function requireAdmin() {
  const user = await getAuthUser();
  if (!user) return null;
  const { data } = await db().from("user_profiles").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") return null;
  return user;
}

// GET /api/admin/users — list all users with profiles
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: profiles } = await db()
    .from("user_profiles")
    .select("id, name, role, tier, trial_ends_at, created_at, business_name, phone")
    .order("created_at", { ascending: false });

  // Get emails from auth.users via service role
  const { data: authUsers } = await db().auth.admin.listUsers({ perPage: 1000 });
  const emailMap: Record<string, string> = {};
  authUsers?.users?.forEach((u: { id: string; email?: string }) => { emailMap[u.id] = u.email ?? ""; });

  const users = (profiles ?? []).map(p => ({
    ...p,
    email: emailMap[p.id] ?? "",
  }));

  return NextResponse.json({ users });
}

// PATCH /api/admin/users — update tier or role
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, tier, role } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const update: Record<string, string> = {};
  if (tier) update.tier = tier;
  if (role) update.role = role;

  const { error } = await db().from("user_profiles").update(update).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
