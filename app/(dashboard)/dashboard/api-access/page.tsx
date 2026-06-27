"use client";
import { useState } from "react";
import { toast } from "sonner";

const DEMO_TOKEN = "wat_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";

const ENDPOINTS = [
  { method: "GET",    path: "/api/v1/links",        desc: "List semua WhatsApp link" },
  { method: "POST",   path: "/api/v1/links",        desc: "Buat link baru" },
  { method: "GET",    path: "/api/v1/analytics",    desc: "Data analytics per channel" },
  { method: "GET",    path: "/api/v1/crm/contacts", desc: "List kontak CRM" },
  { method: "POST",   path: "/api/v1/conversions",  desc: "Catat konversi manual" },
];

const METHOD_COLORS: Record<string, string> = {
  GET:    "bg-blue-100 text-blue-700",
  POST:   "bg-green-100 text-green-700",
  PUT:    "bg-yellow-100 text-yellow-700",
  DELETE: "bg-red-100 text-red-700",
};

export default function ApiAccessPage() {
  const [showToken, setShowToken] = useState(false);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">API Access</h1>
      <p className="text-gray-500 text-sm mb-8">Integrasi WA Tools dengan sistem Anda via REST API</p>

      <div className="space-y-6">
        {/* API Key */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4">API Key</h2>
          <div className="flex gap-2">
            <input
              readOnly
              value={showToken ? DEMO_TOKEN : DEMO_TOKEN.replace(/./g, "•")}
              className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50 font-mono text-gray-600"
            />
            <button
              onClick={() => setShowToken(s => !s)}
              className="px-3 py-2 border rounded text-sm hover:bg-gray-50 transition-colors"
            >
              {showToken ? "Sembunyikan" : "Tampilkan"}
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(DEMO_TOKEN); toast.success("API key disalin!"); }}
              className="px-3 py-2 border rounded text-sm hover:bg-gray-50 transition-colors"
            >
              Salin
            </button>
          </div>
          <p className="text-xs text-amber-600 mt-2">⚠ Jangan bagikan API key ini kepada siapapun</p>
        </div>

        {/* Endpoints */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Endpoint Tersedia</h2>
          <div className="space-y-2">
            {ENDPOINTS.map(ep => (
              <div key={ep.path} className="flex items-center gap-3 py-2 border-b last:border-0">
                <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono w-14 text-center flex-shrink-0 ${METHOD_COLORS[ep.method]}`}>
                  {ep.method}
                </span>
                <code className="text-sm font-mono text-gray-700 flex-1">{ep.path}</code>
                <span className="text-sm text-gray-400">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Base URL */}
        <div className="bg-gray-50 border rounded-lg p-4 text-sm">
          <p className="text-gray-500 mb-1">Base URL</p>
          <code className="font-mono text-gray-800">https://api.watools.id/v1</code>
        </div>
      </div>
    </div>
  );
}
