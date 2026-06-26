import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendMetaCapiEvent } from "@/lib/meta-capi";

export async function POST(req: NextRequest) {
  const { linkId, slug, utmSource, utmMedium, utmCampaign, fbclid, eventSourceUrl } = await req.json();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configured = supabaseUrl && !supabaseUrl.includes("your_supabase");
  if (!configured) return NextResponse.json({ ok: true, note: "supabase not configured" });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, { cookies: { getAll: () => [], setAll: () => {} } });

  // 1. Catat klik ke database
  const userIp = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? undefined;
  const userAgent = req.headers.get("user-agent") ?? undefined;

  const { data: click } = await supabase
    .from("link_clicks")
    .insert({
      link_id: linkId,
      ip: userIp,
      user_agent: userAgent,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      fbclid,
    })
    .select("id")
    .single();

  // 2. Ambil pixel settings milik owner link ini
  const { data: link } = await supabase
    .from("wa_links")
    .select("user_id")
    .eq("id", linkId)
    .single();

  if (link?.user_id) {
    const { data: settings } = await supabase
      .from("pixel_settings")
      .select("meta_pixel_id, meta_access_token")
      .eq("user_id", link.user_id)
      .single();

    if (settings?.meta_pixel_id && settings?.meta_access_token) {
      await sendMetaCapiEvent({
        pixelId: settings.meta_pixel_id,
        accessToken: settings.meta_access_token,
        eventName: "Lead",
        eventSourceUrl,
        userIp,
        userAgent,
        fbclid,
        customData: { content_name: slug },
        eventId: click?.id,
      });
    }
  }

  return NextResponse.json({ ok: true, clickId: click?.id });
}
