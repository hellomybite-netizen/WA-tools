"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { CURRENCIES, CurrencyCode, formatCurrency, convertToUSD } from "@/lib/currencies";

const clickData = [
  { day: "Sen", IDR: 45, USD: 12, HKD: 8, TWD: 6, MYR: 5 },
  { day: "Sel", IDR: 72, USD: 18, HKD: 11, TWD: 9, MYR: 7 },
  { day: "Rab", IDR: 58, USD: 14, HKD: 9, TWD: 7, MYR: 6 },
  { day: "Kam", IDR: 91, USD: 22, HKD: 14, TWD: 11, MYR: 9 },
  { day: "Jum", IDR: 112, USD: 28, HKD: 18, TWD: 14, MYR: 11 },
  { day: "Sab", IDR: 87, USD: 21, HKD: 13, TWD: 10, MYR: 9 },
  { day: "Min", IDR: 64, USD: 16, HKD: 10, TWD: 8, MYR: 7 },
];

const revenueData: { currency: CurrencyCode; revenue: number; conversions: number; leads: number; spend: number }[] = [
  { currency: "IDR", revenue: 12_400_000, conversions: 34, leads: 89,  spend: 2_100_000 },
  { currency: "USD", revenue: 4_280,      conversions: 18, leads: 52,  spend: 890 },
  { currency: "HKD", revenue: 28_500,     conversions: 12, leads: 38,  spend: 6_200 },
  { currency: "TWD", revenue: 95_000,     conversions: 9,  leads: 27,  spend: 22_000 },
  { currency: "MYR", revenue: 8_750,      conversions: 15, leads: 41,  spend: 1_900 },
];

const sourceData = [
  { source: "Instagram", clicks: 215, pct: 38 },
  { source: "TikTok",    clicks: 183, pct: 32 },
  { source: "Facebook",  clicks: 98,  pct: 17 },
  { source: "Langsung",  clicks: 73,  pct: 13 },
];

const CURRENCY_COLORS: Record<CurrencyCode, string> = {
  IDR: "#16a34a",
  USD: "#2563eb",
  HKD: "#dc2626",
  TWD: "#7c3aed",
  MYR: "#ea580c",
};

