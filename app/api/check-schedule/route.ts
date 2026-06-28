import { NextRequest, NextResponse } from "next/server";
import { checkSchedule, DEFAULT_SCHEDULE, ScheduleConfig } from "@/lib/schedule";

// In production this would load config from DB by slug.
// For demo: use a real schedule so the feature is testable.
const DEMO_CONFIG: ScheduleConfig = {
  ...DEFAULT_SCHEDULE,
  enabled: true,
  timezone: "WIB",
  offHoursMode: "message",
};

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "demo";

  // TODO: load real config from DB by slug
  const config = DEMO_CONFIG;

  const result = checkSchedule(config);
  return NextResponse.json({ slug, ...result });
}
