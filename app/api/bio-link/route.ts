import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getAuthUser, isSupabaseConfiguredServer } from "@/lib/supabase-server";

const serviceClient = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { cookies: { getAll: () => [], setAll: () => {} } }
);

// GET /api/bio-link — load user's bio link
export async function GET() {
  if (!isSupabaseConfiguredServer()) return NextResponse.json({ bioLink: null });

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = serviceClient();
  const { data } = await db.from("bio_links").select("*").eq("user_id", user.id).single();
  return NextResponse.json({ bioLink: data ?? null });
}

// POST /api/bio-link — upsert bio link
export async function POST(req: NextRequest) {
  if (!isSupabaseConfiguredServer()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username, title, subtitle, buttons, avatar_url } = await req.json();
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const db = serviceClient();

  // Check username not taken by another user
  const { data: existing } = await db.from("bio_links").select("user_id").eq("username", username).single();
  if (existing && existing.user_id !== user.id)
    return NextResponse.json({ error: "Username sudah dipakai" }, { status: 409 });

  const { data, error } = await db
    .from("bio_links")
    .upsert({ user_id: user.id, username, title, subtitle, buttons, avatar_url, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bioLink: data });
}
