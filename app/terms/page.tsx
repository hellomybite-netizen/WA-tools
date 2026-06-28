import Link from "next/link";

export const metadata = { title: "Syarat Layanan — WA Tools" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-6 py-4">
        <Link href="/" className="font-bold text-lg tracking-tight">WA Tools</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-2">Syarat Layanan</h1>
        <p className="text-sm text-gray-400 mb-8">Terakhir diperbarui: 28 Juni 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">1. Penerimaan Syarat</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Dengan mendaftar dan menggunakan WA Tools ("Layanan"), Anda menyetujui syarat dan ketentuan ini. Jika Anda tidak setuju, harap hentikan penggunaan layanan.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">2. Deskripsi Layanan</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            WA Tools menyediakan alat pemasaran berbasis WhatsApp yang mencakup: pembuatan link dengan UTM tracking, Chat Rotator, Bio Link, Analytics, CRM, dan integrasi Meta Conversion API. Layanan tersedia dalam paket Starter, Pro, dan Agency.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">3. Akun Pengguna</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Anda bertanggung jawab menjaga kerahasiaan password akun Anda.</li>
            <li>Satu akun hanya boleh digunakan oleh satu entitas bisnis (kecuali paket Agency dengan fitur multi-workspace).</li>
            <li>Anda harus memberikan informasi akun yang akurat dan terkini.</li>
            <li>WA Tools berhak menangguhkan akun yang melanggar syarat ini.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">4. Penggunaan yang Dilarang</h2>
          <p className="text-sm text-gray-600 mb-3">Anda dilarang menggunakan WA Tools untuk:</p>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Mengirim pesan spam atau promosi yang tidak diminta secara massal.</li>
            <li>Menipu, menyesatkan, atau merugikan pengguna lain maupun konsumen Anda.</li>
            <li>Melanggar kebijakan WhatsApp, Meta, atau regulasi perlindungan data yang berlaku.</li>
            <li>Mendistribusikan konten ilegal, SARA, pornografi, atau konten yang melanggar hak cipta.</li>
            <li>Melakukan reverse engineering atau upaya mengakses sistem secara tidak sah.</li>
            <li>Menggunakan layanan untuk tujuan penipuan atau kejahatan siber.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">5. Pembayaran & Langganan</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Harga langganan tertera di halaman pricing dan dapat berubah dengan pemberitahuan 30 hari.</li>
            <li>Pembayaran diproses melalui Midtrans (QRIS, transfer bank, e-wallet).</li>
            <li>Langganan diperpanjang otomatis setiap bulan kecuali dibatalkan.</li>
            <li>Pembatalan dapat dilakukan kapan saja; akses tetap aktif hingga akhir periode billing.</li>
            <li>Garansi uang kembali 30 hari berlaku untuk pembelian pertama, tidak berlaku untuk perpanjangan.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">6. Trial Gratis</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            WA Tools menawarkan trial gratis 7 hari dengan akses penuh ke semua fitur paket yang dipilih. Tidak diperlukan kartu kredit untuk memulai trial. Setelah 7 hari, akun otomatis beralih ke mode terbatas kecuali Anda memilih paket berbayar.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">7. Hak Kekayaan Intelektual</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            WA Tools dan seluruh aset platform (logo, kode, desain, konten) adalah milik WA Tools. Anda memiliki hak menggunakan layanan sesuai paket yang dipilih, namun tidak memiliki hak untuk menyalin, memodifikasi, atau mendistribusikan platform tanpa izin tertulis.
          </p>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            Data yang Anda buat di dalam platform (link, kontak CRM, laporan) adalah milik Anda. WA Tools tidak mengklaim kepemilikan atas data bisnis Anda.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">8. Batasan Tanggung Jawab</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            WA Tools tidak bertanggung jawab atas: kehilangan pendapatan akibat downtime platform, perubahan kebijakan WhatsApp/Meta yang mempengaruhi fitur, atau kesalahan data yang disebabkan oleh input pengguna. Total kewajiban kami tidak melebihi biaya langganan yang Anda bayarkan dalam 1 bulan terakhir.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">9. Ketersediaan Layanan (SLA)</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            WA Tools menargetkan uptime 99.5% per bulan untuk semua paket. Paket Agency mendapat SLA uptime 99.9%. Pemeliharaan terjadwal akan diinformasikan minimal 24 jam sebelumnya. Status layanan dapat dipantau di halaman status kami.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">10. Penghentian Layanan</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            WA Tools berhak menghentikan akun yang melanggar syarat ini tanpa pengembalian dana. Anda dapat menghapus akun kapan saja melalui dashboard atau menghubungi support. Setelah penghapusan, data Anda dihapus permanen dalam 30 hari.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">11. Hukum yang Berlaku</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Syarat ini diatur oleh hukum Republik Indonesia. Sengketa diselesaikan melalui musyawarah mufakat; jika gagal, melalui Pengadilan Negeri Jakarta Selatan.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">12. Kontak</h2>
          <p className="text-sm text-gray-600">
            Pertanyaan seputar syarat layanan: <a href="mailto:legal@watools.id" className="text-green-600 hover:underline">legal@watools.id</a>
          </p>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600">← Kembali ke Beranda</Link>
        <span className="mx-3">·</span>
        <Link href="/privacy" className="hover:text-gray-600">Kebijakan Privasi</Link>
      </footer>
    </div>
  );
}
