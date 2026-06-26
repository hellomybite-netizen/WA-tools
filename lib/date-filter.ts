export type DatePreset = "today" | "yesterday" | "7d" | "30d" | "90d" | "this_week" | "this_month" | "last_month" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}

export const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: "today",       label: "Hari ini" },
  { key: "yesterday",   label: "Kemarin" },
  { key: "this_week",   label: "Minggu ini" },
  { key: "7d",          label: "7 hari" },
  { key: "this_month",  label: "Bulan ini" },
  { key: "30d",         label: "30 hari" },
  { key: "last_month",  label: "Bulan lalu" },
  { key: "90d",         label: "90 hari" },
  { key: "custom",      label: "Custom" },
];

export function getDateRange(preset: DatePreset, custom?: DateRange): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return { from: today, to: now };
    case "yesterday": {
      const yd = new Date(today); yd.setDate(yd.getDate() - 1);
      const ydEnd = new Date(today); ydEnd.setMilliseconds(-1);
      return { from: yd, to: ydEnd };
    }
    case "this_week": {
      const dow = today.getDay(); // 0=Sun
      const mon = new Date(today); mon.setDate(today.getDate() - ((dow + 6) % 7));
      return { from: mon, to: now };
    }
    case "7d": {
      const f = new Date(today); f.setDate(f.getDate() - 6);
      return { from: f, to: now };
    }
    case "this_month": {
      const f = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: f, to: now };
    }
    case "30d": {
      const f = new Date(today); f.setDate(f.getDate() - 29);
      return { from: f, to: now };
    }
    case "last_month": {
      const f = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const t = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
      return { from: f, to: t };
    }
    case "90d": {
      const f = new Date(today); f.setDate(f.getDate() - 89);
      return { from: f, to: now };
    }
    case "custom":
      return custom ?? { from: today, to: now };
  }
}

export function formatDateLabel(range: DateRange): string {
  const fmt = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "2-digit" });
  return `${fmt(range.from)} – ${fmt(range.to)}`;
}

/** Returns granularity for chart axis based on range length in days */
export function getGranularity(range: DateRange): "hour" | "day" | "week" | "month" {
  const days = Math.ceil((range.to.getTime() - range.from.getTime()) / 86_400_000);
  if (days <= 1) return "hour";
  if (days <= 31) return "day";
  if (days <= 90) return "week";
  return "month";
}

/** Generate X-axis tick labels for the given range */
export function generateTicks(range: DateRange, granularity: ReturnType<typeof getGranularity>): string[] {
  const result: string[] = [];
  const cur = new Date(range.from);

  if (granularity === "hour") {
    for (let h = 0; h < 24; h++) result.push(`${String(h).padStart(2,"0")}:00`);
    return result;
  }

  while (cur <= range.to) {
    if (granularity === "day") {
      result.push(cur.toLocaleDateString("id-ID", { day: "numeric", month: "short" }));
      cur.setDate(cur.getDate() + 1);
    } else if (granularity === "week") {
      result.push(`W${getWeekNum(cur)}`);
      cur.setDate(cur.getDate() + 7);
    } else {
      result.push(cur.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }));
      cur.setMonth(cur.getMonth() + 1);
    }
  }
  return result;
}

function getWeekNum(d: Date): number {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - jan1.getTime()) / 86_400_000 + jan1.getDay() + 1) / 7);
}

/** Scale a demo number by the proportion of days relative to a 7-day baseline */
export function scaleDemoValue(base: number, range: DateRange, noise = true): number {
  const days = Math.max(1, Math.ceil((range.to.getTime() - range.from.getTime()) / 86_400_000));
  const factor = days / 7;
  const jitter = noise ? 0.85 + Math.random() * 0.3 : 1;
  return Math.round(base * factor * jitter);
}
