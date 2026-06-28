import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getAuthUser, isSupabaseConfiguredServer } from "@/lib/supabase-server";

const serviceClient = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { cookies: { getAll: () => [], setAll: () => {} } }
);

// POST /api/rotators/members — add member
export async function POST(req: NextRequest) {
  if (!isSupabaseConfiguredServer()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rotatorId, name, phone } = await req.json();
  const db = serviceClient();

  // Find rotator: by ID if provided, otherwise auto-pick user's first rotator
  let rotator: { id: string } | null = null;
  if (rotatorId) {
    const { data } = await db.from("rotators").select("id").eq("id", rotatorId).eq("user_id", user.id).single();
    rotator = data;
  } else {
    const { data } = await db.from("rotators").select("id").eq("user_id", user.id).order("created_at").limit(1).single();
    rotator = data;
    // Auto-create if none exists
    if (!rotator) {
      const slug = "rotator-" + Math.random().toString(36).slice(2, 8);
      const { data: created } = await db.from("rotators").insert({ user_id: user.id, name: "Rotator Utama", slug }).select("id").single();
      rotator = created;
    }
  }
  if (!rotator) return NextResponse.json({ error: "Rotator not found" }, { status: 404 });

  const { data: member, error } = await db
    .from("rotator_members")
    .insert({ rotator_id: rotator.id, name, phone, sort_order: 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ member });
}

// PATCH /api/rotators/members — toggle active or update
export async function PATCH(req: NextRequest) {
  if (!isSupabaseConfiguredServer()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { memberId, active } = await req.json();
  const db = serviceClient();

  const { error } = await db
    .from("rotator_members")
    .update({ active })
    .eq("id", memberId)
    .in("rotator_id", db.from("rotators").select("id").eq("user_id", user.id) as never);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/rotators/members?id=xxx
export async function DELETE(req: NextRequest) {
  if (!isSupabaseConfiguredServer()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberId = req.nextUrl.searchParams.get("id");
  if (!memberId) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = serviceClient();

  // Verify via join
  const { data: member } = await db
    .from("rotator_members")
    .select("id, rotators(user_id)")
    .eq("id", memberId)
    .single();

  if (!member || (member.rotators as any)?.user_id !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.from("rotator_members").delete().eq("id", memberId);
  return NextResponse.json({ ok: true });
}
