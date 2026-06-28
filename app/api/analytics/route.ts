import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getAuthUser, isSupabaseConfiguredServer } from "@/lib/supabase-server";

const serviceClient = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { cookies: { getAll: () => [], setAll: () => {} } }
);

export async function GET(req: NextRequest) {
  if (!isSupabaseConfiguredServer()) return NextResponse.json({ configured: false });

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from") ?? new Date(Date.now() - 7 * 86_400_000).toISOString();
  const to   = searchParams.get("to")   ?? new Date().toISOString();

  const db = serviceClient();

  // Load all click_events in range
  const { data: clicks } = await db
    .from("click_events")
    .select("id, clicked_at, utm_source, utm_campaign, utm_medium")
    .eq("user_id", user.id)
    .gte("clicked_at", from)
    .lte("clicked_at", to)
    .order("clicked_at", { ascending: true });

  // Load all conversions in range
  const { data: conversions } = await db
    .from("conversions")
    .select("id, amount, currency, converted_at, click_id")
    .eq("user_id", user.id)
    .gte("converted_at", from)
    .lte("converted_at", to);

  const clickList    = clicks ?? [];
  const convList     = conversions ?? [];
  const convClickIds = new Set(convList.map(c => c.click_id).filter(Boolean));

  // Totals
  const totalLeads       = clickList.length;
  const totalConversions = convList.length;

  // Revenue by currency
  const revenueByCurrency: Record<string, { revenue: number; conversions: number }> = {};
  for (const c of convList) {
    if (!revenueByCurrency[c.currency]) revenueByCurrency[c.currency] = { revenue: 0, conversions: 0 };
    revenueByCurrency[c.currency].revenue     += Number(c.amount);
    revenueByCurrency[c.currency].conversions += 1;
  }

  // Clicks by channel (utm_source), with conversion count
  const byChannel: Record<string, { leads: number; conversions: number }> = {};
  for (const cl of clickList) {
    const src = cl.utm_source ?? "langsung";
    if (!byChannel[src]) byChannel[src] = { leads: 0, conversions: 0 };
    byChannel[src].leads += 1;
    if (convClickIds.has(cl.id)) byChannel[src].conversions += 1;
  }

  // Clicks by day (yyyy-mm-dd) for chart
  const byDay: Record<string, number> = {};
  for (const cl of clickList) {
    const day = cl.clicked_at.slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  }

  return NextResponse.json({
    configured: true,
    totalLeads,
    totalConversions,
    revenueByCurrency,
    byChannel,
    byDay,
  });
}
