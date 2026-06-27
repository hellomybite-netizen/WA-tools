"use client";
import { useState } from "react";
import { toast } from "sonner";

export default function WhiteLabelPage() {
  const [brandName, setBrandName] = useState("WA Tools");
  const [domain, setDomain] = useState("app.yourdomain.com");
  const [primaryColor, setPrimaryColor] = useState("#16a34a");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">White Label</h1>
      <p className="text-gray-500 text-sm mb-8">Tampilkan brand sendiri — logo, domain, dan warna kustom</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6 space-y-5">
          <h2 className="font-semibold">Konfigurasi Brand</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Nama Brand</label>
            <input
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Custom Domain</label>
            <input
              value={domain}
              onChange={e => setDomain(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="app.yourdomain.com"
            />
            <p className="text-xs text-gray-400 mt-1">Tambahkan CNAME record ke DNS domain Anda</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Warna Utama</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <span className="text-sm text-gray-600 font-mono">{primaryColor}</span>
            </div>
          </div>

          <button
            onClick={() => toast.success("Pengaturan white-label disimpan (demo)")}
            className="w-full bg-gray-900 text-white py-2 rounded text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Simpan Pengaturan
          </button>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Preview</h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: primaryColor }}>
              <span className="text-white font-bold text-sm">{brandName}</span>
            </div>
            <div className="p-4 bg-gray-50 text-sm text-gray-500 text-center py-8">
              Dashboard preview dengan brand <strong>{brandName}</strong><br/>
              <span className="text-xs">di domain: {domain}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
