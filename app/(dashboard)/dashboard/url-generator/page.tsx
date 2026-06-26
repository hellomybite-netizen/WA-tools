"use client";
import { useState } from "react";
import { toast } from "sonner";
import { buildWhatsAppUrl } from "@/lib/utm";

export default function UrlGeneratorPage() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

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
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Link disalin ke clipboard!");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">URL Generator</h1>
      <p className="text-gray-500 text-sm mb-8">Buat WhatsApp link dengan UTM tracking</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <div>
              <label className="block text-sm font-medium mb-1">Pesan Pembuka</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={3}
                placeholder="Halo, saya tertarik dengan produk Anda..."
              />
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
      </div>
    </div>
  );
}
