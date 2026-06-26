import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendMetaCapiEvent } from "@/lib/meta-capi";

export async function POST(req: NextRequest) {
  const { clickId, value, currency = "IDR", orderId, userId } = await req.json();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configured = supabaseUrl && !supabaseUrl.includes("your_supabase");
  if (!configured) return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 400 });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, { cookies: { getAll: () => [], setAll: () => {} } });

  // 1. Tandai klik sebagai converted di database
  const { data: click } = await supabase
    .from("link_clicks")
    .update({
      converted: true,
      conversion_value: value,
      converted_at: new Date().toISOString(),
    })
    .eq("id", clickId)
    .select("utm_source, utm_medium, utm_campaign, fbclid, user_agent, ip, link_id")
    .single();

  if (!click) return NextResponse.json({ ok: false, error: "Click not found" }, { status: 404 });

  // 2. Simpan ke tabel conversions
  await supabase.from("conversions").insert({
    click_id: clickId,
    user_id: userId,
    value,
    currency,
    order_id: orderId,
  });

  // 3. Kirim Purchase event ke Meta CAPI
  const { data: settings } = await supabase
    .from("pixel_settings")
    .select("meta_pixel_id, meta_access_token")
    .eq("user_id", userId)
    .single();

  let capiResult = null;
  if (settings?.meta_pixel_id && settings?.meta_access_token) {
    capiResult = await sendMetaCapiEvent({
      pixelId: settings.meta_pixel_id,
      accessToken: settings.meta_access_token,
      eventName: "Purchase",
      userIp: click.ip,
      userAgent: click.user_agent,
      fbclid: click.fbclid,
      customData: { currency, value, order_id: orderId },
      eventId: `purchase_${clickId}`,
    });
  }

  return NextResponse.json({ ok: true, capiSent: !!capiResult?.success });
}
