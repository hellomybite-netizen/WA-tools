"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CURRENCIES, CurrencyCode, formatCurrency } from "@/lib/currencies";
import { isSupabaseConfigured } from "@/lib/supabase";

interface ClickRow {
  id: string;
  clickedAt: string;
  utmSource: string;
  utmMedium: string | null;
  utmCampaign: string | null;
  linkLabel: string | null;
  phone: string;
  converted: boolean;
  conversionValue: number | null;
  currency: CurrencyCode | null;
  convertedAt: string | null;
}

const SOURCE_COLORS: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  tiktok: "bg-gray-900 text-white",
  facebook: "bg-blue-100 text-blue-700",
  google: "bg-yellow-100 text-yellow-700",
  langsung: "bg-gray-100 text-gray-600",
};

// Demo fallback when Supabase not configured
const DEMO_ROWS: ClickRow[] = [
  { id: "1", clickedAt: "2025-07-01 09:14", utmSource: "instagram", utmMedium: "stories", utmCampaign: "promo-juli", linkLabel: "IG Stories", phone: "628111xxx", converted: false, conversionValue: null, currency: null, convertedAt: null },
  { id: "2", clickedAt: "2025-07-01 10:02", utmSource: "tiktok", utmMedium: "fyp", utmCampaign: "fyp-ads", linkLabel: "TikTok Ads", phone: "628222xxx", converted: true, conversionValue: 350000, currency: "IDR", convertedAt: "2025-07-01 10:45" },
  { id: "3", clickedAt: "2025-07-01 11:30", utmSource: "instagram", utmMedium: "stories", utmCampaign: "promo-juli", linkLabel: "IG Stories", phone: "628333xxx", converted: false, conversionValue: null, currency: null, convertedAt: null },
  { id: "4", clickedAt: "2025-07-01 12:55", utmSource: "facebook", utmMedium: "feed", utmCampaign: "remarketing", linkLabel: "FB Ads", phone: "628444xxx", converted: true, conversionValue: 480, currency: "HKD", convertedAt: "2025-07-01 13:20" },
];

