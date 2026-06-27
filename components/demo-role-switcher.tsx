"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLES, ROLE_HOME, UserRole } from "@/lib/roles";
import { TIERS, SubscriptionTier, formatPrice } from "@/lib/tiers";

export default function DemoRoleSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"role" | "tier">("role");
  const [currentRole, setCurrentRole] = useState<UserRole>("advertiser");
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>("pro");

  useEffect(() => {
    const savedRole = localStorage.getItem("demo_role") as UserRole | null;
    const savedTier = localStorage.getItem("demo_tier") as SubscriptionTier | null;
    if (savedRole && savedRole in ROLES) setCurrentRole(savedRole);
    if (savedTier && savedTier in TIERS) setCurrentTier(savedTier);
  }, []);

  function switchRole(role: UserRole) {
    localStorage.setItem("demo_role", role);
    setCurrentRole(role);
    setOpen(false);
    router.push(ROLE_HOME[role]);
    setTimeout(() => window.location.reload(), 50);
  }

  function switchTier(tier: SubscriptionTier) {
    localStorage.setItem("demo_tier", tier);
    setCurrentTier(tier);
    setOpen(false);
    setTimeout(() => window.location.reload(), 50);
  }

  const roleConfig = ROLES[currentRole];
  const tierConfig = TIERS[currentTier];

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-2 bg-white border rounded-xl shadow-xl overflow-hidden w-72">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Demo Mode</p>
            <p className="text-xs text-gray-400 mt-0.5">Simulasi tampilan tanpa login</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setTab("role")}
              className={`flex-1 py-2 text-xs font-semibold transition-colors ${tab === "role" ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
            >
              👤 Role
            </button>
            <button
              onClick={() => setTab("tier")}
              className={`flex-1 py-2 text-xs font-semibold transition-colors ${tab === "tier" ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
            >
              💎 Tier Langganan
            </button>
          </div>

          <div className="p-2">
            {tab === "role" ? (
              <div className="space-y-1">
                {(Object.entries(ROLES) as [UserRole, typeof ROLES[UserRole]][]).map(([role, cfg]) => (
                  <button
                    key={role}
                    onClick={() => switchRole(role)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start gap-3 ${
                      currentRole === role ? "bg-gray-100 ring-1 ring-gray-200" : "hover:bg-gray-50"
                    }`}
                  >
                    <span className={`mt-0.5 text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-gray-500 leading-relaxed">{cfg.description}</span>
                  </button>
                ))}
                <p className="text-xs text-gray-400 px-2 pt-1">Role = siapa yang login (akses menu)</p>
              </div>
            ) : (
              <div className="space-y-1">
                {(Object.entries(TIERS) as [SubscriptionTier, typeof TIERS[SubscriptionTier]][]).map(([tier, cfg]) => (
                  <button
                    key={tier}
                    onClick={() => switchTier(tier)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                      currentTier === tier ? "bg-gray-100 ring-1 ring-gray-200" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${cfg.color}`}>{cfg.label}</span>
                      {currentTier === tier && <span className="text-xs text-gray-400">aktif</span>}
                    </div>
                    <span className="text-xs font-mono text-gray-500">{formatPrice(tier)}/bln</span>
                  </button>
                ))}
                <p className="text-xs text-gray-400 px-2 pt-1">Tier = fitur yang bisa diakses (berdasarkan paket)</p>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-gray-700 transition-colors text-sm font-medium"
      >
        <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${roleConfig.color}`}>
          {roleConfig.label}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${tierConfig.color}`}>
          {tierConfig.label}
        </span>
        <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>
    </div>
  );
}
