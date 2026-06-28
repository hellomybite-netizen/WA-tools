"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TIER_FEATURES } from "@/lib/tiers";
import { useTier } from "@/lib/use-tier";
import {
  ScheduleConfig, DayKey, DAY_KEYS, DAY_LABELS,
  DEFAULT_SCHEDULE, OffHoursMode, TimezoneKey,
} from "@/lib/schedule";
import { isSupabaseConfigured } from "@/lib/supabase";

interface CSAgent {
  id: string;
  name: string;
  phone: string;
  active: boolean;
}

interface Rotator {
  id: string;
  slug: string;
  schedule: ScheduleConfig | null;
  rotator_members: CSAgent[];
}

const MAX_CLOSED_MSG = 300;

const TIMEZONE_OPTIONS: { value: TimezoneKey; label: string }[] = [
  { value: "WIB",  label: "WIB  (UTC+7) — Jawa, Sumatera, Kalimantan Barat/Tengah" },
  { value: "WITA", label: "WITA (UTC+8) — Bali, NTB, NTT, Kalimantan Timur/Utara" },
  { value: "WIT",  label: "WIT  (UTC+9) — Papua, Maluku" },
];
const OFF_HOURS_OPTIONS: { value: OffHoursMode; label: string; desc: string }[] = [
  { value: "message",  label: "💬 Pesan Otomatis", desc: "Buka WA dengan pesan tutup yang sudah diisi" },
  { value: "redirect", label: "🌐 Halaman Tutup",  desc: "Tampilkan halaman mini 'Kami sedang tutup'" },
  { value: "fallback", label: "📞 CS Cadangan",    desc: "Alihkan ke nomor WA lain" },
];
const HOLIDAY_NAMES: Record<string, string> = {
  "2026-01-01": "Tahun Baru", "2026-03-31": "Idul Fitri 1",
  "2026-04-01": "Idul Fitri 2", "2026-12-25": "Natal",
};

