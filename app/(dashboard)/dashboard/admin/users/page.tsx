"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { TIERS, SubscriptionTier } from "@/lib/tiers";
import { ROLES, UserRole } from "@/lib/roles";

interface User {
  id: string;
  email: string;
  name: string;
  business_name: string;
  phone: string;
  role: UserRole;
  tier: SubscriptionTier;
  trial_ends_at: string | null;
  created_at: string;
}

const TIER_OPTIONS: SubscriptionTier[] = ["trial", "starter", "pro", "agency"];
const ROLE_OPTIONS: UserRole[] = ["admin", "advertiser", "cs"];

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterTier, setFilterTier] = useState<SubscriptionTier | "all">("all");
  const [saving, setSaving]   = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) { const { users } = await res.json(); setUsers(users); }
    else toast.error("Gagal memuat data user");
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateUser(userId: string, field: "tier" | "role", value: string) {
    setSaving(userId + field);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, [field]: value }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: value } : u));
      toast.success("Berhasil diperbarui");
    } else {
      toast.error("Gagal memperbarui");
    }
    setSaving(null);
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.email.includes(search) || u.name?.toLowerCase().includes(search.toLowerCase()) || u.business_name?.toLowerCase().includes(search.toLowerCase());
    const matchTier   = filterTier === "all" || u.tier === filterTier;
    return matchSearch && matchTier;
  });

  // Stats
  const stats = {
    total:   users.length,
    trial:   users.filter(u => u.tier === "trial").length,
    starter: users.filter(u => u.tier === "starter").length,
    pro:     users.filter(u => u.tier === "pro").length,
    agency:  users.filter(u => u.tier === "agency").length,
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  if (loading) return <div className="py-16 text-center text-gray-400 text-sm">Memuat data...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Admin — Kelola User</h1>
      <p className="text-gray-500 text-sm mb-6">Semua subscriber Chatlacak.com</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total User", value: stats.total, color: "bg-gray-50" },
          { label: "Trial",      value: stats.trial,   color: "bg-green-50" },
          { label: "Starter",    value: stats.starter, color: "bg-gray-50" },
          { label: "Pro",        value: stats.pro,     color: "bg-blue-50" },
          { label: "Agency",     value: stats.agency,  color: "bg-purple-50" },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-lg p-4 text-center`}>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
          placeholder="Cari email / nama / bisnis..."
        />
        <div className="flex gap-2 flex-wrap">
          {(["all", ...TIER_OPTIONS] as const).map(t => (
            <button key={t} onClick={() => setFilterTier(t as SubscriptionTier | "all")}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${filterTier === t ? "bg-gray-900 text-white" : "border text-gray-500 hover:bg-gray-50"}`}>
              {t === "all" ? "Semua" : TIERS[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Bisnis</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trial Berakhir</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Daftar</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Tidak ada user ditemukan</td></tr>
            )}
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">
                      {(u.name || u.email)?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.name || "—"}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-700">{u.business_name || "—"}</p>
                  <p className="text-xs text-gray-400">{u.phone || ""}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.tier}
                    disabled={saving === u.id + "tier"}
                    onChange={e => updateUser(u.id, "tier", e.target.value)}
                    className={`border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 ${TIERS[u.tier]?.color ?? ""}`}
                  >
                    {TIER_OPTIONS.map(t => (
                      <option key={t} value={t}>{TIERS[t].label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    disabled={saving === u.id + "role"}
                    onChange={e => updateUser(u.id, "role", e.target.value)}
                    className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    {ROLE_OPTIONS.map(r => (
                      <option key={r} value={r}>{ROLES[r].label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {u.trial_ends_at ? formatDate(u.trial_ends_at) : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {u.created_at ? formatDate(u.created_at) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">{filtered.length} dari {users.length} user ditampilkan</p>
    </div>
  );
}
