export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type OffHoursMode = "message" | "redirect" | "fallback";
export type TimezoneKey = "WIB" | "WITA" | "WIT";

export const TIMEZONE_IANA: Record<TimezoneKey, string> = {
  WIB:  "Asia/Jakarta",
  WITA: "Asia/Makassar",
  WIT:  "Asia/Jayapura",
};

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Senin", tue: "Selasa", wed: "Rabu", thu: "Kamis",
  fri: "Jumat", sat: "Sabtu", sun: "Minggu",
};

export const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export interface DaySchedule {
  open: boolean;
  openTime:  string; // "08:00"
  closeTime: string; // "17:00"
}

export interface ScheduleConfig {
  enabled:        boolean;
  timezone:       TimezoneKey;
  days:           Record<DayKey, DaySchedule>;
  offHoursMode:   OffHoursMode;
  closedMessage:  string;
  fallbackPhone:  string;
  holidays:       string[]; // "YYYY-MM-DD"
  emergencyClose: boolean;
}

export const DEFAULT_SCHEDULE: ScheduleConfig = {
  enabled:        false,
  timezone:       "WIB",
  days: {
    mon: { open: true,  openTime: "08:00", closeTime: "17:00" },
    tue: { open: true,  openTime: "08:00", closeTime: "17:00" },
    wed: { open: true,  openTime: "08:00", closeTime: "17:00" },
    thu: { open: true,  openTime: "08:00", closeTime: "17:00" },
    fri: { open: true,  openTime: "08:00", closeTime: "17:00" },
    sat: { open: false, openTime: "09:00", closeTime: "14:00" },
    sun: { open: false, openTime: "09:00", closeTime: "14:00" },
  },
  offHoursMode:   "message",
  closedMessage:  "Halo kak! Kami sedang tutup. Kami akan balas pesan Anda besok jam 08.00 WIB. Terima kasih 🙏",
  fallbackPhone:  "",
  holidays:       [],
  emergencyClose: false,
};

export interface ScheduleCheckResult {
  isOpen:        boolean;
  mode:          OffHoursMode;
  closedMessage: string;
  fallbackPhone: string;
  currentTime:   string; // "HH:MM"
  timezone:      TimezoneKey;
  reason?:       "emergency" | "holiday" | "day_closed" | "before_open" | "after_close";
}

/** Check if a rotator/link is open right now, given its config.
 *  All time logic runs in the owner's configured timezone. */
export function checkSchedule(config: ScheduleConfig): ScheduleCheckResult {
  const base: Omit<ScheduleCheckResult, "isOpen" | "reason"> = {
    mode:          config.offHoursMode,
    closedMessage: config.closedMessage,
    fallbackPhone: config.fallbackPhone,
    timezone:      config.timezone,
    currentTime:   "",
  };

  if (!config.enabled) return { ...base, isOpen: true };

  const iana = TIMEZONE_IANA[config.timezone];
  const now  = new Date();

  // Current time in owner timezone
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: iana,
    weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);

  const get = (t: string) => parts.find(p => p.type === t)?.value ?? "";
  const hh = get("hour").padStart(2, "0");
  const mm = get("minute").padStart(2, "0");
  const yyyy = get("year");
  const mo = get("month");
  const dd = get("day");
  const dateStr = `${yyyy}-${mo}-${dd}`;
  const weekday = get("weekday").toLowerCase().slice(0, 3) as DayKey;

  base.currentTime = `${hh}:${mm}`;

  if (config.emergencyClose) return { ...base, isOpen: false, reason: "emergency" };
  if (config.holidays.includes(dateStr)) return { ...base, isOpen: false, reason: "holiday" };

  const day = config.days[weekday];
  if (!day.open) return { ...base, isOpen: false, reason: "day_closed" };

  const currentMinutes = parseInt(hh) * 60 + parseInt(mm);
  const [oh, om] = day.openTime.split(":").map(Number);
  const [ch, cm] = day.closeTime.split(":").map(Number);
  const openMinutes  = oh * 60 + om;
  const closeMinutes = ch * 60 + cm;

  if (currentMinutes < openMinutes) return { ...base, isOpen: false, reason: "before_open" };
  if (currentMinutes >= closeMinutes) return { ...base, isOpen: false, reason: "after_close" };

  return { ...base, isOpen: true };
}
