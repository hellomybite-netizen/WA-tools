import Link from "next/link";

export const metadata = { title: "Kebijakan Privasi — WA Tools" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-6 py-4">
        <Link href="/" className="font-bold text-lg tracking-tight">WA Tools</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 prose prose-gray">
        <h1 className="text-2xl font-bold mb-2">Kebijakan Privasi</h1>
        <p className="text-sm text-gray-400 mb-8">Terakhir diperbarui: 28 Juni 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">1. Data yang Kami Kumpulkan</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">Saat Anda menggunakan WA Tools, kami mengumpulkan data berikut:</p>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li><strong>Data akun:</strong> alamat email dan password (dienkripsi) saat Anda mendaftar.</li>
            <li><strong>Data link & rotator:</strong> nomor WhatsApp, teks pesan, dan parameter UTM yang Anda masukkan di dashboard.</li>
            <li><strong>Data analitik klik:</strong> waktu klik, sumber referral (UTM), dan perangkat pengunjung yang mengklik link Anda.</li>
            <li><strong>Data konversi:</strong> nilai transaksi dan mata uang yang dicatat oleh CS Anda melalui fitur Conversion Tracking.</li>
            <li><strong>Data CRM:</strong> nama, nomor telepon, dan catatan kontak yang Anda masukkan secara manual.</li>
          </ul>
          <p className="text-sm text-gray-500 mt-3 bg-gray-50 rounded p-3">
            ⚠️ <strong>WA Tools tidak membaca, menyimpan, atau memiliki akses ke isi percakapan WhatsApp Anda.</strong> Kami hanya melacak klik pada link redirect sebelum pengguna diarahkan ke WA.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">2. Bagaimana Data Digunakan</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Menampilkan laporan analytics dan ROAS di dashboard Anda.</li>
            <li>Mengirim event konversi ke Meta Pixel / Meta CAPI atas nama akun iklan Anda.</li>
            <li>Mendistribusikan chat ke CS yang tepat melalui fitur Chat Rotator.</li>
            <li>Mengirim notifikasi dan laporan yang Anda aktifkan.</li>
            <li>Meningkatkan kualitas dan keamanan layanan WA Tools.</li>
          </ul>
          <p className="text-sm text-gray-600 mt-3">Kami <strong>tidak menjual data Anda</strong> ke pihak ketiga manapun.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">3. Penyimpanan & Keamanan Data</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Data disimpan di server Supabase (PostgreSQL) dengan enkripsi at-rest.</li>
            <li>Koneksi ke server menggunakan HTTPS/TLS.</li>
            <li>Password tidak pernah disimpan dalam bentuk plain text.</li>
            <li>Akses ke data dibatasi oleh Row Level Security (RLS) — Anda hanya bisa melihat data akun Anda sendiri.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">4. Cookie & Tracking</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            WA Tools menggunakan cookie sesi untuk mempertahankan status login Anda. Kami tidak menggunakan cookie iklan pihak ketiga. Link redirect yang Anda buat dapat membawa parameter UTM yang membantu Anda (bukan kami) melacak performa kampanye di Meta Ads.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">5. Hak Pengguna</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li><strong>Akses:</strong> Anda dapat melihat semua data Anda di dashboard kapan saja.</li>
            <li><strong>Koreksi:</strong> Anda dapat mengubah data akun dan konten link kapan saja.</li>
            <li><strong>Penghapusan:</strong> Hubungi kami untuk menghapus akun dan seluruh data Anda secara permanen.</li>
            <li><strong>Ekspor:</strong> Pengguna Pro dan Agency dapat mengekspor data analytics dalam format Excel/PDF.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">6. Perubahan Kebijakan</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Jika kami mengubah kebijakan privasi ini secara material, kami akan mengirim notifikasi ke email terdaftar Anda minimal 7 hari sebelum perubahan berlaku.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">7. Kontak</h2>
          <p className="text-sm text-gray-600">
            Pertanyaan seputar privasi dapat dikirim ke: <a href="mailto:privacy@watools.id" className="text-green-600 hover:underline">privacy@watools.id</a>
          </p>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600">← Kembali ke Beranda</Link>
        <span className="mx-3">·</span>
        <Link href="/terms" className="hover:text-gray-600">Syarat Layanan</Link>
      </footer>
    </div>
  );
}
