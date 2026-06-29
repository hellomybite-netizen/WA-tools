"use client";
import { useState, useEffect, useCallback } from "react";
import { TIERS, SubscriptionTier } from "@/lib/tiers";

interface Metrics {
  users: { total: number; newToday: number; newWeek: number; newMonth: number; byTier: Record<string, number> };
  clicks: { total: number; today: number };
  conversions: { total: number };
  signupsByDay: { date: string; count: number }[];
  clicksByDay: { date: string; count: number }[];
  recentUsers: { id: string; email: string; name: string; business_name: string; tier: SubscriptionTier; created_at: string }[];
}

function MiniBar({ data, color = "#16a34a" }: { data: { date: string; count: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-0.5 h-12">
      {data.map(d => (
        <div key={d.date} className="flex-1 rounded-sm transition-all" title={`${d.date}: ${d.count}`}
          style={{ height: `${Math.max(4, (d.count / max) * 100)}%`, backgroundColor: color, opacity: d.count === 0 ? 0.15 : 0.85 }} />
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, color = "text-gray-900" }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="bg-white border rounded-lg p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/metrics");
    if (res.ok) setMetrics(await res.json());
    else setError("Akses ditolak — pastikan role Anda adalah admin.");
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  if (loading) return <div className="py-16 text-center text-gray-400 text-sm">Memuat dashboard...</div>;
  if (error)   return <div className="py-16 text-center text-red-400 text-sm">{error}</div>;
  if (!metrics) return null;

  const { users, clicks, conversions, signupsByDay, clicksByDay, recentUsers } = metrics;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Owner Dashboard</h1>
        <p className="text-gray-500 text-sm">Ringkasan bisnis Chatlacak.com</p>
      </div>

      {/* KPI utama */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total User" value={users.total} sub={`+${users.newMonth} bulan ini`} />
        <StatCard label="Daftar Hari Ini" value={users.newToday} sub={`+${users.newWeek} minggu ini`} color="text-green-600" />
        <StatCard label="Total Klik Terlacak" value={clicks.total.toLocaleString("id-ID")} sub={`${clicks.today} hari ini`} />
        <StatCard label="Total Konversi" value={conversions.total.toLocaleString("id-ID")} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">Pendaftaran User</p>
              <p className="text-xs text-gray-400">30 hari terakhir</p>
            </div>
            <span className="text-xl font-bold text-green-600">+{users.newMonth}</span>
          </div>
          <MiniBar data={signupsByDay} color="#16a34a" />
        </div>
        <div className="bg-white border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">Klik Terlacak</p>
              <p className="text-xs text-gray-400">30 hari terakhir</p>
            </div>
            <span className="text-xl font-bold text-blue-600">{clicksByDay.reduce((s,d)=>s+d.count,0).toLocaleString("id-ID")}</span>
          </div>
          <MiniBar data={clicksByDay} color="#2563eb" />
        </div>
      </div>

      {/* Tier breakdown + recent users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tier breakdown */}
        <div className="bg-white border rounded-lg p-5">
          <p className="text-sm font-semibold mb-4">Breakdown per Paket</p>
          <div className="space-y-3">
            {(["trial","starter","pro","agency"] as SubscriptionTier[]).map(t => {
              const count = users.byTier[t] ?? 0;
              const pct   = users.total > 0 ? Math.round((count / users.total) * 100) : 0;
              return (
                <div key={t}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`font-medium px-1.5 py-0.5 rounded ${TIERS[t].color}`}>{TIERS[t].label}</span>
                    <span className="text-gray-500">{count} user ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent signups */}
        <div className="lg:col-span-2 bg-white border rounded-lg p-5">
          <p className="text-sm font-semibold mb-4">Pendaftar Terbaru</p>
          <div className="space-y-3">
            {recentUsers.length === 0 && <p className="text-sm text-gray-400">Belum ada user</p>}
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">
                    {(u.name || u.email)?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.name || u.email}</p>
                    <p className="text-xs text-gray-400 truncate">{u.business_name || u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${TIERS[u.tier]?.color ?? "bg-gray-100 text-gray-600"}`}>
                    {TIERS[u.tier]?.label ?? u.tier}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:block">{formatDate(u.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
