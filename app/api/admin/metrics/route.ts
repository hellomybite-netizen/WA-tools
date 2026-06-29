import { NextResponse } from "next/server";
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
  return data?.role === "admin" ? user : null;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = db();
  const now    = new Date();
  const today  = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const week   = new Date(Date.now() - 7 * 86400000).toISOString();
  const month  = new Date(Date.now() - 30 * 86400000).toISOString();

  const [
    { count: totalUsers },
    { count: newToday },
    { count: newWeek },
    { count: newMonth },
    { data: tierRows },
    { count: totalClicks },
    { count: clicksToday },
    { count: totalConversions },
    { data: signupsByDay },
    { data: clicksByDay },
    { data: recentUsers },
  ] = await Promise.all([
    client.from("user_profiles").select("*", { count: "exact", head: true }),
    client.from("user_profiles").select("*", { count: "exact", head: true }).gte("created_at", today),
    client.from("user_profiles").select("*", { count: "exact", head: true }).gte("created_at", week),
    client.from("user_profiles").select("*", { count: "exact", head: true }).gte("created_at", month),
    client.from("user_profiles").select("tier"),
    client.from("click_events").select("*", { count: "exact", head: true }),
    client.from("click_events").select("*", { count: "exact", head: true }).gte("created_at", today),
    client.from("conversions").select("*", { count: "exact", head: true }),
    // Signups per day last 30 days
    client.from("user_profiles")
      .select("created_at")
      .gte("created_at", month)
      .order("created_at", { ascending: true }),
    // Clicks per day last 30 days
    client.from("click_events")
      .select("created_at")
      .gte("created_at", month)
      .order("created_at", { ascending: true }),
    // Recent signups
    client.from("user_profiles")
      .select("id, name, business_name, tier, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  // Get emails for recent users
  const { data: authUsers } = await client.auth.admin.listUsers({ perPage: 1000 });
  const emailMap: Record<string, string> = {};
  authUsers?.users?.forEach((u: { id: string; email?: string }) => { emailMap[u.id] = u.email ?? ""; });

  // Tier breakdown
  const tierCount: Record<string, number> = { trial: 0, starter: 0, pro: 0, agency: 0 };
  (tierRows ?? []).forEach((r: { tier: string }) => { if (r.tier in tierCount) tierCount[r.tier]++; });

  // Aggregate by day
  function byDay(rows: { created_at: string }[]) {
    const map: Record<string, number> = {};
    rows.forEach(r => {
      const day = r.created_at.slice(0, 10);
      map[day] = (map[day] ?? 0) + 1;
    });
    // Fill last 30 days
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      result.push({ date: d, count: map[d] ?? 0 });
    }
    return result;
  }

  return NextResponse.json({
    users: {
      total: totalUsers ?? 0,
      newToday: newToday ?? 0,
      newWeek: newWeek ?? 0,
      newMonth: newMonth ?? 0,
      byTier: tierCount,
    },
    clicks: {
      total: totalClicks ?? 0,
      today: clicksToday ?? 0,
    },
    conversions: {
      total: totalConversions ?? 0,
    },
    signupsByDay: byDay(signupsByDay ?? []),
    clicksByDay:  byDay(clicksByDay ?? []),
    recentUsers: (recentUsers ?? []).map(u => ({ ...u, email: emailMap[u.id] ?? "" })),
  });
}
