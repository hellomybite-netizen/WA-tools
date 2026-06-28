import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, isSupabaseConfiguredServer } from "@/lib/supabase-server";
import { createServerClient } from "@supabase/ssr";
import { sendMetaCapiEvent } from "@/lib/meta-capi";

const serviceClient = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { cookies: { getAll: () => [], setAll: () => {} } }
);

// GET /api/conversions — load click_events with conversion status
export async function GET() {
  if (!isSupabaseConfiguredServer()) return NextResponse.json({ clicks: [] });

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Use service role to bypass RLS for reliable reads
  const db = serviceClient();

  // Load click events with link info
  const { data: clicks } = await db
    .from("click_events")
    .select(`
      id, clicked_at, utm_source, utm_medium, utm_campaign, ip,
      links ( label, destination_phone, slug )
    `)
    .eq("user_id", user.id)
    .order("clicked_at", { ascending: false })
    .limit(100);

  // Load conversions for this user
  const { data: conversions } = await db
    .from("conversions")
    .select("click_id, amount, currency, note, converted_at")
    .eq("user_id", user.id);

  const conversionMap = new Map(conversions?.map(c => [c.click_id, c]) ?? []);

  const result = (clicks ?? []).map(c => ({
    id: c.id,
    clickedAt: c.clicked_at,
    utmSource: c.utm_source ?? "langsung",
    utmMedium: c.utm_medium,
    utmCampaign: c.utm_campaign,
    linkLabel: (c.links as any)?.label ?? null,
    phone: (c.links as any)?.destination_phone ?? "—",
    converted: conversionMap.has(c.id),
    conversionValue: conversionMap.get(c.id)?.amount ?? null,
    currency: conversionMap.get(c.id)?.currency ?? null,
    convertedAt: conversionMap.get(c.id)?.converted_at ?? null,
  }));

  return NextResponse.json({ clicks: result });
}

// POST /api/conversions — mark a click as converted
export async function POST(req: NextRequest) {
  if (!isSupabaseConfiguredServer()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clickId, amount, currency = "IDR", note } = await req.json();
  if (!clickId || !amount) return NextResponse.json({ error: "clickId and amount required" }, { status: 400 });

  // Get click to verify ownership + get fbclid/ip/ua
  const { data: click } = await supabase
    .from("click_events")
    .select("id, user_id, ip, user_agent, utm_source, link_id")
    .eq("id", clickId)
    .eq("user_id", user.id)
    .single();

  if (!click) return NextResponse.json({ error: "Click not found" }, { status: 404 });

  // Save conversion
  const { data: conversion, error } = await supabase
    .from("conversions")
    .insert({
      user_id: user.id,
      click_id: clickId,
      link_id: click.link_id,
      amount: Number(amount),
      currency,
      note: note || null,
      converted_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Sudah ditandai konversi" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fire Meta CAPI Purchase event
  let capiSent = false;
  const supabaseRaw = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
  const { data: pixel } = await supabaseRaw
    .from("pixel_settings")
    .select("meta_pixel_id, meta_access_token")
    .eq("user_id", user.id)
    .single();

  if (pixel?.meta_pixel_id && pixel?.meta_access_token) {
    const result = await sendMetaCapiEvent({
      pixelId: pixel.meta_pixel_id,
      accessToken: pixel.meta_access_token,
      eventName: "Purchase",
      userIp: click.ip ?? undefined,
      userAgent: click.user_agent ?? undefined,
      customData: { currency, value: Number(amount) },
      eventId: `purchase_${conversion?.id}`,
    });
    capiSent = result.success;
  }

  return NextResponse.json({ ok: true, conversionId: conversion?.id, capiSent });
}
