"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { CURRENCIES, CurrencyCode, formatCurrency, convertTo } from "@/lib/currencies";
import DateFilter from "@/components/date-filter";
import { DatePreset, DateRange, getDateRange, getGranularity, generateTicks, scaleDemoValue } from "@/lib/date-filter";
import { TIER_FEATURES } from "@/lib/tiers";
import { useTier } from "@/lib/use-tier";
import { toast } from "sonner";
import { isSupabaseConfigured } from "@/lib/supabase";

// ── Demo fallback data ────────────────────────────────────────────────────────
const BASE_REVENUE: Record<CurrencyCode, { revenue: number; conversions: number; leads: number; spend: number }> = {
  IDR: { revenue: 12_400_000, conversions: 34, leads: 89,  spend: 2_100_000 },
  USD: { revenue: 4_280,      conversions: 18, leads: 52,  spend: 890 },
  HKD: { revenue: 28_500,     conversions: 12, leads: 38,  spend: 6_200 },
  TWD: { revenue: 95_000,     conversions: 9,  leads: 27,  spend: 22_000 },
  MYR: { revenue: 8_750,      conversions: 15, leads: 41,  spend: 1_900 },
};
const BASE_CLICKS: Record<CurrencyCode, number> = { IDR: 76, USD: 19, HKD: 12, TWD: 9, MYR: 8 };
const BASE_CHANNELS = [
  { channel: "TikTok Ads",    icon: "🎵", leads: 215, conversions: 28, spend_usd: 380 },
  { channel: "Instagram Ads", icon: "📸", leads: 183, conversions: 22, spend_usd: 290 },
  { channel: "Facebook Ads",  icon: "👤", leads: 98,  conversions: 10, spend_usd: 185 },
  { channel: "Bio Link",      icon: "🔗", leads: 74,  conversions: 8,  spend_usd: 0   },
  { channel: "Langsung",      icon: "💬", leads: 43,  conversions: 5,  spend_usd: 0   },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface AnalyticsData {
  configured: boolean;
  totalLeads: number;
  totalConversions: number;
  revenueByCurrency: Record<string, { revenue: number; conversions: number }>;
  byChannel: Record<string, { leads: number; conversions: number }>;
  byDay: Record<string, number>;
}

const CHANNEL_ICONS: Record<string, string> = {
  instagram: "📸", tiktok: "🎵", facebook: "👤", google: "🔍",
  bio: "🔗", langsung: "💬",
};

const CURRENCY_COLORS: Record<CurrencyCode, string> = {
  IDR: "#16a34a", USD: "#2563eb", HKD: "#dc2626", TWD: "#7c3aed", MYR: "#ea580c",
};

export default function AnalyticsPage() {
  const tier      = useTier();
  const canExport = TIER_FEATURES[tier].exportReports;
  const isReal    = isSupabaseConfigured();

  const [preset, setPreset]         = useState<DatePreset>("7d");
  const [customRange, setCustomRange] = useState<DateRange>(getDateRange("7d"));
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>("IDR");
  const [activeCurrencies, setActiveCurrencies] = useState<CurrencyCode[]>(["IDR", "USD", "HKD", "TWD", "MYR"]);
  const [realData, setRealData]     = useState<AnalyticsData | null>(null);
  const [loading, setLoading]       = useState(isReal);

  const range = getDateRange(preset, customRange);
  const granularity = getGranularity(range);

  const fetchReal = useCallback(async (from: string, to: string) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      const data = await res.json();
      if (data.configured) setRealData(data);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isReal) return;
    fetchReal(range.from.toISOString(), range.to.toISOString());
  }, [preset, customRange]); // eslint-disable-line

  function handleDateChange(p: DatePreset, r: DateRange) { setPreset(p); setCustomRange(r); }

  function handleExport(format: "excel" | "pdf") {
    if (!canExport) { toast.error("Upgrade ke Pro untuk export laporan"); return; }
    toast.success(`Laporan ${format.toUpperCase()} sedang disiapkan... (demo)`);
  }

  const hasRealData = isReal && realData && (realData.totalLeads > 0 || realData.totalConversions > 0);
  const granularityLabel: Record<typeof granularity, string> = {
    hour: "per jam", day: "per hari", week: "per minggu", month: "per bulan",
  };

  // ── Real data path ────────────────────────────────────────────────────────
  const realRevCurrencies = realData ? (Object.keys(realData.revenueByCurrency) as CurrencyCode[]) : [];
  const totalRealLeads       = realData?.totalLeads ?? 0;
  const totalRealConversions = realData?.totalConversions ?? 0;
  const totalRealRevenue     = realRevCurrencies.reduce((s, c) =>
    s + convertTo(realData!.revenueByCurrency[c].revenue, c, displayCurrency), 0);

  const realChannelRows = realData
    ? Object.entries(realData.byChannel).map(([src, v]) => ({
        channel: src.charAt(0).toUpperCase() + src.slice(1),
        icon: CHANNEL_ICONS[src.toLowerCase()] ?? "💬",
        leads: v.leads,
        conversions: v.conversions,
        convRate: v.leads > 0 ? ((v.conversions / v.leads) * 100).toFixed(0) : "0",
      })).sort((a, b) => b.leads - a.leads)
    : [];

  // Click-by-day chart (real)
  const realClickChart = realData
    ? Object.entries(realData.byDay).map(([day, count]) => ({ day: day.slice(5), clicks: count }))
    : [];

  // Revenue by currency chart (real)
  const realRevChart = realRevCurrencies.map(c => ({
    name: `${CURRENCIES[c]?.flag ?? ""} ${c}`,
    val: Math.round(convertTo(realData!.revenueByCurrency[c].revenue, c, displayCurrency)),
    fill: CURRENCY_COLORS[c] ?? "#888",
  }));

  // ── Demo data path ────────────────────────────────────────────────────────
  const revenueData = useMemo(() =>
    (Object.keys(BASE_REVENUE) as CurrencyCode[]).map(c => {
      const b = BASE_REVENUE[c];
      return {
        currency: c,
        revenue:     scaleDemoValue(b.revenue,     range, false),
        conversions: scaleDemoValue(b.conversions, range, false),
        leads:       scaleDemoValue(b.leads,       range, false),
        spend:       scaleDemoValue(b.spend,       range, false),
      };
    }), [preset, customRange]); // eslint-disable-line

  const ticks = useMemo(() => generateTicks(range, granularity), [preset, customRange]); // eslint-disable-line
  const clickChartData = useMemo(() =>
    ticks.map((tick, i) => {
      const row: Record<string, string | number> = { day: tick };
      (Object.keys(BASE_CLICKS) as CurrencyCode[]).forEach(c => {
        const base = BASE_CLICKS[c] / (ticks.length / 7);
        row[c] = Math.max(0, Math.round(base * (0.6 + 0.8 * Math.abs(Math.sin(i * 0.9 + c.charCodeAt(0))))));
      });
      return row;
    }), [ticks]); // eslint-disable-line

  const activeData = revenueData.filter(r => activeCurrencies.includes(r.currency));
  const demoTotalRevenue    = activeData.reduce((s, r) => s + convertTo(r.revenue, r.currency, displayCurrency), 0);
  const demoTotalSpend      = activeData.reduce((s, r) => s + convertTo(r.spend, r.currency, displayCurrency), 0);
  const demoTotalLeads      = activeData.reduce((s, r) => s + r.leads, 0);
  const demoTotalConversions = activeData.reduce((s, r) => s + r.conversions, 0);
  const demoROAS            = demoTotalSpend > 0 ? (demoTotalRevenue / demoTotalSpend).toFixed(1) : "—";
  const avgOrderValue       = demoTotalConversions > 0 ? demoTotalRevenue / demoTotalConversions : 0;
  const channelData = useMemo(() => BASE_CHANNELS.map(ch => {
    const leads       = scaleDemoValue(ch.leads, range, false);
    const conversions = scaleDemoValue(ch.conversions, range, false);
    const spendIDR    = ch.spend_usd * (1 / 0.000062);
    const spend       = convertTo(scaleDemoValue(spendIDR, range, false), "IDR", displayCurrency);
    const convRate    = leads > 0 ? ((conversions / leads) * 100).toFixed(0) : "0";
    const roas        = spend > 0 ? ((conversions * avgOrderValue) / spend).toFixed(1) : "—";
    return { ...ch, leads, conversions, spend, convRate, roas };
  }), [preset, customRange, displayCurrency, avgOrderValue]); // eslint-disable-line

  const dc = CURRENCIES[displayCurrency];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">Analytics</h1>
          <p className="text-gray-500 text-sm">
            {granularityLabel[granularity]} ·{" "}
            {loading ? "memuat..." : hasRealData ? <span className="text-green-600 font-medium">data real</span> : <span className="text-amber-600">data demo — mulai tracking untuk melihat data real</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <button onClick={() => handleExport("excel")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${canExport ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100" : "border-gray-200 text-gray-300 cursor-not-allowed"}`}>
              📊 Excel {!canExport && "🔒"}
            </button>
            <button onClick={() => handleExport("pdf")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${canExport ? "border-red-300 text-red-700 bg-red-50 hover:bg-red-100" : "border-gray-200 text-gray-300 cursor-not-allowed"}`}>
              📄 PDF {!canExport && "🔒"}
            </button>
          </div>
          <DateFilter preset={preset} customRange={customRange} onChange={handleDateChange} />
          <div className="flex items-center gap-2 border rounded px-3 py-1.5 bg-white">
            <span className="text-xs text-gray-400 whitespace-nowrap">Tampilkan dalam</span>
            <select value={displayCurrency} onChange={e => setDisplayCurrency(e.target.value as CurrencyCode)}
              className="text-sm font-semibold focus:outline-none bg-transparent cursor-pointer">
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map(c => (
                <option key={c} value={c}>{CURRENCIES[c].flag} {c}</option>
              ))}
            </select>
          </div>
          {!hasRealData && (
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map(code => {
                const cur = CURRENCIES[code]; const active = activeCurrencies.includes(code);
                return (
                  <button key={code}
                    onClick={() => setActiveCurrencies(prev =>
                      prev.includes(code) ? (prev.length > 1 ? prev.filter(c => c !== code) : prev) : [...prev, code]
                    )}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium transition-all ${active ? "text-white border-transparent" : "bg-white text-gray-400 border-gray-200"}`}
                    style={active ? { backgroundColor: CURRENCY_COLORS[code], borderColor: CURRENCY_COLORS[code] } : {}}>
                    <span>{cur.flag}</span><span>{code}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* KPI cards */}
      {hasRealData ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: `Total Revenue (${dc.flag} ${displayCurrency})`, value: formatCurrency(totalRealRevenue, displayCurrency), sub: `${realRevCurrencies.length} mata uang` },
            { label: "Total Leads",    value: totalRealLeads.toString(),       sub: "klik ke WA" },
            { label: "Total Konversi", value: totalRealConversions.toString(), sub: `${totalRealLeads > 0 ? ((totalRealConversions/totalRealLeads)*100).toFixed(0) : 0}% conv. rate` },
            { label: "Conv. Rate",     value: `${totalRealLeads > 0 ? ((totalRealConversions/totalRealLeads)*100).toFixed(1) : 0}%`, sub: "dari total klik" },
          ].map(s => (
            <div key={s.label} className="bg-white border rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: `Total Revenue (${dc.flag} ${displayCurrency})`, value: formatCurrency(demoTotalRevenue, displayCurrency), sub: `${activeCurrencies.length} pasar aktif` },
            { label: "Total Leads",    value: demoTotalLeads.toString(),       sub: "klik ke WA" },
            { label: "Total Konversi", value: demoTotalConversions.toString(), sub: `${demoTotalLeads > 0 ? ((demoTotalConversions/demoTotalLeads)*100).toFixed(0) : 0}% conv. rate` },
            { label: "Blended ROAS",   value: `${demoROAS}x`,                 sub: `basis ${displayCurrency}` },
          ].map(s => (
            <div key={s.label} className="bg-white border rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue / Channel tables */}
      {hasRealData ? (
        <>
          {/* Real: Revenue by currency */}
          {realRevCurrencies.length > 0 && (
            <div className="bg-white border rounded-lg overflow-hidden mb-6">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-sm">Revenue per Mata Uang</h2>
                <span className="text-xs text-gray-400">Semua nilai dalam {dc.flag} {displayCurrency}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {["Mata Uang", "Konversi", `Revenue (${displayCurrency})`].map(h => (
                        <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "Mata Uang" ? "text-left" : "text-right"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {realRevCurrencies.map(c => {
                      const cur = CURRENCIES[c] ?? { flag: "", name: c };
                      const d   = realData!.revenueByCurrency[c];
                      return (
                        <tr key={c} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{cur.flag} {cur.name} ({c})</td>
                          <td className="px-4 py-3 text-right text-gray-700">{d.conversions}</td>
                          <td className="px-4 py-3 text-right font-semibold font-mono text-xs">{formatCurrency(convertTo(d.revenue, c, displayCurrency), displayCurrency)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Real: Channel table */}
          <div className="bg-white border rounded-lg overflow-hidden mb-6">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-sm">Performa per Channel</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Channel", "Leads", "Konversi", "Conv. Rate"].map(h => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "Channel" ? "text-left" : "text-right"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {realChannelRows.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">Belum ada data channel</td></tr>
                  ) : realChannelRows.map(ch => (
                    <tr key={ch.channel} className="hover:bg-gray-50">
                      <td className="px-4 py-3"><span className="mr-1.5">{ch.icon}</span><span className="font-medium">{ch.channel}</span></td>
                      <td className="px-4 py-3 text-right text-gray-700">{ch.leads}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{ch.conversions}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${Number(ch.convRate) >= 12 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{ch.convRate}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Demo: Per-market table */}
          <div className="bg-white border rounded-lg overflow-hidden mb-6">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-sm">Performa per Pasar <span className="text-xs font-normal text-amber-500 ml-2">demo</span></h2>
              <span className="text-xs text-gray-400">Semua nilai dalam {dc.flag} {dc.name} ({displayCurrency})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Pasar", "Leads", "Konversi", "Conv. Rate", `Ad Spend (${displayCurrency})`, `Revenue (${displayCurrency})`, "ROAS"].map(h => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "Pasar" ? "text-left" : "text-right"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activeData.map(row => {
                    const cur = CURRENCIES[row.currency];
                    const rev   = convertTo(row.revenue, row.currency, displayCurrency);
                    const spend = convertTo(row.spend, row.currency, displayCurrency);
                    const roas  = spend > 0 ? (rev / spend).toFixed(1) : "—";
                    const convRate = row.leads > 0 ? ((row.conversions / row.leads) * 100).toFixed(0) : "0";
                    return (
                      <tr key={row.currency} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CURRENCY_COLORS[row.currency] }} />
                            <span className="font-medium">{cur.flag} {cur.name}</span>
                            <span className="text-xs text-gray-400">({row.currency})</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">{row.leads}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{row.conversions}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${Number(convRate) >= 30 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{convRate}%</span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600 font-mono text-xs">{formatCurrency(spend, displayCurrency)}</td>
                        <td className="px-4 py-3 text-right font-semibold font-mono text-xs">{formatCurrency(rev, displayCurrency)}</td>
                        <td className="px-4 py-3 text-right"><span className={`font-bold ${Number(roas) >= 3 ? "text-green-600" : "text-red-500"}`}>{roas}x</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Demo: Channel table */}
          <div className="bg-white border rounded-lg overflow-hidden mb-6">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-sm">Performa per Channel Iklan <span className="text-xs font-normal text-amber-500 ml-2">demo</span></h2>
              <span className="text-xs text-gray-400">Nilai dalam {dc.flag} {displayCurrency}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Channel", "Leads", "Konversi", "Conv. Rate", `Ad Spend (${displayCurrency})`, "ROAS"].map(h => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "Channel" ? "text-left" : "text-right"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {channelData.map(ch => (
                    <tr key={ch.channel} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="mr-1.5">{ch.icon}</span><span className="font-medium">{ch.channel}</span>
                        {ch.spend_usd === 0 && <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">organik</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{ch.leads}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{ch.conversions}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${Number(ch.convRate) >= 12 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{ch.convRate}%</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 font-mono text-xs">
                        {ch.spend > 0 ? formatCurrency(ch.spend, displayCurrency) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {ch.roas !== "—"
                          ? <span className={`font-bold ${Number(ch.roas) >= 3 ? "text-green-600" : "text-red-500"}`}>{ch.roas}x</span>
                          : <span className="text-gray-300 text-xs">organik</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold mb-1 text-sm">
            Klik per Hari {!hasRealData && <span className="text-xs font-normal text-amber-500 ml-1">demo</span>}
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            {hasRealData ? (
              <BarChart data={realClickChart}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(realClickChart.length / 8) - 1)} />
                <YAxis tick={{ fontSize: 10 }} width={28} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="clicks" fill="#16a34a" radius={[3, 3, 0, 0]} name="Klik" />
              </BarChart>
            ) : (
              <LineChart data={clickChartData}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(ticks.length / 8) - 1)} />
                <YAxis tick={{ fontSize: 10 }} width={28} />
                <Tooltip />
                {activeCurrencies.map(code => (
                  <Line key={code} type="monotone" dataKey={code} stroke={CURRENCY_COLORS[code]} strokeWidth={2} dot={false} name={`${CURRENCIES[code].flag} ${code}`} />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold mb-1 text-sm">
            Revenue per {hasRealData ? "Mata Uang" : "Pasar"} ({dc.flag} {displayCurrency})
            {!hasRealData && <span className="text-xs font-normal text-amber-500 ml-1">demo</span>}
          </h2>
          <p className="text-xs text-gray-400 mb-4">Periode yang dipilih</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hasRealData ? realRevChart : activeData.map(r => ({
              name: `${CURRENCIES[r.currency].flag} ${r.currency}`,
              val: Math.round(convertTo(r.revenue, r.currency, displayCurrency)),
              fill: CURRENCY_COLORS[r.currency],
            }))}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={50}
                tickFormatter={v => {
                  const sym = dc.symbol ?? "";
                  return sym + (v >= 1_000_000 ? (v/1_000_000).toFixed(1)+"M" : v >= 1_000 ? (v/1_000).toFixed(0)+"K" : v);
                }} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0), displayCurrency), "Revenue"]} />
              <Bar dataKey="val" radius={[3, 3, 0, 0]} fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
