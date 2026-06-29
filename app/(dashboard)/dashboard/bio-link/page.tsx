"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";

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
  avatar_url: string;
}

const DEFAULT: BioLink = { username: "", title: "", subtitle: "", buttons: [], avatar_url: "" };

export default function BioLinkPage() {
  const [bio, setBio]             = useState<BioLink>(DEFAULT);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newLabel, setNewLabel]   = useState("");
  const [newPhone, setNewPhone]   = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wa-tools-zeta.vercel.app";
  const bioUrl = bio.username ? `${appUrl}/b/${bio.username}` : "";

  const load = useCallback(async () => {
    const res = await fetch("/api/bio-link");
    if (res.ok) {
      const { bioLink } = await res.json();
      if (bioLink) setBio({ username: bioLink.username, title: bioLink.title ?? "", subtitle: bioLink.subtitle ?? "", buttons: bioLink.buttons ?? [], avatar_url: bioLink.avatar_url ?? "" });
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
    else { toast.success("Bio Link disimpan!"); setBio({ username: data.bioLink.username, title: data.bioLink.title ?? "", subtitle: data.bioLink.subtitle ?? "", buttons: data.bioLink.buttons ?? [], avatar_url: data.bioLink.avatar_url ?? "" }); }
    setSaving(false);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Ukuran file maksimal 2MB"); return; }

    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Tidak terautentikasi"); setUploading(false); return; }

    const ext  = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("bio-avatars").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Upload gagal: " + uploadError.message); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("bio-avatars").getPublicUrl(path);
    // Append cache-bust so browser shows new image immediately
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    const updated = { ...bio, avatar_url: avatarUrl };
    setBio(updated);
    if (bio.username) {
      await fetch("/api/bio-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    }
    toast.success("Foto profil diperbarui!");
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
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
          {/* Avatar upload */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Foto Profil</h2>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-green-100 flex items-center justify-center flex-shrink-0 border-2 border-green-200">
                {bio.avatar_url
                  ? <img src={bio.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-3xl">🏪</span>}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {uploading ? "Mengupload..." : "Ganti Foto"}
                </button>
                <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, atau WebP. Maks 2MB.</p>
              </div>
            </div>
          </div>

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
              <div className="w-20 h-20 rounded-full overflow-hidden bg-green-100 flex items-center justify-center text-3xl mx-auto mb-3 border-2 border-green-200">
                {bio.avatar_url
                  ? <img src={bio.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  : <span>🏪</span>}
              </div>
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