export default function AnalyticsPage() {
  const [activeCurrencies, setActiveCurrencies] = useState<CurrencyCode[]>(["IDR", "USD", "HKD", "TWD", "MYR"]);
  const [reportCurrency, setReportCurrency] = useState<CurrencyCode>("IDR");

  function toggleCurrency(code: CurrencyCode) {
    setActiveCurrencies((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  // Total USD-equivalent untuk summary
  const totalRevenueUSD = revenueData
    .filter((r) => activeCurrencies.includes(r.currency))
    .reduce((s, r) => s + convertToUSD(r.revenue, r.currency), 0);

  const totalLeads = revenueData
    .filter((r) => activeCurrencies.includes(r.currency))
    .reduce((s, r) => s + r.leads, 0);

  const totalConversions = revenueData
    .filter((r) => activeCurrencies.includes(r.currency))
    .reduce((s, r) => s + r.conversions, 0);

  const totalSpendUSD = revenueData
    .filter((r) => activeCurrencies.includes(r.currency))
    .reduce((s, r) => s + convertToUSD(r.spend, r.currency), 0);

  const overallROAS = totalSpendUSD > 0 ? (totalRevenueUSD / totalSpendUSD).toFixed(1) : "—";

  const filteredClicks = clickData.map((d) => ({
    day: d.day,
    total: activeCurrencies.reduce((s, c) => s + (d[c] ?? 0), 0),
    ...Object.fromEntries(activeCurrencies.map((c) => [c, d[c] ?? 0])),
  }));

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">Analytics</h1>
          <p className="text-gray-500 text-sm">7 hari terakhir · semua currency (data demo)</p>
        </div>
        {/* Currency filter */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
            const cur = CURRENCIES[code];
            const active = activeCurrencies.includes(code);
            return (
              <button
                key={code}
                onClick={() => toggleCurrency(code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm font-medium transition-all ${
                  active
                    ? "text-white border-transparent"
                    : "bg-white text-gray-400 border-gray-200"
                }`}
                style={active ? { backgroundColor: CURRENCY_COLORS[code], borderColor: CURRENCY_COLORS[code] } : {}}
              >
                <span>{cur.flag}</span>
                <span>{code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global summary (USD equivalent) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Revenue (≈ USD)", value: `$${totalRevenueUSD.toFixed(0)}`, sub: "semua currency" },
          { label: "Total Leads", value: totalLeads.toString(), sub: "klik ke WA" },
          { label: "Total Konversi", value: totalConversions.toString(), sub: `${((totalConversions/totalLeads)*100).toFixed(0)}% rate` },
          { label: "Blended ROAS", value: `${overallROAS}x`, sub: "≈ USD basis" },
        ].map((s) => (
          <div key={s.label} className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Per-currency breakdown */}
      <div className="bg-white border rounded-lg overflow-hidden mb-6">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm">Performa per Currency</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 text-xs">Tampilkan dalam:</span>
            <select
              value={reportCurrency}
              onChange={(e) => setReportCurrency(e.target.value as CurrencyCode)}
              className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                <option key={c} value={c}>{CURRENCIES[c].flag} {c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Akun / Currency</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Leads</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Konversi</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Conv. Rate</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ad Spend</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {revenueData.filter((r) => activeCurrencies.includes(r.currency)).map((row) => {
                const cur = CURRENCIES[row.currency];
                const roas = (row.revenue / row.spend).toFixed(1);
                const convRate = ((row.conversions / row.leads) * 100).toFixed(0);
                return (
                  <tr key={row.currency} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CURRENCY_COLORS[row.currency] }}
                        />
                        <span className="font-medium text-gray-800">{cur.flag} {cur.name}</span>
                        <span className="text-xs text-gray-400">({row.currency})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{row.leads}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{row.conversions}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${Number(convRate) >= 30 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {convRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 font-mono text-xs">
                      {formatCurrency(row.spend, row.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 font-mono text-xs">
                      {formatCurrency(row.revenue, row.currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold text-sm ${Number(roas) >= 3 ? "text-green-600" : "text-red-500"}`}>
                        {roas}x
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2">
              <tr>
                <td className="px-5 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Total (≈ USD)</td>
                <td className="px-4 py-3 text-right font-semibold">{totalLeads}</td>
                <td className="px-4 py-3 text-right font-semibold">{totalConversions}</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-700">
                    {((totalConversions / totalLeads) * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold font-mono text-xs">
                  ${totalSpendUSD.toFixed(0)}
                </td>
                <td className="px-4 py-3 text-right font-bold font-mono text-xs">
                  ${totalRevenueUSD.toFixed(0)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-green-600">{overallROAS}x</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold mb-4 text-sm">Klik per Hari per Currency</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={filteredClicks}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={30} />
              <Tooltip />
              {activeCurrencies.map((code) => (
                <Line
                  key={code}
                  type="monotone"
                  dataKey={code}
                  stroke={CURRENCY_COLORS[code]}
                  strokeWidth={2}
                  dot={false}
                  name={`${CURRENCIES[code].flag} ${code}`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold mb-4 text-sm">Revenue per Currency (≈ USD)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={revenueData
                .filter((r) => activeCurrencies.includes(r.currency))
                .map((r) => ({
                  name: `${CURRENCIES[r.currency].flag} ${r.currency}`,
                  usd: Math.round(convertToUSD(r.revenue, r.currency)),
                  fill: CURRENCY_COLORS[r.currency],
                }))}
            >
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={40} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => [`$${v}`, "Revenue (USD)"]} />
              <Bar dataKey="usd" radius={[3, 3, 0, 0]}>
                {revenueData
                  .filter((r) => activeCurrencies.includes(r.currency))
                  .map((r) => (
                    <rect key={r.currency} fill={CURRENCY_COLORS[r.currency]} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source breakdown */}
      <div className="bg-white border rounded-lg p-5">
        <h2 className="font-semibold mb-4 text-sm">Sumber Traffic (gabungan semua currency)</h2>
        <div className="space-y-3">
          {sourceData.map((s) => (
            <div key={s.source} className="flex items-center gap-3">
              <span className="text-sm w-24 text-gray-600">{s.source}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${s.pct}%` }} />
              </div>
              <span className="text-sm text-gray-500 w-10 text-right">{s.clicks}</span>
              <span className="text-xs text-gray-400 w-8">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
