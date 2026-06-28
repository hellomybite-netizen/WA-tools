"use client";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { buildWhatsAppUrl } from "@/lib/utm";
import { TIER_FEATURES } from "@/lib/tiers";
import { useTier } from "@/lib/use-tier";

// Demo: pretend 3 links already saved
const DEMO_USED_LINKS = 3;

const MESSAGE_TEMPLATES = [
  "Halo, saya ingin tanya-tanya produk Anda",
  "Halo, saya lihat iklan di TikTok. Boleh info lebih?",
  "Halo, saya dari Instagram. Mau tanya produk lebih lanjut",
  "Halo, saya mau tanya promo yang sedang berjalan",
];

const MAX_MESSAGE_CHARS = 300;

export default function UrlGeneratorPage() {
  const tier = useTier();
  const features = TIER_FEATURES[tier];
  const maxLinks = features.maxLinks;
  const isUnlimited = maxLinks === "unlimited";
  const nearLimit = !isUnlimited && DEMO_USED_LINKS >= (maxLinks as number) * 0.8;

  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrSize, setQrSize] = useState<"small" | "medium" | "large">("medium");

  const QR_SIZES = { small: 200, medium: 300, large: 500 };
  const QR_SIZE_LABELS = { small: "Kecil (stiker)", medium: "Medium (brosur)", large: "Besar (banner)" };

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) return;

    const waUrl = buildWhatsAppUrl(phone, message);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

    const params = new URLSearchParams({ target: waUrl });
    if (utmSource) params.set("utm_source", utmSource);
    if (utmMedium) params.set("utm_medium", utmMedium);
    if (utmCampaign) params.set("utm_campaign", utmCampaign);

    const slug = Math.random().toString(36).slice(2, 8);
    setGeneratedUrl(waUrl);
    setTrackingUrl(`${appUrl}/r/${slug}?${params.toString()}`);
    setQrDataUrl(null);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Link disalin ke clipboard!");
  }

  function applyTemplate(tpl: string) {
    setMessage(tpl);
    setShowTemplates(false);
  }

  async function generateQR() {
    if (!trackingUrl) return;
    setQrLoading(true);
    try {
      const QRCode = (await import("qrcode")).default;
      const size = QR_SIZES[qrSize];
      const dataUrl = await QRCode.toDataURL(trackingUrl, {
        width: size,
        margin: 2,
        color: { dark: "#111827", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(dataUrl);
    } catch {
      toast.error("Gagal membuat QR code");
    }
    setQrLoading(false);
  }

  function downloadQR(format: "png" | "svg") {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `wa-tools-qr-${qrSize}.${format}`;
    a.click();
    toast.success(`QR Code (${QR_SIZE_LABELS[qrSize]}) diunduh!`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">URL Generator</h1>
      <p className="text-gray-500 text-sm mb-4">Buat WhatsApp link dengan UTM tracking & pesan sambutan otomatis</p>

      {/* Tier limit banner */}
      <div className={`mb-6 flex items-center justify-between px-4 py-3 rounded-lg text-sm border ${
        nearLimit ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-gray-50 border-gray-200 text-gray-600"
      }`}>
        <span>
          Link tersimpan: <strong>{DEMO_USED_LINKS} / {isUnlimited ? "∞" : maxLinks}</strong>
          {isUnlimited && <span className="ml-2 text-green-600 font-medium">Tidak terbatas</span>}
        </span>
        {!isUnlimited && (
          <span className={nearLimit ? "text-amber-700 font-medium" : "text-gray-400"}>
            {nearLimit ? "⚠ Hampir mencapai batas — " : ""}
            Batas tier {tier.charAt(0).toUpperCase() + tier.slice(1)}: {maxLinks} link
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Buat Link</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nomor WhatsApp <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="628123456789"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Format: kode negara + nomor (tanpa +)</p>
            </div>

            {/* Pesan Sambutan */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Pesan Sambutan (opsional)</label>
                <button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-xs text-green-600 hover:underline font-medium"
                >
                  📋 Pilih Template
                </button>
              </div>

              {showTemplates && (
                <div className="mb-2 border rounded bg-gray-50 divide-y">
                  {MESSAGE_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-green-800 transition-colors"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              )}

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_CHARS))}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={3}
                placeholder="Halo, saya tertarik dengan produk Anda..."
              />
              <div className="flex items-center justify-between mt-1">
                {message && (
                  <p className="text-xs text-gray-400 italic truncate max-w-xs">
                    Preview: "Halo kak, {message.slice(0, 40)}{message.length > 40 ? "..." : ""}"
                  </p>
                )}
                <span className={`text-xs ml-auto flex-shrink-0 ${message.length >= MAX_MESSAGE_CHARS ? "text-red-500 font-medium" : "text-gray-400"}`}>
                  {message.length}/{MAX_MESSAGE_CHARS}
                  {message.length >= MAX_MESSAGE_CHARS && " ⚠ batas aman"}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3 text-gray-600">UTM Tracking (opsional)</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500">UTM Source</label>
                  <input
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="instagram"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500">UTM Medium</label>
                  <input
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="stories"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500">UTM Campaign</label>
                  <input
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="promo-juli"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Generate Link
            </button>
          </form>
        </div>

        {/* Hasil */}
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Hasil</h2>
            {generatedUrl ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Link WhatsApp Langsung</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={generatedUrl}
                      className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50 text-gray-600"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedUrl)}
                      className="px-3 py-2 border rounded text-sm hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      Salin
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Link Tracking (dengan analytics)</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={trackingUrl}
                      className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50 text-gray-600"
                    />
                    <button
                      onClick={() => copyToClipboard(trackingUrl)}
                      className="px-3 py-2 border rounded text-sm hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      Salin
                    </button>
                  </div>
                </div>
                {message && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-800">
                    💬 Pesan sambutan: <em>"{message}"</em>
                  </div>
                )}
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2 bg-green-50 text-green-700 border border-green-200 rounded text-sm font-medium hover:bg-green-100 transition-colors"
                >
                  Test Link →
                </a>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm py-16">
                Isi form di kiri lalu klik Generate
              </div>
            )}
          </div>

          {/* QR Code */}
          {generatedUrl && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="font-semibold mb-3">QR Code</h2>
              <p className="text-xs text-gray-500 mb-3">QR melewati link tracking — scan tetap tercatat di analytics</p>

              <div className="flex items-center gap-2 mb-3">
                {(["small", "medium", "large"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => { setQrSize(s); setQrDataUrl(null); }}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                      qrSize === s ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {QR_SIZE_LABELS[s]}
                  </button>
                ))}
              </div>

              {qrDataUrl ? (
                <div className="text-center">
                  <img src={qrDataUrl} alt="QR Code" className="mx-auto mb-3 border rounded" style={{ width: 160 }} />
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => downloadQR("png")}
                      className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors"
                    >
                      ⬇ Unduh PNG
                    </button>
                    <button
                      onClick={() => { setQrDataUrl(null); }}
                      className="px-4 py-2 border text-xs font-medium rounded hover:bg-gray-50 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={generateQR}
                  disabled={qrLoading}
                  className="w-full py-2 border border-dashed border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {qrLoading ? "Membuat QR..." : "🔲 Buat QR Code"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
