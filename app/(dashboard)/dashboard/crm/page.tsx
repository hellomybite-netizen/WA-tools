"use client";
import { useState } from "react";
import Link from "next/link";
import { DEMO_CONTACTS, CONTACT_STATUS, ContactStatus, Contact } from "@/lib/crm";
import { CURRENCIES, CurrencyCode, formatCurrency } from "@/lib/currencies";

const SOURCE_COLORS: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  tiktok:    "bg-gray-900 text-white",
  facebook:  "bg-blue-100 text-blue-700",
  google:    "bg-yellow-100 text-yellow-700",
};

export default function CRMPage() {
  const [contacts, setContacts] = useState<Contact[]>(DEMO_CONTACTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all");
  const [view, setView] = useState<"list" | "pipeline">("list");

  // Pipeline grouping
  const stages = ["new", "contacted", "negotiating", "won", "lost"] as const;
  const stageLabels: Record<string, { label: string; color: string; bg: string }> = {
    new:         { label: "Baru",       color: "text-blue-700",   bg: "bg-blue-50" },
    contacted:   { label: "Dihubungi",  color: "text-yellow-700", bg: "bg-yellow-50" },
    negotiating: { label: "Negosiasi",  color: "text-orange-700", bg: "bg-orange-50" },
    won:         { label: "Menang ✓",   color: "text-green-700",  bg: "bg-green-50" },
    lost:        { label: "Kalah",      color: "text-gray-500",   bg: "bg-gray-50" },
  };

  const allDeals = contacts.flatMap(c => c.deals.map(d => ({ ...d, contact: c })));

  const filtered = contacts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    all: contacts.length,
    lead: contacts.filter(c => c.status === "lead").length,
    prospect: contacts.filter(c => c.status === "prospect").length,
    customer: contacts.filter(c => c.status === "customer").length,
    churned: contacts.filter(c => c.status === "churned").length,
  };

  const totalCustomers = contacts.filter(c => c.status === "customer").length;
  const totalLeads = contacts.filter(c => c.status === "lead").length;
  const wonDeals = allDeals.filter(d => d.stage === "won").length;
  const activeDeals = allDeals.filter(d => !["won","lost"].includes(d.stage)).length;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">CRM</h1>
          <p className="text-gray-500 text-sm">Kelola kontak, pipeline deal, dan riwayat interaksi</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${view === "list" ? "bg-gray-900 text-white border-gray-900" : "text-gray-500 hover:bg-gray-50"}`}
          >
            ☰ Kontak
          </button>
          <button
            onClick={() => setView("pipeline")}
            className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${view === "pipeline" ? "bg-gray-900 text-white border-gray-900" : "text-gray-500 hover:bg-gray-50"}`}
          >
            ⬜ Pipeline
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Kontak", value: contacts.length, sub: "semua status" },
          { label: "Customers Aktif", value: totalCustomers, sub: "sudah pernah beli" },
          { label: "Lead Baru", value: totalLeads, sub: "belum diproses" },
          { label: "Deal Aktif", value: activeDeals, sub: `${wonDeals} menang total` },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {view === "list" ? (
        <>
          {/* Filters */}
          <div className="flex gap-3 mb-4 flex-wrap items-center">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, nomor, atau tag..."
              className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
            />
            <div className="flex gap-2 flex-wrap">
              {(["all", "lead", "prospect", "customer", "churned"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    statusFilter === s ? "bg-gray-900 text-white" : "border text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {s === "all" ? "Semua" : CONTACT_STATUS[s].label} ({statusCounts[s]})
                </button>
              ))}
            </div>
          </div>

          {/* Contact list */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kontak</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sumber</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tag</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">PIC</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deal</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                          {c.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${CONTACT_STATUS[c.status].color}`}>
                        {CONTACT_STATUS[c.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${SOURCE_COLORS[c.source] ?? "bg-gray-100 text-gray-600"}`}>
                        {c.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {c.tags.map(t => (
                          <span key={t} className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{c.assignedTo}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-gray-900">
                      {c.totalValue > 0
                        ? `${CURRENCIES[c.currency].flag} ${formatCurrency(c.totalValue, c.currency)}`
                        : <span className="text-gray-300 font-normal">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {c.deals.length} deal · {c.deals.filter(d => d.stage === "won").length} menang
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/crm/${c.id}`}
                        className="text-xs px-3 py-1.5 border rounded hover:bg-gray-50 text-gray-600 font-medium transition-colors"
                      >
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-sm">Tidak ada kontak yang cocok</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Pipeline kanban */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => {
            const stageDeals = allDeals.filter(d => d.stage === stage);
            const cfg = stageLabels[stage];
            return (
              <div key={stage} className="flex-shrink-0 w-64">
                <div className={`rounded-t-lg px-3 py-2 border border-b-0 ${cfg.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-xs bg-white rounded-full px-1.5 py-0.5 font-bold text-gray-600 border">{stageDeals.length}</span>
                  </div>
                </div>
                <div className={`min-h-64 border rounded-b-lg p-2 space-y-2 ${cfg.bg}`}>
                  {stageDeals.map(deal => (
                    <Link key={deal.id} href={`/dashboard/crm/${deal.contact.id}`}>
                      <div className="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
                        <p className="text-sm font-medium text-gray-900 mb-1">{deal.title}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                            {deal.contact.name[0]}
                          </div>
                          <span className="text-xs text-gray-500">{deal.contact.name}</span>
                        </div>
                        {deal.value > 0 && (
                          <p className="text-sm font-bold text-gray-900 font-mono">
                            {CURRENCIES[deal.currency].flag} {formatCurrency(deal.value, deal.currency)}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SOURCE_COLORS[deal.source] ?? "bg-gray-100 text-gray-600"}`}>
                            {deal.source}
                          </span>
                          <span className="text-xs text-gray-400">{deal.createdAt}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="text-center py-8 text-gray-300 text-xs">Kosong</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
