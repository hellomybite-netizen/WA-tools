import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { checkSchedule } from "@/lib/schedule";

// GET /api/rotators/redirect?slug=xxx
// Public endpoint — picks next active CS member via round-robin using persistent counter
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const db = createServerClient(supabaseUrl, serviceKey, { cookies: { getAll: () => [], setAll: () => {} } });

  // Find rotator by slug
  const { data: rotator } = await db
    .from("rotators")
    .select("id, schedule, user_id, current_index")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!rotator) return NextResponse.json({ error: "Rotator not found" }, { status: 404 });

  // Check schedule if configured
  if (rotator.schedule) {
    const result = checkSchedule(rotator.schedule);
    if (!result.isOpen) return NextResponse.json({ closed: true, ...result });
  }

  // Get active members ordered by sort_order then created_at
  const { data: members } = await db
    .from("rotator_members")
    .select("id, name, phone")
    .eq("rotator_id", rotator.id)
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!members || members.length === 0)
    return NextResponse.json({ error: "No active CS members" }, { status: 404 });

  // Pick current member, then increment counter for next call
  const index  = (rotator.current_index ?? 0) % members.length;
  const member = members[index];
  const next   = (index + 1) % members.length;

  // Increment counter (fire-and-forget, don't block response)
  db.from("rotators").update({ current_index: next }).eq("id", rotator.id).then(() => {});

  return NextResponse.json({
    phone: member.phone,
    memberName: member.name,
    memberId: member.id,
    rotatorId: rotator.id,
    index,
    total: members.length,
  });
}
