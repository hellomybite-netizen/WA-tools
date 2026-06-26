"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ROLES, ROLE_NAV, UserRole } from "@/lib/roles";
import DemoRoleSwitcher from "@/components/demo-role-switcher";

interface Props {
  children: React.ReactNode;
  /** Passed from server layout. null = Supabase not configured (demo mode) */
  serverRole: UserRole | null;
  userEmail: string | null;
  isDemo: boolean;
}

export default function DashboardShell({ children, serverRole, userEmail, isDemo }: Props) {
  const [role, setRole] = useState<UserRole>(serverRole ?? "advertiser");

  useEffect(() => {
    if (!isDemo) return;
    const saved = localStorage.getItem("demo_role") as UserRole | null;
    if (saved && saved in ROLES) setRole(saved);
  }, [isDemo]);

  const navItems = ROLE_NAV[role];
  const roleConfig = ROLES[role];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="px-5 py-4 border-b">
          <span className="font-bold text-base tracking-tight">WA Tools</span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 text-sm rounded hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${roleConfig.color}`}>
              {roleConfig.label}
            </span>
            {isDemo && (
              <span className="text-xs text-orange-500 font-medium">demo</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-2 truncate">
            {userEmail ?? `demo-${role}@watools.id`}
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>

      {isDemo && <DemoRoleSwitcher />}
    </div>
  );
}
