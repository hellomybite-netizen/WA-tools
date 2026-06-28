import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, isSupabaseConfiguredServer } from "@/lib/supabase-server";

// Public route — lookup link by slug for redirect
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSupabaseConfiguredServer()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const supabase = await createServerSupabaseClient();
  const { data: link } = await supabase
    .from("links")
    .select("id, destination_phone, message, utm_source, utm_medium, utm_campaign, user_id, active")
    .eq("slug", slug)
    .single();

  if (!link || !link.active) return NextResponse.json({ error: "Link not found" }, { status: 404 });

  return NextResponse.json({ link });
}
