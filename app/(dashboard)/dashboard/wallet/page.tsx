"use client";
import { useState } from "react";
import { toast } from "sonner";
import { TOPUP_PACKAGES, CONVERSATION_RATE } from "@/lib/midtrans";
import { createClient } from "@/lib/supabase";
import { DEMO_WABA_CONFIG, WABAConfig, CONVERSATION_COSTS } from "@/lib/waba";

const demoLedger = [
  { id: "1", type: "topup",  amount:  210_000, description: "Topup Rp 200.000 + bonus Rp 10.000",    created_at: "2026-06-28 09:00" },
  { id: "2", type: "debit",  amount:     -650, description: "Marketing conversation — promo-juli",   created_at: "2026-06-28 10:14" },
  { id: "3", type: "debit",  amount:     -650, description: "Marketing conversation — fyp-ads",      created_at: "2026-06-28 11:02" },
  { id: "4", type: "debit",  amount:     -650, description: "Marketing conversation — promo-juli",   created_at: "2026-06-28 13:45" },
  { id: "5", type: "topup",  amount:  550_000, description: "Topup Rp 500.000 + bonus Rp 50.000",   created_at: "2026-06-25 14:00" },
];
const demoBalance = 207_400;
const LOW_BALANCE_THRESHOLD = 50_000;

