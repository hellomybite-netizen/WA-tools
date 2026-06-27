"use client";
import { TIERS, TIER_FEATURES, SubscriptionTier, tierSatisfies, getUpgradeTier, formatPrice, TierFeatures } from "@/lib/tiers";

interface UpgradeGateProps {
  feature: keyof TierFeatures;
  currentTier: SubscriptionTier;
  children: React.ReactNode;
}

const FEATURE_LABELS: Record<keyof TierFeatures, { title: string; description: string }> = {
  crm:              { title: "CRM",                    description: "Kelola kontak, pipeline deal, dan riwayat interaksi pelanggan" },
  wallet:           { title: "Wallet WA API",          description: "Topup saldo dan gunakan WhatsApp Business API untuk pengiriman pesan otomatis" },
  metaCapi:         { title: "Meta Conversion API",    description: "Kirim event Lead & Purchase ke Meta secara server-side untuk tracking ROAS akurat" },
  multiCurrency:    { title: "Multi-Currency Analytics", description: "Pantau performa iklan dalam 5 mata uang (IDR, USD, HKD, TWD, MYR) dengan blended ROAS" },
  whiteLabel:       { title: "White-Label",            description: "Branding kustom — logo, domain, dan warna sesuai brand Anda" },
  multiWorkspace:   { title: "Multi-Workspace",        description: "Kelola beberapa workspace klien dari satu dashboard terpusat" },
  apiAccess:        { title: "API Access",             description: "Akses REST API untuk integrasi dengan sistem Anda sendiri" },
  prioritySupport:  { title: "Priority Support",       description: "Dukungan tim via WhatsApp dengan respons < 2 jam" },
  maxLinks:         { title: "Link Unlimited",         description: "Buat WA link tanpa batas untuk semua kampanye iklan Anda" },
  maxRotators:      { title: "Chat Rotator Unlimited", description: "Buat grup rotasi tanpa batas untuk distribusi chat yang merata" },
  maxBioLinks:      { title: "Bio Link Unlimited",     description: "Buat halaman bio link tanpa batas untuk semua produk dan channel" },
  maxTeamMembers:   { title: "Tim Lebih Besar",        description: "Tambahkan lebih banyak anggota tim Advertiser dan CS" },
};

export default function UpgradeGate({ feature, currentTier, children }: UpgradeGateProps) {
  const features = TIER_FEATURES[currentTier];
  const featureValue = features[feature];

  // Check if feature is boolean-gated
  if (typeof featureValue === "boolean" && !featureValue) {
    return <UpgradePrompt feature={feature} currentTier={currentTier} />;
  }

  return <>{children}</>;
}

function UpgradePrompt({ feature, currentTier }: { feature: keyof TierFeatures; currentTier: SubscriptionTier }) {
  const upgradeTier = getUpgradeTier(currentTier);
  const info = FEATURE_LABELS[feature];

  // Find the minimum tier that unlocks this feature
  const requiredTier = (["starter", "pro", "agency"] as SubscriptionTier[]).find(t => {
    const val = TIER_FEATURES[t][feature];
    return val === true || val === "unlimited";
  }) ?? "pro";

  const requiredCfg = TIERS[requiredTier];
  const upgradeCfg = upgradeTier ? TIERS[upgradeTier] : null;

  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="max-w-md w-full mx-auto text-center">
        {/* Lock icon */}
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔒</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">{info.description}</p>

        {/* Current vs required */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="text-center">
            <div className={`text-xs font-bold px-3 py-1 rounded-full ${TIERS[currentTier].color}`}>
              {TIERS[currentTier].label} (sekarang)
            </div>
          </div>
          <span className="text-gray-300">→</span>
          <div className="text-center">
            <div className={`text-xs font-bold px-3 py-1 rounded-full ${requiredCfg.color}`}>
              {requiredCfg.label} diperlukan
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        {upgradeCfg && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-5 mb-4">
            <p className="text-sm font-semibold text-gray-800 mb-1">
              Upgrade ke {requiredCfg.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 mb-3">
              {formatPrice(requiredTier)}<span className="text-sm font-normal text-gray-400">/bulan</span>
            </p>
            <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Upgrade Sekarang →
            </button>
          </div>
        )}

        <p className="text-xs text-gray-400">
          Atau <a href="/" className="text-blue-500 hover:underline">lihat perbandingan semua paket</a>
        </p>
      </div>
    </div>
  );
}
