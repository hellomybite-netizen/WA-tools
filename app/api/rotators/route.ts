import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getAuthUser, isSupabaseConfiguredServer } from "@/lib/supabase-server";

const serviceClient = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { cookies: { getAll: () => [], setAll: () => {} } }
);

// GET /api/rotators — get or auto-create user's first rotator
export async function GET() {
  if (!isSupabaseConfiguredServer()) return NextResponse.json({ rotator: null });

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = serviceClient();

  let { data: rotator } = await db
    .from("rotators")
    .select("*, rotator_members(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  // Auto-create if first time
  if (!rotator) {
    const slug = "rotator-" + Math.random().toString(36).slice(2, 8);
    const { data: created, error: createError } = await db
      .from("rotators")
      .insert({ user_id: user.id, name: "Rotator Utama", slug })
      .select("*, rotator_members(*)")
      .single();
    if (createError) return NextResponse.json({ error: "Create failed: " + createError.message }, { status: 500 });
    rotator = created;
  }

  return NextResponse.json({ rotator });
}

// PUT /api/rotators — update schedule
export async function PUT(req: NextRequest) {
  if (!isSupabaseConfiguredServer()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rotatorId, schedule } = await req.json();
  const db = serviceClient();

  const { error } = await db
    .from("rotators")
    .update({ schedule })
    .eq("id", rotatorId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