export default function ChatRotatorPage() {
  const tier = useTier();
  const features = TIER_FEATURES[tier];
  const maxCS = features.maxCSPerRotator;
  const unlimitedCS = maxCS === "unlimited";
  const isReal = isSupabaseConfigured();

  const [tab, setTab]           = useState<"rotator" | "schedule">("rotator");
  const [rotator, setRotator]   = useState<Rotator | null>(null);
  const [agents, setAgents]     = useState<CSAgent[]>([]);
  const [schedule, setSchedule] = useState<ScheduleConfig>({ ...DEFAULT_SCHEDULE });
  const [newName, setNewName]   = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newHoliday, setNewHoliday] = useState("");
  const [loading, setLoading]   = useState(isReal);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [addingCS, setAddingCS] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

  useEffect(() => {
    if (!isReal) return;
    loadRotator();
  }, []); // eslint-disable-line

  async function loadRotator() {
    setLoading(true);
    try {
      const res = await fetch("/api/rotators");
      const data = await res.json();
      if (data.rotator) {
        setRotator(data.rotator);
        setAgents(data.rotator.rotator_members ?? []);
        if (data.rotator.schedule) setSchedule(data.rotator.schedule);
      }
    } catch {
      toast.error("Gagal memuat rotator");
    }
    setLoading(false);
  }

  async function addAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newPhone) return;
    if (!unlimitedCS && agents.length >= (maxCS as number)) {
      toast.error(`Batas ${maxCS} CS per rotator. Upgrade untuk CS tak terbatas.`);
      return;
    }

    if (!isReal) {
      setAgents(prev => [...prev, { id: Date.now().toString(), name: newName, phone: newPhone, active: true }]);
      setNewName(""); setNewPhone("");
      toast.success(`CS ${newName} ditambahkan (demo)`);
      return;
    }

    setAddingCS(true);
    try {
      const res = await fetch("/api/rotators/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotatorId: rotator?.id, name: newName, phone: newPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAgents(prev => [...prev, data.member]);
      setNewName(""); setNewPhone("");
      toast.success(`CS ${newName} ditambahkan`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menambah CS");
    }
    setAddingCS(false);
  }

  async function toggleAgent(id: string) {
    const agent = agents.find(a => a.id === id);
    if (!agent) return;
    const newActive = !agent.active;
    setAgents(prev => prev.map(a => a.id === id ? { ...a, active: newActive } : a));

    if (!isReal) return;
    await fetch("/api/rotators/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: id, active: newActive }),
    });
  }

  async function removeAgent(id: string) {
    setAgents(prev => prev.filter(a => a.id !== id));
    if (!isReal) { toast.success("CS dihapus (demo)"); return; }
    await fetch(`/api/rotators/members?id=${id}`, { method: "DELETE" });
    toast.success("CS dihapus");
  }

  async function saveSchedule() {
    if (!isReal) {
      localStorage.setItem("demo_schedule", JSON.stringify(schedule));
      toast.success("Jadwal disimpan (demo)");
      return;
    }
    setSavingSchedule(true);
    try {
      const res = await fetch("/api/rotators", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotatorId: rotator?.id, schedule }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      toast.success("Jadwal operasional disimpan!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan jadwal");
    }
    setSavingSchedule(false);
  }

  function updateDay(day: DayKey, field: "open" | "openTime" | "closeTime", value: boolean | string) {
    setSchedule(s => ({ ...s, days: { ...s.days, [day]: { ...s.days[day], [field]: value } } }));
  }

  function addHoliday() {
    if (!newHoliday || schedule.holidays.includes(newHoliday)) return;
    setSchedule(s => ({ ...s, holidays: [...s.holidays, newHoliday].sort() }));
    setNewHoliday("");
  }

  const activeAgents = agents.filter(a => a.active);
  const rotatorLink  = rotator ? `${appUrl}/r/${rotator.slug}` : `${appUrl}/r/rotator-...`;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Chat Rotator</h1>
          <p className="text-gray-500 text-sm">
            Distribusi chat ke CS secara bergiliran
            {!isReal && <span className="ml-2 text-amber-500 font-medium">(Demo Mode)</span>}
          </p>
        </div>
        <button
          onClick={() => {
            const closing = !schedule.emergencyClose;
            setSchedule(s => ({ ...s, emergencyClose: closing }));
            toast[closing ? "error" : "success"](
              closing ? "🔴 Darurat: Semua link ditutup sekarang" : "Rotator dibuka kembali"
            );
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            schedule.emergencyClose
              ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {schedule.emergencyClose ? "🔴 TUTUP DARURAT — Klik untuk buka" : "⚡ Tutup Darurat"}
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between px-4 py-3 rounded-lg text-sm border bg-gray-50">
          <span className="text-gray-500">CS aktif</span>
          <span className="font-semibold">{activeAgents.length} / {unlimitedCS ? <span className="text-green-600">∞</span> : maxCS}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3 rounded-lg text-sm border bg-gray-50">
          <span className="text-gray-500">Total CS</span>
          <span className="font-semibold">{agents.length}</span>
        </div>
      </div>

      <div className="flex gap-1 mb-5 border-b">
        {([["rotator", "👥 CS & Link"], ["schedule", "🕐 Jadwal Operasional"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ===== TAB: ROTATOR ===== */}
      {tab === "rotator" && (
        loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Memuat rotator...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-6">
                <h2 className="font-semibold mb-4">Tambah CS</h2>
                <form onSubmit={addAgent} className="space-y-3">
                  <input value={newName} onChange={e => setNewName(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nama CS" required />
                  <input value={newPhone} onChange={e => setNewPhone(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nomor WA (628xxx)" required />
                  <button type="submit" disabled={addingCS}
                    className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {addingCS ? "Menyimpan..." : "Tambah CS"}
                  </button>
                </form>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h2 className="font-semibold mb-1">Link Rotator</h2>
                <p className="text-xs text-gray-500 mb-3">Bagikan link ini — setiap klik otomatis diarahkan ke CS berikutnya</p>
                <div className="flex gap-2">
                  <input readOnly value={rotatorLink}
                    className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50 text-gray-500 font-mono text-xs" />
                  <button onClick={() => { navigator.clipboard.writeText(rotatorLink); toast.success("Disalin!"); }}
                    className="px-3 py-2 border rounded text-sm hover:bg-gray-50 transition-colors">Salin</button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Round-robin otomatis berdasarkan urutan CS aktif</p>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Daftar CS ({agents.length})</h2>
                <span className="text-xs text-gray-400">{activeAgents.length} aktif</span>
              </div>
              {agents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Belum ada CS — tambah CS di sebelah kiri</p>
              ) : (
                <div className="space-y-2">
                  {agents.map((agent, idx) => (
                    <div key={agent.id}
                      className={`flex items-center gap-3 p-3 rounded border text-sm ${agent.active ? "border-gray-200" : "border-gray-100 opacity-50"}`}>
                      <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{agent.name}</p>
                        <p className="text-xs text-gray-400">{agent.phone}</p>
                      </div>
                      <button onClick={() => toggleAgent(agent.id)}
                        className={`text-xs px-2 py-1 rounded border ${agent.active ? "border-green-200 text-green-700 bg-green-50" : "border-gray-200 text-gray-500"}`}>
                        {agent.active ? "Aktif" : "Nonaktif"}
                      </button>
                      <button onClick={() => removeAgent(agent.id)} className="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* ===== TAB: JADWAL ===== */}
      {tab === "schedule" && (
        <div className="space-y-5 max-w-2xl">
          <div className="bg-white border rounded-lg p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Aktifkan Jadwal Operasional</p>
              <p className="text-xs text-gray-500 mt-0.5">Klik di luar jam kerja akan dicegat sesuai mode yang dipilih</p>
            </div>
            <button onClick={() => setSchedule(s => ({ ...s, enabled: !s.enabled }))}
              className={`relative inline-flex w-12 h-6 rounded-full transition-colors flex-shrink-0 ${schedule.enabled ? "bg-green-500" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${schedule.enabled ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>

          {schedule.enabled && (
            <>
              <div className="bg-white border rounded-lg p-5">
                <h3 className="font-semibold mb-3">Zona Waktu</h3>
                <select value={schedule.timezone}
                  onChange={e => setSchedule(s => ({ ...s, timezone: e.target.value as TimezoneKey }))}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  {TIMEZONE_OPTIONS.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                </select>
              </div>

              <div className="bg-white border rounded-lg p-5">
                <h3 className="font-semibold mb-4">Jam Operasional per Hari</h3>
                <div className="space-y-3">
                  {DAY_KEYS.map(day => {
                    const d = schedule.days[day];
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <div className="w-20 flex-shrink-0">
                          <span className="text-sm font-medium text-gray-700">{DAY_LABELS[day]}</span>
                        </div>
                        <button onClick={() => updateDay(day, "open", !d.open)}
                          className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${d.open ? "bg-green-500" : "bg-gray-300"}`}>
                          <span className={`block w-4 h-4 rounded-full bg-white shadow mx-auto transition-transform ${d.open ? "translate-x-2.5" : "-translate-x-2.5"}`} />
                        </button>
                        {d.open ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input type="time" value={d.openTime}
                              onChange={e => updateDay(day, "openTime", e.target.value)}
                              className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
                            <span className="text-gray-400 text-sm">—</span>
                            <input type="time" value={d.closeTime}
                              onChange={e => updateDay(day, "closeTime", e.target.value)}
                              className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Tutup</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border rounded-lg p-5">
                <h3 className="font-semibold mb-3">Mode di Luar Jam Kerja</h3>
                <div className="space-y-2">
                  {OFF_HOURS_OPTIONS.map(opt => (
                    <label key={opt.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${schedule.offHoursMode === opt.value ? "border-green-500 bg-green-50" : "border-gray-200 hover:bg-gray-50"}`}>
                      <input type="radio" name="offHoursMode" value={opt.value}
                        checked={schedule.offHoursMode === opt.value}
                        onChange={() => setSchedule(s => ({ ...s, offHoursMode: opt.value }))}
                        className="mt-0.5 accent-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {(schedule.offHoursMode === "message" || schedule.offHoursMode === "redirect") && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Pesan saat tutup</label>
                    <textarea value={schedule.closedMessage}
                      onChange={e => setSchedule(s => ({ ...s, closedMessage: e.target.value.slice(0, MAX_CLOSED_MSG) }))}
                      rows={3}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      placeholder="Halo kak! Kami sedang tutup. Balas besok jam 08.00 WIB 🙏" />
                    <p className={`text-xs mt-1 text-right ${schedule.closedMessage.length >= MAX_CLOSED_MSG ? "text-red-500" : "text-gray-400"}`}>
                      {schedule.closedMessage.length}/{MAX_CLOSED_MSG}
                    </p>
                  </div>
                )}
                {schedule.offHoursMode === "fallback" && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Nomor CS Cadangan</label>
                    <input value={schedule.fallbackPhone}
                      onChange={e => setSchedule(s => ({ ...s, fallbackPhone: e.target.value }))}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="628xxx (nomor WA cadangan)" />
                  </div>
                )}
              </div>

              <div className="bg-white border rounded-lg p-5">
                <h3 className="font-semibold mb-1">Hari Libur Khusus</h3>
                <p className="text-xs text-gray-500 mb-3">Tanggal-tanggal ini dianggap tutup meski jatuh di hari kerja</p>
                <div className="flex gap-2 mb-3">
                  <input type="date" value={newHoliday} onChange={e => setNewHoliday(e.target.value)}
                    className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <button onClick={addHoliday} className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700 transition-colors">Tambah</button>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {Object.entries(HOLIDAY_NAMES).filter(([d]) => !schedule.holidays.includes(d)).slice(0, 4).map(([d, name]) => (
                    <button key={d} onClick={() => setSchedule(s => ({ ...s, holidays: [...s.holidays, d].sort() }))}
                      className="text-xs px-2 py-1 border border-dashed border-gray-300 rounded text-gray-500 hover:border-green-400 hover:text-green-700 transition-colors">
                      + {name} ({d})
                    </button>
                  ))}
                </div>
                {schedule.holidays.length > 0 ? (
                  <div className="space-y-1">
                    {schedule.holidays.map(d => (
                      <div key={d} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded text-sm">
                        <span className="text-gray-700">{d}{HOLIDAY_NAMES[d] ? ` — ${HOLIDAY_NAMES[d]}` : ""}</span>
                        <button onClick={() => setSchedule(s => ({ ...s, holidays: s.holidays.filter(h => h !== d) }))}
                          className="text-red-400 hover:text-red-600 text-xs ml-2">Hapus</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Belum ada hari libur khusus</p>
                )}
              </div>
            </>
          )}

          <button onClick={saveSchedule} disabled={savingSchedule}
            className="w-full py-3 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors">
            {savingSchedule ? "Menyimpan..." : "Simpan Jadwal Operasional"}
          </button>
        </div>
      )}
    </div>
  );
}
