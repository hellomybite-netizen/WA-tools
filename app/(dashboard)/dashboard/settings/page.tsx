"use client";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";

export default function SettingsPage() {
  const [metaPixelId, setMetaPixelId] = useState("");
  const [metaAccessToken, setMetaAccessToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const supabase = createClient();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Tidak terautentikasi"); setSaving(false); return; }

    const { error } = await supabase
      .from("pixel_settings")
      .upsert({ user_id: user.id, meta_pixel_id: metaPixelId, meta_access_token: metaAccessToken })
      .eq("user_id", user.id);

    if (error) toast.error("Gagal menyimpan: " + error.message);
    else toast.success("Pengaturan pixel disimpan!");
    setSaving(false);
  }

  async function handleTest() {
    if (!metaPixelId || !metaAccessToken) {
      toast.error("Isi Pixel ID dan Access Token dulu");
      return;
    }
    setTesting(true);
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${metaPixelId}?access_token=${metaAccessToken}&fields=id,name`
    );
    const json = await res.json();
    if (json.error) toast.error("Token tidak valid: " + json.error.message);
    else toast.success(`Pixel terverifikasi: ${json.name} (${json.id})`);
    setTesting(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Pengaturan Pixel</h1>
      <p className="text-gray-500 text-sm mb-8">Hubungkan Meta Pixel untuk pelacakan konversi otomatis</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-1">Meta Conversion API</h2>
            <p className="text-sm text-gray-500 mb-5">
              Event <strong>Lead</strong> dikirim otomatis saat ada klik. Event <strong>Purchase</strong> dikirim saat CS menandai konversi.
            </p>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meta Pixel ID</label>
                <input
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="123456789012345"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Dari Meta Events Manager → Data Sources → Pixel Anda
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CAPI Access Token</label>
                <input
                  type="password"
                  value={metaAccessToken}
                  onChange={(e) => setMetaAccessToken(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="EAAxxxxxx..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Dari Pixel → Settings → Conversions API → Generate Access Token
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing}
                  className="px-4 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {testing ? "Mengecek..." : "Test Koneksi"}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Keamanan Token</p>
            <p className="text-xs text-amber-700">
              Access Token disimpan terenkripsi dan tidak pernah ditampilkan di frontend. Jangan share token ini ke siapapun.
            </p>
          </div>
        </div>

        {/* Cara kerja */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Alur Pelacakan Konversi</h2>
          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "User Klik Link Iklan",
                desc: "User klik link dari Instagram/TikTok/Google Ads yang mengandung UTM dan fbclid.",
                color: "bg-blue-50 border-blue-200",
                badge: "Otomatis",
                badgeColor: "bg-blue-100 text-blue-700",
              },
              {
                step: "02",
                title: "Event Lead Dikirim",
                desc: "WA Tools langsung kirim event Lead + data fbclid ke Meta CAPI secara server-side sebelum redirect ke WA.",
                color: "bg-green-50 border-green-200",
                badge: "Otomatis",
                badgeColor: "bg-green-100 text-green-700",
              },
              {
                step: "03",
                title: "CS Layani Chat",
                desc: "CS menerima chat di WhatsApp dan melayani calon pembeli seperti biasa.",
                color: "bg-gray-50 border-gray-200",
                badge: "Manual CS",
                badgeColor: "bg-gray-100 text-gray-600",
              },
              {
                step: "04",
                title: "CS Tandai Konversi",
                desc: "Deal berhasil? CS buka halaman Konversi di dashboard, pilih chat, input nilai transaksi → klik Tandai Terjual.",
                color: "bg-yellow-50 border-yellow-200",
                badge: "Manual CS",
                badgeColor: "bg-yellow-100 text-yellow-700",
              },
              {
                step: "05",
                title: "Event Purchase Dikirim",
                desc: "Sistem otomatis kirim event Purchase + nilai Rp ke Meta CAPI. ROAS dan konversi langsung update di Meta Ads Manager.",
                color: "bg-green-50 border-green-200",
                badge: "Otomatis",
                badgeColor: "bg-green-100 text-green-700",
              },
            ].map((s) => (
              <div key={s.step} className={`flex gap-3 p-3 rounded border ${s.color}`}>
                <span className="text-xs font-bold text-gray-400 w-5 flex-shrink-0 pt-0.5">{s.step}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${s.badgeColor}`}>{s.badge}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
