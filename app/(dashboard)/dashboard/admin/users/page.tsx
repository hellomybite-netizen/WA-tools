"use client";
import { useState } from "react";
import { toast } from "sonner";
import { ROLES, UserRole } from "@/lib/roles";

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  joinedAt: string;
  lastActive: string;
  stats: { leads?: number; conversions?: number; links?: number };
}

const demoMembers: TeamMember[] = [
  { id: "1", email: "admin@toko.id",       name: "Budi Santoso",  role: "admin",      joinedAt: "1 Jan 2025",  lastActive: "Baru saja",    stats: {} },
  { id: "2", email: "marketing@toko.id",   name: "Rina Kusuma",   role: "advertiser", joinedAt: "5 Feb 2025",  lastActive: "2 jam lalu",   stats: { leads: 247, links: 18 } },
  { id: "3", email: "iklan2@toko.id",      name: "Dani Wijaya",   role: "advertiser", joinedAt: "10 Mar 2025", lastActive: "1 hari lalu",  stats: { leads: 134, links: 9 } },
  { id: "4", email: "cs1@toko.id",         name: "Siti Aminah",   role: "cs",         joinedAt: "1 Feb 2025",  lastActive: "30 mnt lalu",  stats: { conversions: 34 } },
  { id: "5", email: "cs2@toko.id",         name: "Ahmad Fauzi",   role: "cs",         joinedAt: "1 Feb 2025",  lastActive: "1 jam lalu",   stats: { conversions: 28 } },
  { id: "6", email: "cs3@toko.id",         name: "Dewi Hartanti", role: "cs",         joinedAt: "15 Mar 2025", lastActive: "3 jam lalu",   stats: { conversions: 19 } },
];

export default function UsersPage() {
  const [members, setMembers] = useState<TeamMember[]>(demoMembers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("cs");
  const [inviteName, setInviteName] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<UserRole | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setMembers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        email: inviteEmail,
        name: inviteName,
        role: inviteRole,
        joinedAt: "Baru diundang",
        lastActive: "Belum login",
        stats: {},
      },
    ]);
    toast.success(`Undangan dikirim ke ${inviteEmail} sebagai ${ROLES[inviteRole].label}`);
    setInviteEmail("");
    setInviteName("");
    setSending(false);
  }

  function changeRole(id: string, newRole: UserRole) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
    toast.success("Role diperbarui");
    setEditingId(null);
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success("Anggota dihapus dari tim");
  }

  const filtered = filter === "all" ? members : members.filter((m) => m.role === filter);
  const counts = { all: members.length, admin: members.filter(m=>m.role==="admin").length, advertiser: members.filter(m=>m.role==="advertiser").length, cs: members.filter(m=>m.role==="cs").length };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Kelola User & Tim</h1>
      <p className="text-gray-500 text-sm mb-6">Undang anggota tim dan atur akses mereka</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Invite form */}
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-5">
            <h2 className="font-semibold mb-4 text-sm">Undang Anggota Baru</h2>
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama</label>
                <input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nama lengkap"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="email@tim.id"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {(Object.keys(ROLES) as UserRole[]).map((r) => (
                    <option key={r} value={r}>{ROLES[r].label} — {ROLES[r].description}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {sending ? "Mengirim..." : "Kirim Undangan"}
              </button>
            </form>
          </div>

          {/* Role info cards */}
          <div className="space-y-2">
            {(Object.entries(ROLES) as [UserRole, typeof ROLES[UserRole]][]).map(([key, r]) => (
              <div key={key} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${r.color}`}>{r.label}</span>
                    <span className="text-xs text-gray-400">{counts[key]} anggota</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{r.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Member list */}
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-4 flex-wrap">
            {(["all", "admin", "advertiser", "cs"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  filter === f ? "bg-gray-900 text-white" : "border text-gray-500 hover:bg-gray-50"
                }`}
              >
                {f === "all" ? "Semua" : ROLES[f].label} ({counts[f]})
              </button>
            ))}
          </div>

          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Anggota</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aktivitas</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Terakhir Aktif</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                          {m.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{m.name}</p>
                          <p className="text-xs text-gray-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === m.id ? (
                        <select
                          defaultValue={m.role}
                          onChange={(e) => changeRole(m.id, e.target.value as UserRole)}
                          className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                          autoFocus
                          onBlur={() => setEditingId(null)}
                        >
                          {(Object.keys(ROLES) as UserRole[]).map((r) => (
                            <option key={r} value={r}>{ROLES[r].label}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingId(m.id)}
                          className={`text-xs font-medium px-2 py-0.5 rounded ${ROLES[m.role].color} hover:opacity-80 transition-opacity`}
                        >
                          {ROLES[m.role].label}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {m.role === "advertiser" && m.stats.leads !== undefined && (
                        <span>{m.stats.leads} leads · {m.stats.links} links</span>
                      )}
                      {m.role === "cs" && m.stats.conversions !== undefined && (
                        <span>{m.stats.conversions} konversi</span>
                      )}
                      {m.role === "admin" && <span className="text-gray-400">Full access</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{m.lastActive}</td>
                    <td className="px-4 py-3 text-right">
                      {m.id !== "1" && (
                        <button
                          onClick={() => removeMember(m.id)}
                          className="text-xs text-red-400 hover:text-red-600 px-2 transition-colors"
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
