"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const supabase = createClient();
  const router   = useRouter();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [email, setEmail]       = useState("");
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [bizName, setBizName]   = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [savingPw, setSavingPw]       = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setEmail(user.email ?? "");

      // Load profile from user_profiles table
      const { data } = await supabase
        .from("user_profiles")
        .select("name, phone, business_name")
        .eq("id", user.id)
        .single();

      if (data) {
        setName(data.name ?? "");
        setPhone((data as any).phone ?? "");
        setBizName((data as any).business_name ?? "");
      }
      setLoading(false);
    }
    load();
  }, []); // eslint-disable-line

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_profiles")
      .update({ name, phone, business_name: bizName } as never)
      .eq("id", user.id);

    if (error) toast.error("Gagal menyimpan: " + error.message);
    else toast.success("Profil disimpan!");
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPw) { toast.error("Password tidak cocok"); return; }
    if (newPassword.length < 6) { toast.error("Password minimal 6 karakter"); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error("Gagal ubah password: " + error.message);
    else { toast.success("Password berhasil diubah!"); setNewPassword(""); setConfirmPw(""); }
    setSavingPw(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <div className="py-16 text-center text-gray-400 text-sm">Memuat profil...</div>;

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Profil Saya</h1>
          <p className="text-gray-500 text-sm">Kelola informasi akun dan bisnis Anda</p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium">
          Keluar
        </button>
      </div>

      <div className="space-y-5">
        {/* Info Akun */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Informasi Akun & Bisnis</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input value={email} readOnly
                className="w-full border rounded px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nama Anda" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Bisnis</label>
              <input value={bizName} onChange={e => setBizName(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nama toko / brand Anda" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nomor HP / WhatsApp</label>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="628xxxxxxxxxx" />
            </div>
            <button type="submit" disabled={saving}
              className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
              {saving ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </form>
        </div>

        {/* Ganti Password */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Ganti Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Password Baru</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Minimal 6 karakter" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Konfirmasi Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ulangi password baru" />
            </div>
            <button type="submit" disabled={savingPw}
              className="w-full border border-gray-300 py-2 rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors">
              {savingPw ? "Mengubah..." : "Ubah Password"}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-5">
          <h2 className="font-semibold text-red-700 mb-1">Keluar dari Akun</h2>
          <p className="text-sm text-red-600 mb-3">Anda akan diarahkan ke halaman login.</p>
          <button onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
