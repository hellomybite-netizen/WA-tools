"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { DEMO_CONTACTS, CONTACT_STATUS, ContactStatus, Contact } from "@/lib/crm";
import { CURRENCIES, CurrencyCode, formatCurrency, convertToUSD } from "@/lib/currencies";
import DateFilter from "@/components/date-filter";
import { DatePreset, DateRange, getDateRange, getGranularity, generateTicks, scaleDemoValue, formatDateLabel } from "@/lib/date-filter";
import { TIER_FEATURES } from "@/lib/tiers";
import { useTier } from "@/lib/use-tier";
import { toast } from "sonner";

const SOURCE_COLORS: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  tiktok:    "bg-gray-900 text-white",
  facebook:  "bg-blue-100 text-blue-700",
  google:    "bg-yellow-100 text-yellow-700",
};

// Base 7-day demo values for CRM chart
const BASE_NEW_CONTACTS = 6;
const BASE_CONVERSIONS  = 4;
const BASE_PIPELINE_VALUE = 3_200_000; // IDR equivalent

export default function CRMPage() {
  const tier = useTier();
  const canExport = TIER_FEATURES[tier].exportReports;

  function handleExport(format: "excel" | "pdf") {
    if (!canExport) { toast.error("Upgrade ke Pro untuk export laporan"); return; }
    toast.success(`Laporan CRM ${format.toUpperCase()} sedang disiapkan... (demo)`);
  }

  const [contacts] = useState<Contact[]>(DEMO_CONTACTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all");
  const [view, setView] = useState<"list" | "pipeline" | "analytics">("list");
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [customRange, setCustomRange] = useState<DateRange>(getDateRange("30d"));

  function handleDateChange(p: DatePreset, r: DateRange) {
    setPreset(p);
    setCustomRange(r);
  }

  const range = getDateRange(preset, customRange);
  const granularity = getGranularity(range);
  const ticks = useMemo(() => generateTicks(range, granularity), [preset, customRange]); // eslint-disable-line

  // Scaled summary stats
  const scaledNew   = useMemo(() => scaleDemoValue(BASE_NEW_CONTACTS, range, false), [preset, customRange]); // eslint-disable-line
  const scaledConv  = useMemo(() => scaleDemoValue(BASE_CONVERSIONS,  range, false), [preset, customRange]); // eslint-disable-line
  const convRate    = scaledNew > 0 ? Math.round((scaledConv / scaledNew) * 100) : 0;

  // Chart: new contacts vs conversions per tick
  const chartData = useMemo(() =>
    ticks.map((tick, i) => ({
      day: tick,
      kontak: Math.max(0, Math.round((BASE_NEW_CONTACTS / ticks.length) * (0.5 + Math.abs(Math.sin(i * 0.7))) * 2)),
      konversi: Math.max(0, Math.round((BASE_CONVERSIONS / ticks.length) * (0.4 + Math.abs(Math.sin(i * 0.9 + 1))) * 2)),
    })),
    [ticks] // eslint-disable-line
  );

  // Source breakdown (scaled)
  const sourceChart = useMemo(() => [
    { source: "Instagram", value: scaleDemoValue(35, range, false) },
    { source: "TikTok",    value: scaleDemoValue(28, range, false) },
    { source: "Facebook",  value: scaleDemoValue(18, range, false) },
    { source: "Google",    value: scaleDemoValue(12, range, false) },
  ], [preset, customRange]); // eslint-disable-line

  // Pipeline + contact filters
  const stages = ["new", "contacted", "negotiating", "won", "lost"] as const;
  const stageLabels: Record<string, { label: string; color: string; bg: string }> = {
    new:         { label: "Baru",       color: "text-blue-700",   bg: "bg-blue-50" },
    contacted:   { label: "Dihubungi",  color: "text-yellow-700", bg: "bg-yellow-50" },
    negotiating: { label: "Negosiasi",  color: "text-orange-700", bg: "bg-orange-50" },
    won:         { label: "Menang ✓",   color: "text-green-700",  bg: "bg-green-50" },
    lost:        { label: "Kalah",      color: "text-gray-500",   bg: "bg-gray-50" },
  };

  const allDeals = contacts.flatMap(c => c.deals.map(d => ({ ...d, contact: c })));

  const filtered = contacts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    all: contacts.length,
    lead: contacts.filter(c => c.status === "lead").length,
    prospect: contacts.filter(c => c.status === "prospect").length,
    customer: contacts.filter(c => c.status === "customer").length,
    churned: contacts.filter(c => c.status === "churned").length,
  };

  const wonDeals   = allDeals.filter(d => d.stage === "won").length;
  const activeDeals = allDeals.filter(d => !["won","lost"].includes(d.stage)).length;

  const granularityLabel: Record<typeof granularity, string> = {
    hour: "per jam", day: "per hari", week: "per minggu", month: "per bulan",
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">CRM</h1>
          <p className="text-gray-500 text-sm">Kelola kontak, pipeline deal, dan riwayat interaksi</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExport("excel")}
            title={canExport ? "Export ke Excel" : "Upgrade ke Pro untuk export"}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${canExport ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100" : "border-gray-200 text-gray-300 cursor-not-allowed"}`}
          >📊 Excel {!canExport && "🔒"}</button>
          <button
            onClick={() => handleExport("pdf")}
            title={canExport ? "Export ke PDF" : "Upgrade ke Pro untuk export"}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${canExport ? "border-red-300 text-red-700 bg-red-50 hover:bg-red-100" : "border-gray-200 text-gray-300 cursor-not-allowed"}`}
          >📄 PDF {!canExport && "🔒"}</button>
          <DateFilter preset={preset} customRange={customRange} onChange={handleDateChange} />
          {(["list","pipeline","analytics"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-2 rounded text-sm font-medium border transition-colors ${view === v ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              {{ list: "☰ Kontak", pipeline: "⬜ Pipeline", analytics: "📊 Analitik" }[v]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards — always visible */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Kontak Baru",    value: scaledNew,                   sub: formatDateLabel(range) },
          { label: "Konversi",       value: scaledConv,                  sub: `${convRate}% conv. rate` },
          { label: "Deal Aktif",     value: activeDeals,                 sub: `${wonDeals} menang total` },
          { label: "Total Kontak",   value: contacts.length,             sub: "semua waktu" },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── LIST VIEW ── */}
      {view === "list" && (
        <>
          <div className="flex gap-3 mb-4 flex-wrap items-center">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, nomor, atau tag..."
              className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
            />
            <div className="flex gap-2 flex-wrap">
              {(["all", "lead", "prospect", "customer", "churned"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${statusFilter === s ? "bg-gray-900 text-white" : "border text-gray-500 hover:bg-gray-50"}`}
                >
                  {s === "all" ? "Semua" : CONTACT_STATUS[s].label} ({statusCounts[s]})
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kontak</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sumber</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tag</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">PIC</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deal</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                          {c.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${CONTACT_STATUS[c.status].color}`}>{CONTACT_STATUS[c.status].label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${SOURCE_COLORS[c.source] ?? "bg-gray-100 text-gray-600"}`}>{c.source}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {c.tags.map(t => <span key={t} className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{t}</span>)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{c.assignedTo}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-gray-900">
                      {c.totalValue > 0 ? `${CURRENCIES[c.currency].flag} ${formatCurrency(c.totalValue, c.currency)}` : <span className="text-gray-300 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{c.deals.length} deal · {c.deals.filter(d => d.stage === "won").length} menang</td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/crm/${c.id}`} className="text-xs px-3 py-1.5 border rounded hover:bg-gray-50 text-gray-600 font-medium transition-colors">Detail →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-3">🔍</p><p className="text-sm">Tidak ada kontak yang cocok</p></div>
            )}
          </div>
        </>
      )}

      {/* ── PIPELINE VIEW ── */}
      {view === "pipeline" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => {
            const stageDeals = allDeals.filter(d => d.stage === stage);
            const cfg = stageLabels[stage];
            return (
              <div key={stage} className="flex-shrink-0 w-64">
                <div className={`rounded-t-lg px-3 py-2 border border-b-0 ${cfg.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-xs bg-white rounded-full px-1.5 py-0.5 font-bold text-gray-600 border">{stageDeals.length}</span>
                  </div>
                </div>
                <div className={`min-h-64 border rounded-b-lg p-2 space-y-2 ${cfg.bg}`}>
                  {stageDeals.map(deal => (
                    <Link key={deal.id} href={`/dashboard/crm/${deal.contact.id}`}>
                      <div className="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
                        <p className="text-sm font-medium text-gray-900 mb-1">{deal.title}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">{deal.contact.name[0]}</div>
                          <span className="text-xs text-gray-500">{deal.contact.name}</span>
                        </div>
                        {deal.value > 0 && (
                          <p className="text-sm font-bold text-gray-900 font-mono">{CURRENCIES[deal.currency].flag} {formatCurrency(deal.value, deal.currency)}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SOURCE_COLORS[deal.source] ?? "bg-gray-100 text-gray-600"}`}>{deal.source}</span>
                          <span className="text-xs text-gray-400">{deal.createdAt}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {stageDeals.length === 0 && <div className="text-center py-8 text-gray-300 text-xs">Kosong</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ANALYTICS VIEW ── */}
      {view === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kontak baru vs konversi */}
            <div className="bg-white border rounded-lg p-5">
              <h2 className="font-semibold text-sm mb-1">Kontak Baru vs Konversi</h2>
              <p className="text-xs text-gray-400 mb-4">{granularityLabel[granularity]} · {ticks.length} titik data</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(ticks.length / 8) - 1)} />
                  <YAxis tick={{ fontSize: 10 }} width={24} />
                  <Tooltip />
                  <Line type="monotone" dataKey="kontak"   stroke="#2563eb" strokeWidth={2} dot={false} name="Kontak Baru" />
                  <Line type="monotone" dataKey="konversi" stroke="#16a34a" strokeWidth={2} dot={false} name="Konversi" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-600" /><span className="text-xs text-gray-500">Kontak Baru</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-green-600" /><span className="text-xs text-gray-500">Konversi</span></div>
              </div>
            </div>

            {/* Sumber kontak */}
            <div className="bg-white border rounded-lg p-5">
              <h2 className="font-semibold text-sm mb-1">Kontak per Sumber</h2>
              <p className="text-xs text-gray-400 mb-4">Periode yang dipilih</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sourceChart} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="source" tick={{ fontSize: 11 }} width={64} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#16a34a" radius={[0, 3, 3, 0]} name="Kontak" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status breakdown */}
          <div className="bg-white border rounded-lg p-5">
            <h2 className="font-semibold text-sm mb-4">Distribusi Status Kontak</h2>
            <div className="space-y-3">
              {(["lead","prospect","customer","churned"] as ContactStatus[]).map(s => {
                const count = contacts.filter(c => c.status === s).length;
                const pct = contacts.length > 0 ? Math.round((count / contacts.length) * 100) : 0;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded w-20 text-center ${CONTACT_STATUS[s].color}`}>{CONTACT_STATUS[s].label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm text-gray-600 font-medium w-6 text-right">{count}</span>
                    <span className="text-xs text-gray-400 w-8">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pipeline value */}
          <div className="bg-white border rounded-lg p-5">
            <h2 className="font-semibold text-sm mb-4">Nilai Pipeline per Stage</h2>
            <div className="space-y-3">
              {stages.filter(s => s !== "lost").map(s => {
                const stageDeals = allDeals.filter(d => d.stage === s);
                const totalUSD = stageDeals.reduce((sum, d) => sum + convertToUSD(d.value, d.currency), 0);
                const maxUSD = allDeals.reduce((sum, d) => sum + convertToUSD(d.value, d.currency), 0);
                const pct = maxUSD > 0 ? Math.round((totalUSD / maxUSD) * 100) : 0;
                const cfg = stageLabels[s];
                return (
                  <div key={s} className="flex items-center gap-3">
                    <span className={`text-xs font-semibold w-24 ${cfg.color}`}>{cfg.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: s === "won" ? "#16a34a" : s === "negotiating" ? "#ea580c" : "#2563eb" }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{stageDeals.length}</span>
                    <span className="text-sm font-semibold text-gray-900 w-20 text-right font-mono">${totalUSD.toFixed(0)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
