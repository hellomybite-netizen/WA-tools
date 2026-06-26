"use client";
import { useState } from "react";
import { toast } from "sonner";
import { CURRENCIES, CurrencyCode, formatCurrency } from "@/lib/currencies";

interface ChatLead {
  id: string;
  phone: string;
  name: string;
  source: string;
  campaign: string;
  clickedAt: string;
  message: string;
  status: "new" | "contacted" | "negotiating" | "converted" | "lost";
  assignedTo: string;
  conversionValue?: number;
  currency?: CurrencyCode;
}

const demoLeads: ChatLead[] = [
  { id: "1", phone: "628111222333", name: "Andi S.", source: "instagram", campaign: "promo-ramadan", clickedAt: "09:14", message: "Halo kak mau tanya soal produk...", status: "new", assignedTo: "Saya" },
  { id: "2", phone: "628222333444", name: "Budi W.", source: "tiktok", campaign: "fyp-promo", clickedAt: "09:32", message: "Masih ada stok kak?", status: "contacted", assignedTo: "Saya" },
  { id: "3", phone: "628333444555", name: "Citra M.", source: "facebook", campaign: "retargeting", clickedAt: "10:05", message: "Berapa harganya ya?", status: "negotiating", assignedTo: "Saya" },
  { id: "4", phone: "628444555666", name: "Dewi P.", source: "instagram", campaign: "promo-ramadan", clickedAt: "10:41", message: "Deal kak transfer ya", status: "new", assignedTo: "Saya" },
  { id: "5", phone: "628555666777", name: "Eko R.", source: "google", campaign: "brand-search", clickedAt: "11:02", message: "Minta katalog dong kak", status: "new", assignedTo: "Saya" },
  { id: "6", phone: "628666777888", name: "Fitri A.", source: "tiktok", campaign: "fyp-promo", clickedAt: "11:30", message: "Sudah transfer ya kak", status: "converted", conversionValue: 350000, currency: "IDR", assignedTo: "Saya" },
];

