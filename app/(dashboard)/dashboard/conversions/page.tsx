"use client";
import { useState } from "react";
import { toast } from "sonner";
import { CURRENCIES, CurrencyCode, formatCurrency } from "@/lib/currencies";

interface Lead {
  id: string;
  clickedAt: string;
  utmSource: string;
  utmCampaign: string;
  phone: string;
  csAssigned: string;
  converted: boolean;
  conversionValue?: number;
  currency?: CurrencyCode;
}

// Demo data — will be replaced with real Supabase data
const demoLeads: Lead[] = [
  { id: "1", clickedAt: "2025-07-01 09:14", utmSource: "instagram", utmCampaign: "promo-juli", phone: "628111xxx", csAssigned: "CS Andi", converted: false },
  { id: "2", clickedAt: "2025-07-01 10:02", utmSource: "tiktok", utmCampaign: "fyp-ads", phone: "628222xxx", csAssigned: "CS Budi", converted: true, conversionValue: 350000, currency: "IDR" },
  { id: "3", clickedAt: "2025-07-01 11:30", utmSource: "instagram", utmCampaign: "promo-juli", phone: "628333xxx", csAssigned: "CS Andi", converted: false },
  { id: "4", clickedAt: "2025-07-01 12:55", utmSource: "facebook", utmCampaign: "remarketing", phone: "628444xxx", csAssigned: "CS Citra", converted: true, conversionValue: 480, currency: "HKD" },
  { id: "5", clickedAt: "2025-07-01 14:10", utmSource: "tiktok", utmCampaign: "fyp-ads", phone: "628555xxx", csAssigned: "CS Budi", converted: false },
  { id: "6", clickedAt: "2025-07-01 15:22", utmSource: "google", utmCampaign: "brand-search", phone: "628666xxx", csAssigned: "CS Citra", converted: true, conversionValue: 320, currency: "MYR" },
];

const sourceColors: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  tiktok: "bg-gray-900 text-white",
  facebook: "bg-blue-100 text-blue-700",
  google: "bg-yellow-100 text-yellow-700",
};

export default function ConversionsPage() {
  const [leads, setLeads] = useState<Lead[]>(demoLeads);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("IDR");
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "converted">("all");

  const convertedLeads = leads.filter((l) => l.converted);
  const conversionRate = Math.round((convertedLeads.length / leads.length) * 100);

  // Group revenue by currency
  const revenueByCurrency = convertedLeads.reduce<Partial<Record<CurrencyCode, number>>>((acc, l) => {
    if (!l.conversionValue || !l.currency) return acc;
    acc[l.currency] = (acc[l.currency] ?? 0) + l.conversionValue;
    return acc;
  }, {});

  async function handleMarkConverted(leadId: string) {
    if (!value || isNaN(Number(value))) {
      toast.error("Masukkan nilai transaksi yang valid");
      return;
    }
    setSubmitting(true);

    // In production: call /api/conversions with clickId + value
    // For demo: update local state
    await new Promise((r) => setTimeout(r, 800));
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, converted: true, conversionValue: Number(value), currency } : l
      )
    );
    toast.success(`✓ Konversi ${formatCurrency(Number(value), currency)} ditandai & dikirim ke Meta CAPI`);
    setSelectedId(null);
    setValue("");
    setOrderId("");
    setSubmitting(false);
  }

  const filtered = leads.filter((l) =>
    filter === "all" ? true : filter === "converted" ? l.converted : !l.converted
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Konversi</h1>
      <p className="text-gray-500 text-sm mb-6">Tandai deal yang berhasil — sistem otomatis kirim Purchase event ke Meta</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Total Lead Masuk</p>
          <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">hari ini</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Sudah Konversi</p>
          <p className="text-2xl font-bold text-gray-900">{convertedLeads.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">{conversionRate}% rate</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Belum Ditandai</p>
          <p className="text-2xl font-bold text-gray-900">{leads.filter((l) => !l.converted).length}</p>
          <p className="text-xs text-gray-400 mt-0.5">perlu follow-up</p>
        </div>
        {/* Multi-currency revenue card */}
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-2">Total Revenue</p>
          <div className="space-y-0.5">
            {Object.entries(revenueByCurrency).length === 0 ? (
              <p className="text-gray-400 text-sm">—</p>
            ) : (
              Object.entries(revenueByCurrency).map(([code, val]) => (
                <p key={code} className="text-sm font-semibold text-gray-900">
                  {CURRENCIES[code as CurrencyCode].flag} {formatCurrency(val!, code as CurrencyCode)}
                </p>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "pending", "converted"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter === f ? "bg-gray-900 text-white" : "border text-gray-500 hover:bg-gray-50"
            }`}
          >
            {{ all: "Semua", pending: "Belum Ditandai", converted: "Sudah Konversi" }[f]}
          </button>
        ))}
      </div>

      {/* Leads table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Waktu</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sumber</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kampanye</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">CS</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nilai</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((lead) => (
                <>
                  <tr key={lead.id} className={`hover:bg-gray-50 ${selectedId === lead.id ? "bg-green-50" : ""}`}>
                    <td className="px-4 py-3 text-gray-500 text-xs">{lead.clickedAt}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${sourceColors[lead.utmSource] ?? "bg-gray-100 text-gray-600"}`}>
                        {lead.utmSource}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{lead.utmCampaign}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs font-medium">{lead.csAssigned}</td>
                    <td className="px-4 py-3">
                      {lead.converted ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">✓ Konversi</span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-sm font-medium font-mono">
                      {lead.conversionValue && lead.currency
                        ? `${CURRENCIES[lead.currency].flag} ${formatCurrency(lead.conversionValue, lead.currency)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {!lead.converted && (
                        <button
                          onClick={() => setSelectedId(selectedId === lead.id ? null : lead.id)}
                          className="text-xs px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
                        >
                          Tandai Terjual
                        </button>
                      )}
                    </td>
                  </tr>
                  {selectedId === lead.id && (
                    <tr key={`${lead.id}-form`} className="bg-green-50">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="flex items-end gap-3 flex-wrap">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Currency *</label>
                            <select
                              value={currency}
                              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                              className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                                <option key={c} value={c}>
                                  {CURRENCIES[c].flag} {c} — {CURRENCIES[c].name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nilai Transaksi *</label>
                            <input
                              autoFocus
                              type="number"
                              value={value}
                              onChange={(e) => setValue(e.target.value)}
                              className="border rounded px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder={currency === "IDR" ? "350000" : "150"}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">ID Order (opsional)</label>
                            <input
                              type="text"
                              value={orderId}
                              onChange={(e) => setOrderId(e.target.value)}
                              className="border rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="ORD-001"
                            />
                          </div>
                          <button
                            onClick={() => handleMarkConverted(lead.id)}
                            disabled={submitting}
                            className="px-4 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {submitting ? "Mengirim ke Meta..." : "Konfirmasi & Kirim ke Meta"}
                          </button>
                          <button
                            onClick={() => setSelectedId(null)}
                            className="px-3 py-1.5 text-gray-500 hover:text-gray-800 text-sm"
                          >
                            Batal
                          </button>
                        </div>
                        <p className="text-xs text-green-700 mt-2">
                          ↑ Nilai ini akan dikirim sebagai event <strong>Purchase</strong> ke Meta CAPI — ROAS di Ads Manager akan terupdate otomatis.
                        </p>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
