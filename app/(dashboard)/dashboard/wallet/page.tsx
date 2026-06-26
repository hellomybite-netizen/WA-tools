"use client";
import { useState } from "react";
import { toast } from "sonner";
import { TOPUP_PACKAGES, CONVERSATION_RATE } from "@/lib/midtrans";
import { createClient } from "@/lib/supabase";

// Demo ledger data
const demoLedger = [
  { id: "1", type: "topup", amount: 210_000, description: "Topup Rp 200.000 + bonus Rp 10.000", created_at: "2025-07-01 09:00" },
  { id: "2", type: "debit", amount: -650, description: "Conversation marketing — promo-juli", created_at: "2025-07-01 10:14" },
  { id: "3", type: "debit", amount: -650, description: "Conversation marketing — fyp-ads", created_at: "2025-07-01 11:02" },
  { id: "4", type: "debit", amount: -650, description: "Conversation marketing — promo-juli", created_at: "2025-07-01 13:45" },
  { id: "5", type: "topup", amount: 550_000, description: "Topup Rp 500.000 + bonus Rp 50.000", created_at: "2025-06-25 14:00" },
];

const demoBalance = 207_400;

export default function WalletPage() {
  const [balance] = useState(demoBalance);
  const [ledger] = useState(demoLedger);
  const [selectedPkg, setSelectedPkg] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const estimatedConversations = Math.floor(balance / CONVERSATION_RATE);
  const isLow = balance < 50_000;

  async function handleTopup() {
    if (!selectedPkg) { toast.error("Pilih nominal topup dulu"); return; }
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const res = await fetch("/api/topup/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: selectedPkg,
        userId: user?.id ?? "demo-user",
        userEmail: user?.email ?? "demo@watools.id",
      }),
    });

    const { token, demo } = await res.json();

    if (demo) {
      toast.success("Demo mode: Midtrans belum dikonfigurasi. Topup berhasil disimulasi!", { duration: 4000 });
      setLoading(false);
      return;
    }

    // Load Midtrans Snap
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    const snapUrl = process.env.MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    if (!(window as any).snap) {
      const script = document.createElement("script");
      script.src = snapUrl;
      script.setAttribute("data-client-key", clientKey!);
      document.head.appendChild(script);
      await new Promise((r) => setTimeout(r, 1000));
    }

    (window as any).snap.pay(token, {
      onSuccess: () => { toast.success("Pembayaran berhasil! Saldo akan terupdate."); setLoading(false); },
      onPending: () => { toast.info("Menunggu pembayaran..."); setLoading(false); },
      onError: () => { toast.error("Pembayaran gagal."); setLoading(false); },
      onClose: () => { setLoading(false); },
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Wallet WA API</h1>
      <p className="text-gray-500 text-sm mb-6">Saldo untuk biaya conversation WhatsApp API</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Balance + Topup */}
        <div className="lg:col-span-2 space-y-5">

          {/* Balance card */}
          <div className={`rounded-lg p-6 text-white ${isLow ? "bg-red-600" : "bg-gray-900"}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-70 mb-1">Saldo Tersedia</p>
                <p className="text-4xl font-bold tracking-tight">
                  Rp {balance.toLocaleString("id-ID")}
                </p>
                <p className="text-sm opacity-60 mt-2">
                  ≈ {estimatedConversations.toLocaleString()} conversation marketing tersisa
                </p>
              </div>
              <div className="text-right">
                {isLow && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded font-medium">
                    ⚠ Saldo Rendah
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs opacity-60">Dipakai bulan ini</p>
                <p className="font-semibold">Rp 1.950</p>
              </div>
              <div>
                <p className="text-xs opacity-60">Conversation</p>
                <p className="font-semibold">3 conv</p>
              </div>
              <div>
                <p className="text-xs opacity-60">Rate per conv</p>
                <p className="font-semibold">Rp {CONVERSATION_RATE.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Topup packages */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-1">Topup Saldo</h2>
            <p className="text-sm text-gray-500 mb-4">Pilih nominal — bonus otomatis ditambahkan</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {TOPUP_PACKAGES.map((pkg) => (
                <button
                  key={pkg.amount}
                  onClick={() => setSelectedPkg(pkg.amount)}
                  className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                    selectedPkg === pkg.amount
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2 left-3 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                      Populer
                    </span>
                  )}
                  <p className="font-bold text-gray-900">{pkg.label}</p>
                  {pkg.bonus > 0 && (
                    <p className="text-xs text-green-600 font-medium mt-0.5">
                      + bonus Rp {pkg.bonus.toLocaleString("id-ID")}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{pkg.conversations}</p>
                </button>
              ))}
            </div>

            {selectedPkg && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                {(() => {
                  const pkg = TOPUP_PACKAGES.find((p) => p.amount === selectedPkg)!;
                  return (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">Total dibayar: </span>
                        <span className="font-bold">Rp {pkg.amount.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500">Saldo masuk: </span>
                        <span className="font-bold text-green-600">
                          Rp {(pkg.amount + pkg.bonus).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <button
              onClick={handleTopup}
              disabled={!selectedPkg || loading}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:opacity-40 transition-colors"
            >
              {loading ? "Membuka pembayaran..." : "Topup Sekarang"}
            </button>

            {/* Payment methods */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-400 mb-2">Metode pembayaran tersedia:</p>
              <div className="flex flex-wrap gap-2">
                {["QRIS", "GoPay", "OVO", "Dana", "BCA VA", "Mandiri VA", "BRI VA", "BNI VA", "Kartu Kredit"].map((m) => (
                  <span key={m} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Info + History */}
        <div className="space-y-5">

          {/* Info box */}
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold mb-3 text-sm">Cara Kerja Saldo</h3>
            <div className="space-y-3">
              {[
                { icon: "🆓", text: "Chat dari klik iklan (user mulai): GRATIS — tidak potong saldo" },
                { icon: "💰", text: "Broadcast / chatbot (bisnis mulai): Rp 650/conversation" },
                { icon: "⏸️", text: "Saldo habis: fitur WA API pause, fitur lain tetap jalan" },
                { icon: "📧", text: "Notifikasi email + WA saat saldo < Rp 50.000" },
              ].map((item, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="flex-shrink-0">{item.icon}</span>
                  <p className="text-gray-600 leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction history */}
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold mb-3 text-sm">Riwayat Transaksi</h3>
            <div className="space-y-2">
              {ledger.map((tx) => (
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
    </div>
  );
}