const STATUS_CONFIG = {
  new:         { label: "Baru",        color: "bg-blue-100 text-blue-700",   dot: "bg-blue-500" },
  contacted:   { label: "Dihubungi",   color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  negotiating: { label: "Negosiasi",   color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  converted:   { label: "Konversi",    color: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  lost:        { label: "Tidak Jadi",  color: "bg-gray-100 text-gray-500",    dot: "bg-gray-400" },
};

const SOURCE_COLORS: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  tiktok:    "bg-gray-900 text-white",
  facebook:  "bg-blue-100 text-blue-700",
  google:    "bg-yellow-100 text-yellow-700",
};

export default function CSDashboardPage() {
  const [leads, setLeads] = useState<ChatLead[]>(demoLeads);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [convValue, setConvValue] = useState("");
  const [convCurrency, setConvCurrency] = useState<CurrencyCode>("IDR");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<ChatLead["status"] | "all">("all");

  const counts = {
    all: leads.length,
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    negotiating: leads.filter(l => l.status === "negotiating").length,
    converted: leads.filter(l => l.status === "converted").length,
    lost: leads.filter(l => l.status === "lost").length,
  };

  function updateStatus(id: string, status: ChatLead["status"]) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    toast.success(`Status diperbarui ke ${STATUS_CONFIG[status].label}`);
  }

  async function markConverted(id: string) {
    if (!convValue || isNaN(Number(convValue))) {
      toast.error("Masukkan nilai transaksi yang valid");
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setLeads(prev => prev.map(l => l.id === id ? {
      ...l,
      status: "converted",
      conversionValue: Number(convValue),
      currency: convCurrency,
    } : l));
    toast.success(`✓ Konversi ${formatCurrency(Number(convValue), convCurrency)} ditandai & dikirim ke Meta CAPI`);
    setMarkingId(null);
    setConvValue("");
    setSubmitting(false);
  }

  const filtered = filter === "all" ? leads : leads.filter(l => l.status === filter);
  const myConversions = leads.filter(l => l.status === "converted").length;
  const pending = leads.filter(l => ["new","contacted","negotiating"].includes(l.status)).length;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">Antrian Chat</h1>
          <p className="text-gray-500 text-sm">Lead yang masuk hari ini — tandai status & konversi</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-500">Live</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Masuk", value: leads.length, sub: "hari ini", color: "text-gray-900" },
          { label: "Perlu Diproses", value: pending, sub: "antrian aktif", color: "text-orange-600" },
          { label: "Konversi Saya", value: myConversions, sub: "sudah closing", color: "text-green-600" },
          { label: "Conv. Rate", value: `${leads.length > 0 ? Math.round((myConversions/leads.length)*100) : 0}%`, sub: "hari ini", color: "text-blue-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filter === "all" ? "bg-gray-900 text-white" : "border text-gray-500 hover:bg-gray-50"}`}
        >
          Semua ({counts.all})
        </button>
        {(Object.keys(STATUS_CONFIG) as ChatLead["status"][]).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filter === s ? "bg-gray-900 text-white" : "border text-gray-500 hover:bg-gray-50"}`}
          >
            {STATUS_CONFIG[s].label} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Lead cards */}
      <div className="space-y-3">
        {filtered.map(lead => (
          <div key={lead.id} className="bg-white border rounded-lg overflow-hidden">
            <div className="flex items-start gap-4 p-4">
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                lead.status === "converted" ? "bg-green-100 text-green-700" :
                lead.status === "new" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
              }`}>
                {lead.name.split(" ").map(n => n[0]).join("").slice(0,2)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-medium text-gray-900 text-sm">{lead.name}</span>
                  <span className="text-xs text-gray-400">{lead.phone}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SOURCE_COLORS[lead.source] ?? "bg-gray-100 text-gray-600"}`}>
                    {lead.source}
                  </span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">{lead.campaign}</span>
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">"{lead.message}"</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 ${STATUS_CONFIG[lead.status].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[lead.status].dot}`} />
                    {STATUS_CONFIG[lead.status].label}
                  </span>
                  <span className="text-xs text-gray-400">{lead.clickedAt}</span>
                  {lead.conversionValue && lead.currency && (
                    <span className="text-xs font-semibold text-green-600">
                      {CURRENCIES[lead.currency].flag} {formatCurrency(lead.conversionValue, lead.currency)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`https://wa.me/${lead.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                >
                  Buka WA
                </a>
                {lead.status !== "converted" && lead.status !== "lost" && (
                  <div className="relative">
                    <select
                      value={lead.status}
                      onChange={e => {
                        const newStatus = e.target.value as ChatLead["status"];
                        if (newStatus === "converted") {
                          setMarkingId(lead.id);
                        } else {
                          updateStatus(lead.id, newStatus);
                        }
                      }}
                      className="border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none pr-6 cursor-pointer"
                    >
                      <option value="new">Baru</option>
                      <option value="contacted">Dihubungi</option>
                      <option value="negotiating">Negosiasi</option>
                      <option value="converted">✓ Konversi</option>
                      <option value="lost">Tidak Jadi</option>
                    </select>
                    <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                  </div>
                )}
              </div>
            </div>

            {/* Conversion form (inline) */}
            {markingId === lead.id && (
              <div className="border-t bg-green-50 px-4 py-3">
                <p className="text-xs font-semibold text-green-800 mb-2">Konfirmasi Nilai Transaksi</p>
                <div className="flex items-end gap-3 flex-wrap">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Currency</label>
                    <select
                      value={convCurrency}
                      onChange={e => setConvCurrency(e.target.value as CurrencyCode)}
                      className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {(Object.keys(CURRENCIES) as CurrencyCode[]).map(c => (
                        <option key={c} value={c}>{CURRENCIES[c].flag} {c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Nilai Transaksi</label>
                    <input
                      autoFocus
                      type="number"
                      value={convValue}
                      onChange={e => setConvValue(e.target.value)}
                      className="border rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={convCurrency === "IDR" ? "350000" : "150"}
                    />
                  </div>
                  <button
                    onClick={() => markConverted(lead.id)}
                    disabled={submitting}
                    className="px-4 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "Mengirim..." : "Tandai & Kirim ke Meta"}
                  </button>
                  <button
                    onClick={() => setMarkingId(null)}
                    className="px-3 py-1.5 text-gray-500 hover:text-gray-800 text-sm"
                  >
                    Batal
                  </button>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Nilai ini akan dikirim sebagai event <strong>Purchase</strong> ke Meta CAPI — ROAS di Ads Manager terupdate otomatis.
                </p>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-sm">Belum ada lead di kategori ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
