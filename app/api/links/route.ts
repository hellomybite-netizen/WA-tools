import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getAuthUser, isSupabaseConfiguredServer } from "@/lib/supabase-server";

const serviceClient = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { cookies: { getAll: () => [], setAll: () => {} } }
);

function randomSlug() {
  return Math.random().toString(36).slice(2, 8);
}

// GET /api/links — list user's links
export async function GET() {
  if (!isSupabaseConfiguredServer()) return NextResponse.json({ links: [] });

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = serviceClient();
  const { data: links } = await db
    .from("links")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ links: links ?? [] });
}

// POST /api/links — create a new link
export async function POST(req: NextRequest) {
  if (!isSupabaseConfiguredServer()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { label, destination_phone, message, utm_source, utm_medium, utm_campaign } = body;

  if (!destination_phone) return NextResponse.json({ error: "destination_phone required" }, { status: 400 });

  const db = serviceClient();
  let slug = randomSlug();
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await db.from("links").select("id").eq("slug", slug).single();
    if (!existing) break;
    slug = randomSlug();
  }

  const { data: link, error } = await db
    .from("links")
    .insert({ user_id: user.id, slug, label, destination_phone, message, utm_source, utm_medium, utm_campaign })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ link });
}

// DELETE /api/links?id=xxx
export async function DELETE(req: NextRequest) {
  if (!isSupabaseConfiguredServer()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = serviceClient();
  await db.from("links").delete().eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
