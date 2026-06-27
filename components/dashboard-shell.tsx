"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROLES, ROLE_NAV, UserRole } from "@/lib/roles";
import { TIERS, TIER_FEATURES, SubscriptionTier } from "@/lib/tiers";
import DemoRoleSwitcher from "@/components/demo-role-switcher";

interface Props {
  children: React.ReactNode;
  serverRole: UserRole | null;
  serverTier: SubscriptionTier | null;
  userEmail: string | null;
  isDemo: boolean;
}

// Features locked per nav item — maps href to feature key
const NAV_TIER_GATES: Record<string, keyof typeof TIER_FEATURES["starter"]> = {
  "/dashboard/crm":         "crm",
  "/dashboard/wallet":      "wallet",
  "/dashboard/analytics":   "multiCurrency",
  "/dashboard/workspace":   "multiWorkspace",
  "/dashboard/white-label": "whiteLabel",
  "/dashboard/api-access":  "apiAccess",
};

export default function DashboardShell({ children, serverRole, serverTier, userEmail, isDemo }: Props) {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>(serverRole ?? "advertiser");
  const [tier, setTier] = useState<SubscriptionTier>(serverTier ?? "pro");

  useEffect(() => {
    if (!isDemo) return;
    const savedRole = localStorage.getItem("demo_role") as UserRole | null;
    const savedTier = localStorage.getItem("demo_tier") as SubscriptionTier | null;
    if (savedRole && savedRole in ROLES) setRole(savedRole);
    if (savedTier && savedTier in TIERS) setTier(savedTier);
  }, [isDemo]);

  const navItems = ROLE_NAV[role];
  const roleConfig = ROLES[role];
  const tierConfig = TIERS[tier];
  const features = TIER_FEATURES[tier];

  function isNavLocked(href: string): boolean {
    const gate = NAV_TIER_GATES[href];
    if (!gate) return false;
    const val = features[gate];
    return val === false;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="px-5 py-4 border-b">
          <span className="font-bold text-base tracking-tight">WA Tools</span>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map((item) => {
            const locked = isNavLocked(item.href);
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded transition-colors group ${
                  isActive
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span>{item.icon}</span>
                  <span className={locked ? "text-gray-400" : ""}>{item.label}</span>
                </span>
                {locked && (
                  <span className="text-xs text-gray-300 group-hover:text-gray-400">🔒</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t space-y-2">
          {/* Tier badge */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${tierConfig.color}`}>
              {tierConfig.label}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${roleConfig.color}`}>
              {roleConfig.label}
            </span>
          </div>

          {/* Upgrade CTA for non-agency */}
          {tier !== "agency" && (
            <Link
              href="/#pricing"
              className="block w-full text-center text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Upgrade Plan →
            </Link>
          )}

          <p className="text-xs text-gray-400 truncate">
            {userEmail ?? `demo-${role}@watools.id`}
          </p>

          {isDemo && (
            <p className="text-xs text-orange-400 font-medium">● Demo Mode</p>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>

      {isDemo && <DemoRoleSwitcher />}
    </div>
  );
}