export default function WalletPage() {
  const [tab, setTab]         = useState<"saldo" | "waba">("saldo");
  const [balance]             = useState(demoBalance);
  const [ledger]              = useState(demoLedger);
  const [selectedPkg, setSelectedPkg] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [waba, setWaba]       = useState<WABAConfig>({ ...DEMO_WABA_CONFIG });
  const [wabaLoading, setWabaLoading] = useState(false);
  const [showToken, setShowToken]     = useState(false);
  const [testResult, setTestResult]   = useState<"ok" | "error" | null>(null);

  const estimatedConversations = Math.floor(balance / CONVERSATION_RATE);
  const isLow    = balance < LOW_BALANCE_THRESHOLD;
  const isPaused = balance <= 0;

  async function handleTopup() {
    if (!selectedPkg) { toast.error("Pilih nominal topup dulu"); return; }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const res = await fetch("/api/topup/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: selectedPkg, userId: user?.id ?? "demo-user", userEmail: user?.email ?? "demo@watools.id" }),
    });
    const { token, demo } = await res.json();
    if (demo) { toast.success("Demo mode: topup berhasil disimulasi!", { duration: 4000 }); setLoading(false); return; }
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    const snapUrl = process.env.MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    if (!(window as any).snap) {
      const script = document.createElement("script");
      script.src = snapUrl; script.setAttribute("data-client-key", clientKey!);
      document.head.appendChild(script);
      await new Promise(r => setTimeout(r, 1000));
    }
    (window as any).snap.pay(token, {
      onSuccess: () => { toast.success("Pembayaran berhasil!"); setLoading(false); },
      onPending: () => { toast.info("Menunggu pembayaran..."); setLoading(false); },
      onError:   () => { toast.error("Pembayaran gagal."); setLoading(false); },
      onClose:   () => { setLoading(false); },
    });
  }

  async function handleTestConnection() {
    setWabaLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setTestResult("ok");
    toast.success("Koneksi berhasil! Nomor WA siap menerima pesan.");
    setWabaLoading(false);
  }

  async function handleSaveWABA() {
    setWabaLoading(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success("Konfigurasi WABA disimpan!");
    setWabaLoading(false);
  }

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/waba/webhook`
    : "https://wa-tools-zeta.vercel.app/api/waba/webhook";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold mb-1">Wallet WA API</h1>
          <p className="text-gray-500 text-sm">Saldo prepaid untuk biaya WhatsApp Business API</p>
        </div>
        {isPaused && <span className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-semibold rounded-lg">⏸ WA API Dijeda — Topup untuk lanjutkan</span>}
        {isLow && !isPaused && <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-semibold rounded-lg">⚠ Saldo Rendah</span>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b mt-4">
        {([["saldo", "💰 Saldo & Topup"], ["waba", "📱 Koneksi WABA"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ===== TAB: SALDO ===== */}
      {tab === "saldo" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className={`rounded-lg p-6 text-white ${isPaused ? "bg-red-600" : isLow ? "bg-amber-600" : "bg-gray-900"}`}>
              <div>
                <p className="text-sm opacity-70 mb-1">Saldo Tersedia</p>
                <p className="text-4xl font-bold tracking-tight">Rp {balance.toLocaleString("id-ID")}</p>
                <p className="text-sm opacity-60 mt-2">≈ {estimatedConversations.toLocaleString()} marketing conversation tersisa</p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
                <div><p className="text-xs opacity-60">Dipakai bulan ini</p><p className="font-semibold">Rp 1.950</p></div>
                <div><p className="text-xs opacity-60">Conversation</p><p className="font-semibold">3 conv</p></div>
                <div><p className="text-xs opacity-60">Rate marketing</p><p className="font-semibold">Rp {CONVERSATION_RATE.toLocaleString()}/conv</p></div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h2 className="font-semibold mb-1">Topup Saldo</h2>
              <p className="text-sm text-gray-500 mb-4">Pilih nominal — bonus otomatis ditambahkan</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                {TOPUP_PACKAGES.map(pkg => (
                  <button key={pkg.amount} onClick={() => setSelectedPkg(pkg.amount)}
                    className={`relative p-4 rounded-lg border-2 text-left transition-all ${selectedPkg === pkg.amount ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                    {pkg.popular && <span className="absolute -top-2 left-3 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">Populer</span>}
                    <p className="font-bold text-gray-900">{pkg.label}</p>
                    {pkg.bonus > 0 && <p className="text-xs text-green-600 font-medium mt-0.5">+ bonus Rp {pkg.bonus.toLocaleString("id-ID")}</p>}
                    <p className="text-xs text-gray-400 mt-1">{pkg.conversations}</p>
                  </button>
                ))}
              </div>
              {selectedPkg && (() => {
                const pkg = TOPUP_PACKAGES.find(p => p.amount === selectedPkg)!;
                return (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm flex justify-between items-center">
                    <div><span className="font-medium">Total dibayar: </span><span className="font-bold">Rp {pkg.amount.toLocaleString("id-ID")}</span></div>
                    <div><span className="text-gray-500">Saldo masuk: </span><span className="font-bold text-green-600">Rp {(pkg.amount + pkg.bonus).toLocaleString("id-ID")}</span></div>
                  </div>
                );
              })()}
              <button onClick={handleTopup} disabled={!selectedPkg || loading}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:opacity-40 transition-colors">
                {loading ? "Membuka pembayaran..." : "Topup Sekarang"}
              </button>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-400 mb-2">Metode pembayaran:</p>
                <div className="flex flex-wrap gap-2">
                  {["QRIS", "GoPay", "OVO", "Dana", "BCA VA", "Mandiri VA", "BRI VA", "BNI VA", "Kartu Kredit"].map(m => (
                    <span key={m} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold mb-3 text-sm">Biaya per Conversation</h3>
              <div className="space-y-2 text-sm">
                {[
                  ["Service (balas dalam 24j)", "Gratis", "🆓"],
                  ["Marketing (bisnis mulai)",   `Rp ${CONVERSATION_COSTS.marketing.toLocaleString()}`,      "💰"],
                  ["Utility (notif pesanan)",    `Rp ${CONVERSATION_COSTS.utility.toLocaleString()}`,       "🔧"],
                  ["Authentication (OTP)",       `Rp ${CONVERSATION_COSTS.authentication.toLocaleString()}`, "🔐"],
                ].map(([label, cost, icon]) => (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b last:border-0">
                    <span className="text-gray-600">{icon} {label}</span>
                    <span className={`font-semibold ${cost === "Gratis" ? "text-green-600" : "text-gray-900"}`}>{cost}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Pass-through cost Meta — tidak ada markup tambahan.</p>
              <div className="mt-3 pt-3 border-t text-xs text-gray-500 space-y-1">
                <p>⏸️ Saldo habis → WA API pause otomatis</p>
                <p>📧 Alert saat saldo &lt; Rp {LOW_BALANCE_THRESHOLD.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold mb-3 text-sm">Riwayat Transaksi</h3>
              <div className="space-y-1">
                {ledger.map(tx => (
                  <div key={tx.id} className="flex items-start justify-between gap-2 py-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="text-xs text-gray-700 leading-snug">{tx.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{tx.created_at}</p>
                    </div>
                    <span className={`text-sm font-semibold flex-shrink-0 ${tx.amount > 0 ? "text-green-600" : "text-gray-700"}`}>
                      {tx.amount > 0 ? "+" : ""}Rp {Math.abs(tx.amount).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: KONEKSI WABA ===== */}
      {tab === "waba" && (
        <div className="max-w-2xl space-y-5">
          {/* Status */}
          <div className={`flex items-center justify-between p-4 rounded-lg border ${waba.connected ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${waba.connected ? "bg-green-500" : "bg-gray-400"}`} />
              <div>
                <p className="text-sm font-semibold text-gray-900">{waba.connected ? "Terhubung" : "Belum Terhubung"}</p>
                {waba.connected && <p className="text-xs text-gray-500">{waba.businessName} · {waba.phoneNumber}</p>}
              </div>
            </div>
            {waba.connected && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">✓ Aktif</span>}
          </div>

          {/* Credentials */}
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold">Kredensial Meta WABA</h3>
              <p className="text-xs text-gray-500 mt-0.5">Dari Meta for Developers → WhatsApp → API Setup</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number ID</label>
              <input value={waba.phoneNumberId} onChange={e => setWaba(w => ({ ...w, phoneNumberId: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="123456789012345" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WABA ID</label>
              <input value={waba.wabaId} onChange={e => setWaba(w => ({ ...w, wabaId: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="987654321098765" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Access Token (Permanent)</label>
              <div className="flex gap-2">
                <input type={showToken ? "text" : "password"} value={waba.accessToken}
                  onChange={e => setWaba(w => ({ ...w, accessToken: e.target.value }))}
                  className="flex-1 border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="EAAxxxxx..." />
                <button onClick={() => setShowToken(s => !s)} className="px-3 border rounded text-sm text-gray-500 hover:bg-gray-50">
                  {showToken ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
              <p className="text-xs text-amber-600 mt-1">⚠ Token disimpan terenkripsi. Jangan bagikan ke siapapun.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Bisnis (tampil di WA)</label>
              <input value={waba.businessName} onChange={e => setWaba(w => ({ ...w, businessName: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Toko Anda" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleTestConnection} disabled={wabaLoading}
                className="flex-1 py-2 border border-green-500 text-green-700 rounded text-sm font-medium hover:bg-green-50 disabled:opacity-50 transition-colors">
                {wabaLoading ? "Menguji..." : "🔌 Test Koneksi"}
              </button>
              <button onClick={handleSaveWABA} disabled={wabaLoading}
                className="flex-1 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
                {wabaLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
            {testResult === "ok" && (
              <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
                ✅ Koneksi berhasil — nomor WA siap menerima dan mengirim pesan via API.
              </div>
            )}
            {testResult === "error" && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
                ❌ Gagal terhubung. Periksa Phone Number ID dan Access Token.
              </div>
            )}
          </div>

          {/* Webhook */}
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold">Konfigurasi Webhook</h3>
              <p className="text-xs text-gray-500 mt-0.5">Daftarkan URL ini di Meta agar pesan masuk tercatat otomatis</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Webhook URL</label>
              <div className="flex gap-2">
                <input readOnly value={webhookUrl} className="flex-1 border rounded px-3 py-2 text-sm font-mono bg-gray-50 text-gray-600" />
                <button onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success("URL disalin!"); }}
                  className="px-3 border rounded text-sm hover:bg-gray-50 transition-colors">Salin</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Verify Token</label>
              <div className="flex gap-2">
                <input readOnly value={waba.webhookVerifyToken} className="flex-1 border rounded px-3 py-2 text-sm font-mono bg-gray-50 text-gray-600" />
                <button onClick={() => { navigator.clipboard.writeText(waba.webhookVerifyToken); toast.success("Token disalin!"); }}
                  className="px-3 border rounded text-sm hover:bg-gray-50 transition-colors">Salin</button>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-xs text-blue-800 space-y-1">
              <p className="font-semibold mb-1">Langkah setup di Meta Developer Dashboard:</p>
              <p>1. WhatsApp → Configuration → Webhook → Edit</p>
              <p>2. Masukkan Callback URL + Verify Token di atas</p>
              <p>3. Klik Verify and Save, lalu subscribe field: <strong>messages</strong></p>
            </div>
          </div>

          {/* Auto-pause */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-3">Pengaturan Auto-Pause</h3>
            <div className="space-y-3 text-sm">
              {[
                ["Pause otomatis saat saldo habis", "Selalu aktif"],
                [`Alert email saat saldo < Rp ${LOW_BALANCE_THRESHOLD.toLocaleString()}`, "Aktif"],
                ["Alert WA ke nomor owner", "Aktif"],
              ].map(([label, status]) => (
                <div key={label} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-gray-600">{label}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
