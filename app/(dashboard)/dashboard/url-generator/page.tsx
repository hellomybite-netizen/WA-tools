"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { buildWhatsAppUrl } from "@/lib/utm";
import { TIER_FEATURES } from "@/lib/tiers";
import { useTier } from "@/lib/use-tier";
import { isSupabaseConfigured } from "@/lib/supabase";

const MESSAGE_TEMPLATES = [
  "Halo, saya ingin tanya-tanya produk Anda",
  "Halo, saya lihat iklan di TikTok. Boleh info lebih?",
  "Halo, saya dari Instagram. Mau tanya produk lebih lanjut",
  "Halo, saya mau tanya promo yang sedang berjalan",
];

const MAX_MESSAGE_CHARS = 300;
const QR_SIZES = { small: 200, medium: 300, large: 500 };
const QR_SIZE_LABELS = { small: "Kecil (stiker)", medium: "Medium (brosur)", large: "Besar (banner)" };

interface SavedLink {
  id: string;
  slug: string;
  label: string | null;
  destination_phone: string;
  message: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  active: boolean;
  created_at: string;
}

export default function UrlGeneratorPage() {
  const tier = useTier();
  const features = TIER_FEATURES[tier];
  const maxLinks = features.maxLinks;
  const isUnlimited = maxLinks === "unlimited";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const isReal = isSupabaseConfigured();

  const [links, setLinks]             = useState<SavedLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [saving, setSaving]           = useState(false);

  // Form state
  const [label, setLabel]             = useState("");
  const [phone, setPhone]             = useState("");
  const [message, setMessage]         = useState("");
  const [utmSource, setUtmSource]     = useState("");
  const [utmMedium, setUtmMedium]     = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  // Result state
  const [savedLink, setSavedLink]     = useState<SavedLink | null>(null);
  const [qrDataUrl, setQrDataUrl]     = useState<string | null>(null);
  const [qrLoading, setQrLoading]     = useState(false);
  const [qrSize, setQrSize]           = useState<"small" | "medium" | "large">("medium");

  useEffect(() => { if (isReal) fetchLinks(); }, [isReal]);

  async function fetchLinks() {
    setLoadingLinks(true);
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(data.links ?? []);
    } catch { /* ignore */ }
    setLoadingLinks(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) return;

    if (!isReal) {
      // Demo mode — just show preview
      const slug = Math.random().toString(36).slice(2, 8);
      setSavedLink({ id: "demo", slug, label, destination_phone: phone, message, utm_source: utmSource, utm_medium: utmMedium, utm_campaign: utmCampaign, active: true, created_at: new Date().toISOString() });
      setQrDataUrl(null);
      return;
    }

    // Check limit
    if (!isUnlimited && links.length >= (maxLinks as number)) {
      toast.error(`Batas ${maxLinks} link tercapai. Upgrade untuk lebih banyak link.`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label || null, destination_phone: phone, message: message || null, utm_source: utmSource || null, utm_medium: utmMedium || null, utm_campaign: utmCampaign || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSavedLink(data.link);
      setQrDataUrl(null);
      setLinks(prev => [data.link, ...prev]);
      toast.success("Link berhasil disimpan!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan link");
    }
    setSaving(false);
  }

  async function deleteLink(id: string) {
    if (!confirm("Hapus link ini?")) return;
    await fetch(`/api/links?id=${id}`, { method: "DELETE" });
    setLinks(prev => prev.filter(l => l.id !== id));
    if (savedLink?.id === id) setSavedLink(null);
    toast.success("Link dihapus");
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Link disalin!");
  }

  function trackingUrl(slug: string) {
    return `${appUrl}/r/${slug}`;
  }

  async function generateQR(slug: string) {
    setQrLoading(true);
    try {
      const QRCode = (await import("qrcode")).default;
      const size = QR_SIZES[qrSize];
      const url = trackingUrl(slug);
      const dataUrl = await QRCode.toDataURL(url, {
        width: size, margin: 2,
        color: { dark: "#111827", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(dataUrl);
    } catch {
      toast.error("Gagal membuat QR code");
    }
    setQrLoading(false);
  }

  function downloadQR() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `wa-qr-${qrSize}.png`;
    a.click();
  }

  const nearLimit = !isUnlimited && links.length >= (maxLinks as number) * 0.8;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">URL Generator</h1>
      <p className="text-gray-500 text-sm mb-4">Buat WhatsApp link dengan UTM tracking & pesan sambutan otomatis</p>

      {/* Limit banner */}
      <div className={`mb-6 flex items-center justify-between px-4 py-3 rounded-lg text-sm border ${nearLimit ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
        <span>Link tersimpan: <strong>{isReal ? links.length : "—"} / {isUnlimited ? "∞" : maxLinks}</strong></span>
        {nearLimit && <span className="text-amber-700 font-medium">⚠ Hampir mencapai batas</span>}
        {isUnlimited && <span className="text-green-600 font-medium text-xs">Tidak terbatas</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Buat Link Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Label (opsional)</label>
              <input value={label} onChange={e => setLabel(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Mis: TikTok Ads Juli" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nomor WhatsApp <span className="text-red-500">*</span></label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="628123456789" required />
              <p className="text-xs text-gray-400 mt-1">Format: kode negara + nomor (tanpa +)</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Pesan Sambutan</label>
                <button type="button" onClick={() => setShowTemplates(!showTemplates)}
                  className="text-xs text-green-600 hover:underline font-medium">📋 Template</button>
              </div>
              {showTemplates && (
                <div className="mb-2 border rounded bg-gray-50 divide-y">
                  {MESSAGE_TEMPLATES.map(tpl => (
                    <button key={tpl} type="button" onClick={() => { setMessage(tpl); setShowTemplates(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-green-800 transition-colors">
                      {tpl}
                    </button>
                  ))}
                </div>
              )}
              <textarea value={message} onChange={e => setMessage(e.target.value.slice(0, MAX_MESSAGE_CHARS))}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={3} placeholder="Halo, saya tertarik dengan produk Anda..." />
              <span className={`text-xs ${message.length >= MAX_MESSAGE_CHARS ? "text-red-500" : "text-gray-400"}`}>
                {message.length}/{MAX_MESSAGE_CHARS}
              </span>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3 text-gray-600">UTM Tracking</p>
              <div className="grid grid-cols-3 gap-3">
                {[["UTM Source", utmSource, setUtmSource, "instagram"],
                  ["UTM Medium", utmMedium, setUtmMedium, "stories"],
                  ["UTM Campaign", utmCampaign, setUtmCampaign, "promo-juli"]].map(([lbl, val, setter, ph]) => (
                  <div key={lbl as string}>
                    <label className="block text-xs font-medium mb-1 text-gray-500">{lbl as string}</label>
                    <input value={val as string} onChange={e => (setter as (v: string) => void)(e.target.value)}
                      className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={ph as string} />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
              {saving ? "Menyimpan..." : "Simpan & Generate Link"}
            </button>
          </form>
        </div>

        {/* Result */}
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Hasil</h2>
            {savedLink ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Link Tracking</label>
                  <div className="flex gap-2">
                    <input readOnly value={trackingUrl(savedLink.slug)}
                      className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50 text-gray-700" />
                    <button onClick={() => copyToClipboard(trackingUrl(savedLink.slug))}
                      className="px-3 py-2 border rounded text-sm hover:bg-gray-50">Salin</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Link WA Langsung</label>
                  <div className="flex gap-2">
                    <input readOnly value={buildWhatsAppUrl(savedLink.destination_phone, savedLink.message ?? "")}
                      className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50 text-gray-600 font-mono text-xs" />
                    <button onClick={() => copyToClipboard(buildWhatsAppUrl(savedLink.destination_phone, savedLink.message ?? ""))}
                      className="px-3 py-2 border rounded text-sm hover:bg-gray-50">Salin</button>
                  </div>
                </div>
                {savedLink.message && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-800">
                    💬 Pesan sambutan: <em>"{savedLink.message}"</em>
                  </div>
                )}
                <a href={buildWhatsAppUrl(savedLink.destination_phone, savedLink.message ?? "")} target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center py-2 bg-green-50 text-green-700 border border-green-200 rounded text-sm font-medium hover:bg-green-100 transition-colors">
                  Test Link →
                </a>

                {/* QR Code */}
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-2">QR Code</p>
                  <div className="flex gap-2 mb-3">
                    {(["small", "medium", "large"] as const).map(s => (
                      <button key={s} onClick={() => { setQrSize(s); setQrDataUrl(null); }}
                        className={`px-2.5 py-1 text-xs rounded border transition-colors ${qrSize === s ? "bg-gray-900 text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                        {QR_SIZE_LABELS[s]}
                      </button>
                    ))}
                  </div>
                  {qrDataUrl ? (
                    <div className="text-center">
                      <img src={qrDataUrl} alt="QR" className="mx-auto mb-3 border rounded" style={{ width: 140 }} />
                      <div className="flex gap-2 justify-center">
                        <button onClick={downloadQR} className="px-4 py-2 bg-gray-900 text-white text-xs rounded hover:bg-gray-700">⬇ Unduh PNG</button>
                        <button onClick={() => setQrDataUrl(null)} className="px-4 py-2 border text-xs rounded hover:bg-gray-50">Reset</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => generateQR(savedLink.slug)} disabled={qrLoading}
                      className="w-full py-2 border border-dashed border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                      {qrLoading ? "Membuat QR..." : "🔲 Buat QR Code"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center text-gray-400 text-sm py-16">
                Isi form lalu klik Simpan & Generate Link
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved links list */}
      <div className="mt-8 bg-white border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm">Link Tersimpan ({links.length})</h2>
          <button onClick={fetchLinks} className="text-xs text-gray-400 hover:text-gray-600">↻ Refresh</button>
        </div>
        {loadingLinks ? (
          <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
        ) : links.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Belum ada link tersimpan</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Label", "Nomor WA", "UTM Campaign", "Link Tracking", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {links.map(link => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{link.label ?? <span className="text-gray-400 italic">—</span>}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{link.destination_phone}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{link.utm_campaign ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-600">{appUrl}/r/{link.slug}</span>
                        <button onClick={() => copyToClipboard(`${appUrl}/r/${link.slug}`)}
                          className="text-xs text-green-600 hover:underline flex-shrink-0">Salin</button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteLink(link.id)}
                        className="text-xs text-red-500 hover:text-red-700">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
