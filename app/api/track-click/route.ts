import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendMetaCapiEvent } from "@/lib/meta-capi";

export async function POST(req: NextRequest) {
  const { linkId, slug, utmSource, utmMedium, utmCampaign, fbclid, eventSourceUrl } = await req.json();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || supabaseUrl.includes("your_supabase") || !serviceKey) {
    return NextResponse.json({ ok: true, note: "supabase not configured" });
  }

  // Use service role key to bypass RLS for anonymous click tracking
  const supabase = createServerClient(supabaseUrl, serviceKey, { cookies: { getAll: () => [], setAll: () => {} } });

  const userIp = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? undefined;
  const userAgent = req.headers.get("user-agent") ?? undefined;

  // Lookup link to get user_id if only slug provided
  let resolvedLinkId = linkId;
  let userId: string | null = null;

  if (!resolvedLinkId && slug) {
    const { data: link } = await supabase.from("links").select("id, user_id").eq("slug", slug).single();
    resolvedLinkId = link?.id;
    userId = link?.user_id ?? null;
  } else if (resolvedLinkId) {
    const { data: link } = await supabase.from("links").select("user_id").eq("id", resolvedLinkId).single();
    userId = link?.user_id ?? null;
  }

  // Insert click event
  const { data: click } = await supabase
    .from("click_events")
    .insert({
      link_id: resolvedLinkId ?? null,
      user_id: userId ?? "00000000-0000-0000-0000-000000000000",
      ip: userIp,
      user_agent: userAgent,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    })
    .select("id")
    .single();

  // Fire Meta CAPI Lead event if user has pixel configured
  if (userId) {
    const { data: settings } = await supabase
      .from("pixel_settings")
      .select("meta_pixel_id, meta_access_token")
      .eq("user_id", userId)
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