export default function ConversionsPage() {
  const isReal = isSupabaseConfigured();
  const [rows, setRows]           = useState<ClickRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount]       = useState("");
  const [currency, setCurrency]   = useState<CurrencyCode>("IDR");
  const [note, setNote]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter]       = useState<"all" | "pending" | "converted">("all");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    if (!isReal) { setRows(DEMO_ROWS); setLoading(false); return; }
    try {
      const res = await fetch("/api/conversions");
      const data = await res.json();
      setRows(data.clicks ?? []);
    } catch {
      toast.error("Gagal memuat data");
    }
    setLoading(false);
  }

  async function handleMarkConverted(clickId: string) {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Masukkan nilai transaksi yang valid");
      return;
    }
    setSubmitting(true);

    if (!isReal) {
      // Demo mode
      await new Promise(r => setTimeout(r, 800));
      setRows(prev => prev.map(r => r.id === clickId
        ? { ...r, converted: true, conversionValue: Number(amount), currency, convertedAt: new Date().toISOString() }
        : r));
      toast.success(`✓ Demo: Konversi ${formatCurrency(Number(amount), currency)} ditandai`);
      setSelectedId(null); setAmount(""); setNote("");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/conversions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clickId, amount: Number(amount), currency, note: note || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRows(prev => prev.map(r => r.id === clickId
        ? { ...r, converted: true, conversionValue: Number(amount), currency, convertedAt: new Date().toISOString() }
        : r));

      if (data.capiSent) {
        toast.success(`✓ Konversi ${formatCurrency(Number(amount), currency)} disimpan & Purchase event terkirim ke Meta CAPI`);
      } else {
        toast.success(`✓ Konversi ${formatCurrency(Number(amount), currency)} disimpan (Meta pixel belum dikonfigurasi)`);
      }
      setSelectedId(null); setAmount(""); setNote("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan konversi");
    }
    setSubmitting(false);
  }

  const converted = rows.filter(r => r.converted);
  const pending   = rows.filter(r => !r.converted);
  const convRate  = rows.length > 0 ? Math.round((converted.length / rows.length) * 100) : 0;

  const revenueByCurrency = converted.reduce<Partial<Record<CurrencyCode, number>>>((acc, r) => {
    if (!r.conversionValue || !r.currency) return acc;
    acc[r.currency] = (acc[r.currency] ?? 0) + r.conversionValue;
    return acc;
  }, {});

  const filtered = rows.filter(r =>
    filter === "all" ? true : filter === "converted" ? r.converted : !r.converted
  );

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Konversi</h1>
        <button onClick={loadData} className="text-xs text-gray-400 hover:text-gray-600">↻ Refresh</button>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Tandai deal berhasil — sistem otomatis kirim Purchase event ke Meta CAPI
        {!isReal && <span className="ml-2 text-amber-600 font-medium">(Demo Mode)</span>}
      </p>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Total Lead</p>
          <p className="text-2xl font-bold">{rows.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">klik masuk</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Sudah Konversi</p>
          <p className="text-2xl font-bold text-green-600">{converted.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">{convRate}% conv. rate</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Perlu Follow-up</p>
          <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">belum ditandai</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-2">Total Revenue</p>
          {Object.entries(revenueByCurrency).length === 0
            ? <p className="text-gray-400 text-sm">—</p>
            : Object.entries(revenueByCurrency).map(([code, val]) => (
              <p key={code} className="text-sm font-semibold">
                {CURRENCIES[code as CurrencyCode].flag} {formatCurrency(val!, code as CurrencyCode)}
              </p>
            ))
          }
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(["all", "pending", "converted"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filter === f ? "bg-gray-900 text-white" : "border text-gray-500 hover:bg-gray-50"}`}>
            {{ all: `Semua (${rows.length})`, pending: `Belum Ditandai (${pending.length})`, converted: `Konversi (${converted.length})` }[f]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Memuat data...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {rows.length === 0 ? "Belum ada klik masuk — bagikan link tracking Anda" : "Tidak ada data untuk filter ini"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Waktu Klik", "Sumber", "Kampanye", "Link", "Status", "Nilai", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(row => (
                  <>
                    <tr key={row.id} className={`hover:bg-gray-50 ${selectedId === row.id ? "bg-green-50" : ""}`}>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatTime(row.clickedAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${SOURCE_COLORS[row.utmSource] ?? "bg-gray-100 text-gray-600"}`}>
                          {row.utmSource}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{row.utmCampaign ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{row.linkLabel ?? "—"}</td>
                      <td className="px-4 py-3">
                        {row.converted
                          ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">✓ Konversi</span>
                          : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">Pending</span>}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium font-mono">
                        {row.conversionValue && row.currency
                          ? `${CURRENCIES[row.currency].flag} ${formatCurrency(row.conversionValue, row.currency)}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {!row.converted && (
                          <button onClick={() => { setSelectedId(selectedId === row.id ? null : row.id); setAmount(""); setNote(""); }}
                            className="text-xs px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium whitespace-nowrap">
                            Tandai Terjual
                          </button>
                        )}
                      </td>
                    </tr>

                    {selectedId === row.id && (
                      <tr key={`${row.id}-form`}>
                        <td colSpan={7} className="px-4 py-4 bg-green-50 border-b">
                          <div className="flex items-end gap-3 flex-wrap">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                              <select value={currency} onChange={e => setCurrency(e.target.value as CurrencyCode)}
                                className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                                {(Object.keys(CURRENCIES) as CurrencyCode[]).map(c => (
                                  <option key={c} value={c}>{CURRENCIES[c].flag} {c} — {CURRENCIES[c].name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Nilai Transaksi *</label>
                              <input autoFocus type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                className="border rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder={currency === "IDR" ? "350000" : "150"} />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Catatan (opsional)</label>
                              <input type="text" value={note} onChange={e => setNote(e.target.value)}
                                className="border rounded px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Produk, order ID, dll" />
                            </div>
                            <button onClick={() => handleMarkConverted(row.id)} disabled={submitting}
                              className="px-4 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                              {submitting ? "Menyimpan..." : "Konfirmasi & Kirim ke Meta"}
                            </button>
                            <button onClick={() => setSelectedId(null)} className="text-sm text-gray-500 hover:text-gray-800">Batal</button>
                          </div>
                          <p className="text-xs text-green-700 mt-2">
                            ↑ Nilai ini dikirim sebagai event <strong>Purchase</strong> ke Meta CAPI — ROAS di Ads Manager terupdate otomatis.
                          </p>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
