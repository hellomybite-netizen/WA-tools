import { NextRequest, NextResponse } from "next/server";
import { checkSchedule, DEFAULT_SCHEDULE } from "@/lib/schedule";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "";

  // TODO: load schedule config from DB by slug/rotator
  // For now: always return open so links work during test launch
  // When schedule is stored in DB, query rotators table here
  const config = { ...DEFAULT_SCHEDULE, enabled: false };

  const result = checkSchedule(config);
  return NextResponse.json({ slug, ...result });
}
