"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      toast.error("Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },               // passed to raw_user_meta_data → picked up by DB trigger
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Akun dibuat! Cek email untuk verifikasi, lalu login.");
    router.push("/login?registered=1");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white border rounded-lg p-8 shadow-sm">
        <div className="text-center mb-6">
          <span className="font-bold text-xl tracking-tight">WA Tools</span>
          <h1 className="text-lg font-semibold mt-2 mb-1">Buat Akun Gratis</h1>
          <p className="text-sm text-gray-500">Coba semua fitur Pro gratis selama 30 hari — tidak perlu kartu kredit</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nama bisnis / nama Anda"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="email@contoh.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Min. 6 karakter"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Membuat akun..." : "Mulai Trial 30 Hari →"}
          </button>
        </form>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-400">
          {["✓ Semua fitur Pro", "✓ Tanpa kartu kredit", "✓ Batalkan kapan saja"].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-green-600 font-medium hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
