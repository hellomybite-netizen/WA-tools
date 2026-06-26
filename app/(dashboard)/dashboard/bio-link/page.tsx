"use client";
import { useState } from "react";
import { toast } from "sonner";

interface BioButton {
  id: string;
  label: string;
  phone: string;
  color: string;
}

export default function BioLinkPage() {
  const [username, setUsername] = useState("tokosaya");
  const [title, setTitle] = useState("Toko Saya");
  const [subtitle, setSubtitle] = useState("Hubungi kami untuk info produk dan pemesanan");
  const [buttons, setButtons] = useState<BioButton[]>([
    { id: "1", label: "Hubungi CS 1", phone: "628111111111", color: "#16a34a" },
    { id: "2", label: "Hubungi CS 2", phone: "628222222222", color: "#15803d" },
  ]);
  const [newLabel, setNewLabel] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const bioUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/b/${username}`;

  function addButton(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel || !newPhone) return;
    setButtons((prev) => [
      ...prev,
      { id: Date.now().toString(), label: newLabel, phone: newPhone, color: "#16a34a" },
    ]);
    setNewLabel("");
    setNewPhone("");
    toast.success("Tombol ditambahkan");
  }

  function removeButton(id: string) {
    setButtons((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Bio Link</h1>
      <p className="text-gray-500 text-sm mb-8">Buat halaman profil publik dengan tombol WA</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Pengaturan Halaman</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <div className="flex items-center border rounded overflow-hidden">
                  <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r">/b/</span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9-]/g, ""))}
                    className="flex-1 px-3 py-2 text-sm focus:outline-none"
                    placeholder="username"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nama / Judul</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nama toko Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={2}
                  placeholder="Deskripsi singkat"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-3">Tambah Tombol WA</h2>
            <form onSubmit={addButton} className="space-y-3">
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Label tombol"
                required
              />
              <input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nomor WA tujuan (628xxx)"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Tambah Tombol
              </button>
            </form>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Link Publik</span>
              <button
                onClick={() => { navigator.clipboard.writeText(bioUrl); toast.success("Disalin!"); }}
                className="text-xs text-green-600 hover:underline"
              >
                Salin
              </button>
            </div>
            <p className="text-sm text-gray-500 break-all">{bioUrl}</p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4 text-sm text-gray-500 uppercase tracking-wide">Preview</h2>
          <div className="max-w-xs mx-auto bg-gray-50 rounded-xl p-6 border">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">🏪</div>
              <h3 className="font-bold text-lg text-gray-900">{title || "Nama Toko"}</h3>
              <p className="text-sm text-gray-500 mt-1">{subtitle || "Deskripsi singkat"}</p>
            </div>
            <div className="space-y-3">
              {buttons.map((btn) => (
                <div key={btn.id} className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${btn.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 block text-center py-3 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: btn.color }}
                  >
                    {btn.label}
                  </a>
                  <button
                    onClick={() => removeButton(btn.id)}
                    className="text-red-400 hover:text-red-600 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {buttons.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">Tambah tombol WA di atas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
