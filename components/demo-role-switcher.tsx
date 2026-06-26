"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLES, ROLE_HOME, UserRole } from "@/lib/roles";

export default function DemoRoleSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<UserRole>("advertiser");

  useEffect(() => {
    const saved = localStorage.getItem("demo_role") as UserRole | null;
    if (saved && saved in ROLES) setCurrent(saved);
  }, []);

  function switchRole(role: UserRole) {
    localStorage.setItem("demo_role", role);
    setCurrent(role);
    setOpen(false);
    // Navigate to role's home page then reload so layout re-reads the role
    router.push(ROLE_HOME[role]);
    setTimeout(() => window.location.reload(), 50);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-2 bg-white border rounded-xl shadow-xl overflow-hidden w-64">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Demo Mode — Pilih Role</p>
            <p className="text-xs text-gray-400 mt-0.5">Simulasi tampilan per role tanpa login</p>
          </div>
          <div className="p-2 space-y-1">
            {(Object.entries(ROLES) as [UserRole, typeof ROLES[UserRole]][]).map(([role, cfg]) => (
              <button
                key={role}
                onClick={() => switchRole(role)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start gap-3 ${
                  current === role ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <span className={`mt-0.5 text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${cfg.color}`}>
                  {cfg.label}
                </span>
                <span className="text-xs text-gray-500 leading-relaxed">{cfg.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-gray-700 transition-colors text-sm font-medium"
      >
        <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${ROLES[current].color}`}>
          {ROLES[current].label}
        </span>
        <span>Ganti Role</span>
        <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>
    </div>
  );
}
