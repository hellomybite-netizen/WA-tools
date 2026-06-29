"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface BioButton {
  id: string;
  label: string;
  phone: string;
  color: string;
}

interface BioLink {
  username: string;
  title: string;
  subtitle: string;
  buttons: BioButton[];
}

const DEFAULT: BioLink = { username: "", title: "", subtitle: "", buttons: [] };

export default function BioLinkPage() {
  const [bio, setBio]         = useState<BioLink>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wa-tools-zeta.vercel.app";
  const bioUrl = bio.username ? `${appUrl}/b/${bio.username}` : "";

  const load = useCallback(async () => {
    const res = await fetch("/api/bio-link");
    if (res.ok) {
      const { bioLink } = await res.json();
      if (bioLink) setBio({ username: bioLink.username, title: bioLink.title ?? "", subtitle: bioLink.subtitle ?? "", buttons: bioLink.buttons ?? [] });
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!bio.username) { toast.error("Username wajib diisi"); return; }
    setSaving(true);
    const res = await fetch("/api/bio-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bio),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error ?? "Gagal menyimpan");
    else { toast.success("Bio Link disimpan!"); setBio({ username: data.bioLink.username, title: data.bioLink.title ?? "", subtitle: data.bioLink.subtitle ?? "", buttons: data.bioLink.buttons ?? [] }); }
    setSaving(false);
  }

  async function addButton(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel || !newPhone) return;
    const updated = { ...bio, buttons: [...bio.buttons, { id: Date.now().toString(), label: newLabel, phone: newPhone, color: "#16a34a" }] };
    setBio(updated);
    setNewLabel(""); setNewPhone("");
    if (bio.username) {
      await fetch("/api/bio-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      toast.success("Tombol ditambahkan");
    } else {
      toast.success("Tombol ditambahkan — simpan untuk menyimpan ke database");
    }
  }

  async function removeButton(id: string) {
    const updated = { ...bio, buttons: bio.buttons.filter(b => b.id !== id) };
    setBio(updated);
    if (bio.username) {
      await fetch("/api/bio-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      toast.success("Tombol dihapus");
    }
  }

  if (loading) return <div className="py-16 text-center text-gray-400 text-sm">Memuat...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Bio Link</h1>
      <p className="text-gray-500 text-sm mb-8">Buat halaman profil publik dengan tombol WA</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <form onSubmit={handleSave} className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="font-semibold">Pengaturan Halaman</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <div className="flex items-center border rounded overflow-hidden">
                <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r">/b/</span>
                <input
                  value={bio.username}
                  onChange={e => setBio(b => ({ ...b, username: e.target.value.replace(/[^a-z0-9-]/g, "") }))}
                  className="flex-1 px-3 py-2 text-sm focus:outline-none"
                  placeholder="username"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama / Judul</label>
              <input value={bio.title} onChange={e => setBio(b => ({ ...b, title: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nama toko Anda" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deskripsi</label>
              <textarea value={bio.subtitle} onChange={e => setBio(b => ({ ...b, subtitle: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={2} placeholder="Deskripsi singkat" />
            </div>
            <button type="submit" disabled={saving}
              className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-3">Tambah Tombol WA</h2>
            <form onSubmit={addButton} className="space-y-3">
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Label tombol (contoh: CS 1)" required />
              <input value={newPhone} onChange={e => setNewPhone(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nomor WA tujuan (628xxx)" required />
              <button type="submit"
                className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors">
                Tambah Tombol
              </button>
            </form>
          </div>

          {bioUrl && (
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Link Publik</span>
                <button onClick={() => { navigator.clipboard.writeText(bioUrl); toast.success("Disalin!"); }}
                  className="text-xs text-green-600 hover:underline">Salin</button>
              </div>
              <a href={bioUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline break-all">{bioUrl}</a>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4 text-sm text-gray-500 uppercase tracking-wide">Preview</h2>
          <div className="max-w-xs mx-auto bg-gray-50 rounded-xl p-6 border">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">🏪</div>
              <h3 className="font-bold text-lg text-gray-900">{bio.title || "Nama Toko"}</h3>
              {bio.subtitle && <p className="text-sm text-gray-500 mt-1">{bio.subtitle}</p>}
            </div>
            <div className="space-y-3">
              {bio.buttons.map((btn) => (
                <div key={btn.id} className="flex items-center gap-2">
                  <a href={`https://wa.me/${btn.phone}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 block text-center py-3 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: btn.color }}>
                    {btn.label}
                  </a>
                  <button onClick={() => removeButton(btn.id)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                </div>
              ))}
              {bio.buttons.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">Tambah tombol WA di atas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
