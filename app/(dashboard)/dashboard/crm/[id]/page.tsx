"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { DEMO_CONTACTS, CONTACT_STATUS, DEAL_STAGES, ContactStatus, DealStage, ContactNote } from "@/lib/crm";
import { CURRENCIES, CurrencyCode, formatCurrency } from "@/lib/currencies";

const SOURCE_COLORS: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  tiktok:    "bg-gray-900 text-white",
  facebook:  "bg-blue-100 text-blue-700",
  google:    "bg-yellow-100 text-yellow-700",
};

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const initial = DEMO_CONTACTS.find(c => c.id === id);
  const [contact, setContact] = useState(initial ?? null);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [addingTag, setAddingTag] = useState(false);

  if (!contact) return (
    <div className="text-center py-20 text-gray-400">
      <p className="text-4xl mb-3">🔍</p>
      <p className="mb-4">Kontak tidak ditemukan</p>
      <Link href="/dashboard/crm" className="text-green-600 hover:underline text-sm">← Kembali ke CRM</Link>
    </div>
  );

  function addNote() {
    if (!newNote.trim()) return;
    const note: ContactNote = {
      id: Date.now().toString(),
      text: newNote.trim(),
      createdAt: new Date().toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }),
      author: "Saya",
    };
    setContact(c => c ? { ...c, notes: [note, ...c.notes] } : c);
    setNewNote("");
    setAddingNote(false);
    toast.success("Catatan ditambahkan");
  }

  function updateDealStage(dealId: string, stage: DealStage) {
    setContact(c => c ? {
      ...c,
      deals: c.deals.map(d => d.id === dealId ? { ...d, stage } : d),
    } : c);
    toast.success(`Stage diperbarui ke ${DEAL_STAGES[stage].label}`);
  }

  function updateStatus(status: ContactStatus) {
    setContact(c => c ? { ...c, status } : c);
    setEditStatus(false);
    toast.success(`Status kontak diperbarui ke ${CONTACT_STATUS[status].label}`);
  }

  function addTag() {
    if (!newTag.trim() || contact?.tags.includes(newTag.trim())) return;
    setContact(c => c ? { ...c, tags: [...c.tags, newTag.trim()] } : c);
    setNewTag("");
    setAddingTag(false);
  }

  function removeTag(tag: string) {
    setContact(c => c ? { ...c, tags: c.tags.filter(t => t !== tag) } : c);
  }

  const wonDeals = contact.deals.filter(d => d.stage === "won");
  const activeDeals = contact.deals.filter(d => !["won", "lost"].includes(d.stage));

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
        <Link href="/dashboard/crm" className="hover:text-gray-700 transition-colors">CRM</Link>
        <span>›</span>
        <span className="text-gray-700">{contact.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — Contact info */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="bg-white border rounded-lg p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600 flex-shrink-0">
                {contact.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1">
                <h1 className="font-bold text-gray-900 text-base">{contact.name}</h1>
                <p className="text-sm text-gray-500">{contact.phone}</p>
                {contact.email && <p className="text-xs text-gray-400">{contact.email}</p>}
              </div>
            </div>

            {/* Status */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              {editStatus ? (
                <select
                  defaultValue={contact.status}
                  onChange={e => updateStatus(e.target.value as ContactStatus)}
                  className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                  onBlur={() => setEditStatus(false)}
                >
                  {(Object.keys(CONTACT_STATUS) as ContactStatus[]).map(s => (
                    <option key={s} value={s}>{CONTACT_STATUS[s].label}</option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={() => setEditStatus(true)}
                  className={`text-xs font-medium px-2 py-1 rounded ${CONTACT_STATUS[contact.status].color} hover:opacity-80 transition-opacity`}
                >
                  {CONTACT_STATUS[contact.status].label} ▾
                </button>
              )}
            </div>

            {/* Info rows */}
            <div className="space-y-2 text-sm">
              {[
                { label: "Sumber", value: <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SOURCE_COLORS[contact.source] ?? "bg-gray-100 text-gray-600"}`}>{contact.source}</span> },
                { label: "Kampanye", value: <span className="text-gray-700">{contact.campaign}</span> },
                { label: "PIC", value: <span className="text-gray-700">{contact.assignedTo}</span> },
                { label: "Bergabung", value: <span className="text-gray-700">{contact.createdAt}</span> },
                { label: "Terakhir", value: <span className="text-gray-700">{contact.lastContactedAt}</span> },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">{row.label}</span>
                  {row.value}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <a
                href={`https://wa.me/${contact.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
              >
                💬 Buka WhatsApp
              </a>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Tag</h3>
              <button
                onClick={() => setAddingTag(true)}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                + Tambah
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {contact.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded group">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="opacity-0 group-hover:opacity-100 text-purple-400 hover:text-purple-700 transition-opacity leading-none">×</button>
                </span>
              ))}
              {contact.tags.length === 0 && !addingTag && <span className="text-xs text-gray-300">Belum ada tag</span>}
            </div>
            {addingTag && (
              <div className="flex gap-2 mt-2">
                <input
                  autoFocus
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addTag(); if (e.key === "Escape") setAddingTag(false); }}
                  className="flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Nama tag..."
                />
                <button onClick={addTag} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">OK</button>
              </div>
            )}
          </div>

          {/* Value summary */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Ringkasan</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Deal</span>
                <span className="font-medium">{contact.deals.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Deal Menang</span>
                <span className="font-medium text-green-600">{wonDeals.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Aktif</span>
                <span className="font-medium text-orange-600">{activeDeals.length}</span>
              </div>
              {contact.totalValue > 0 && (
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-gray-500">Total Value</span>
                  <span className="font-bold text-gray-900 font-mono">
                    {CURRENCIES[contact.currency].flag} {formatCurrency(contact.totalValue, contact.currency)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Deals + Notes */}
        <div className="lg:col-span-2 space-y-5">
          {/* Deals */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-sm">Deal ({contact.deals.length})</h2>
            </div>
            <div className="divide-y">
              {contact.deals.map(deal => {
                const stageCfg = DEAL_STAGES[deal.stage];
                return (
                  <div key={deal.id} className="px-5 py-4 flex items-start gap-4">
                    <div className={`w-2 mt-1.5 h-2 rounded-full flex-shrink-0 ${
                      deal.stage === "won" ? "bg-green-500" :
                      deal.stage === "lost" ? "bg-gray-300" :
                      deal.stage === "negotiating" ? "bg-orange-400" :
                      "bg-blue-400"
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 text-sm">{deal.title}</p>
                        {deal.value > 0 && (
                          <span className="font-bold text-sm font-mono text-gray-900">
                            {CURRENCIES[deal.currency].flag} {formatCurrency(deal.value, deal.currency)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SOURCE_COLORS[deal.source] ?? "bg-gray-100 text-gray-600"}`}>
                          {deal.source}
                        </span>
                        <span className="text-xs text-gray-400">{deal.campaign}</span>
                        <span className="text-xs text-gray-400">{deal.createdAt}</span>
                        {deal.closedAt && <span className="text-xs text-gray-400">→ {deal.closedAt}</span>}
                      </div>
                    </div>
                    <select
                      value={deal.stage}
                      onChange={e => updateDealStage(deal.id, e.target.value as DealStage)}
                      className={`border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 flex-shrink-0 ${stageCfg.color}`}
                    >
                      {(Object.keys(DEAL_STAGES) as DealStage[]).map(s => (
                        <option key={s} value={s}>{DEAL_STAGES[s].label}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
              {contact.deals.length === 0 && (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">Belum ada deal</div>
              )}
            </div>
          </div>

          {/* Notes / Activity */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-sm">Catatan & Aktivitas ({contact.notes.length})</h2>
              <button
                onClick={() => setAddingNote(v => !v)}
                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors font-medium"
              >
                + Tambah Catatan
              </button>
            </div>

            {addingNote && (
              <div className="px-5 py-4 border-b bg-green-50">
                <textarea
                  autoFocus
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  rows={3}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Tulis catatan, hasil follow-up, atau info penting..."
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={addNote}
                    className="px-4 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => { setAddingNote(false); setNewNote(""); }}
                    className="px-3 py-1.5 text-gray-500 hover:text-gray-800 text-sm"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            <div className="divide-y">
              {contact.notes.map(note => (
                <div key={note.id} className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                      {note.author[0]}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{note.author}</span>
                    <span className="text-xs text-gray-400">{note.createdAt}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{note.text}</p>
                </div>
              ))}
              {contact.notes.length === 0 && !addingNote && (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">
                  <p className="text-2xl mb-2">📝</p>
                  Belum ada catatan. Tambahkan catatan pertama.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
