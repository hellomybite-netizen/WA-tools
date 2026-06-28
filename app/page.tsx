import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">WA</div>
            <span className="font-bold text-base tracking-tight">WA Tools</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
            <a href="#masalah" className="hover:text-gray-900 transition-colors">Masalah</a>
            <a href="#fitur" className="hover:text-gray-900 transition-colors">Fitur</a>
            <a href="#harga" className="hover:text-gray-900 transition-colors">Harga</a>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="text-sm px-4 py-2 border rounded hover:bg-gray-50 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="text-sm px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium">
              Coba Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Dipercaya 500+ pemilik bisnis di Indonesia
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5">
          Iklan Anda Ramai Klik,<br />
          <span className="text-green-600">Tapi Penjualan Tetap Sepi?</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          WA Tools melacak setiap chat dari iklan Anda, merotasi CS secara otomatis, dan menampilkan analytics real-time — sehingga Anda tahu persis mana iklan yang benar-benar menghasilkan.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="w-full sm:w-auto px-8 py-3.5 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors text-base">
            Mulai 7 Hari Gratis →
          </Link>
          <span className="text-sm text-gray-400">Tanpa kartu kredit. Batalkan kapan saja.</span>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <section className="bg-gray-50 border-y py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { number: "500+", label: "Bisnis Aktif" },
              { number: "2.4 Juta", label: "Link Diklik / Bulan" },
              { number: "68%", label: "Rata-rata Konversi" },
              { number: "4.9 / 5", label: "Rating Pengguna" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-gray-900">{s.number}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section id="masalah" className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-red-500 uppercase tracking-widest mb-2">Kenali Masalahnya</p>
          <h2 className="text-3xl font-bold">Apakah Ini Terasa Familiar?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: "😩", title: "Budget iklan habis, chat sepi", desc: "Sudah keluar jutaan untuk Meta Ads & TikTok Ads, tapi tidak tahu channel mana yang benar-benar menghasilkan chat masuk." },
            { icon: "🔀", title: "Chat masuk tidak merata ke CS", desc: "CS pertama kewalahan ratusan chat, CS kedua malah nganggur. Pelanggan lama menunggu dan akhirnya kabur ke kompetitor." },
            { icon: "📉", title: "Tidak bisa buktikan ROI ke bos", desc: "Laporan iklan hanya menunjukkan 'klik', bukan penjualan nyata. Susah mempertahankan budget iklan ke manajemen." },
            { icon: "🤷", title: "Link WA tersebar tidak terkontrol", desc: "Ada 10 versi link WA di berbagai platform — Instagram bio, TikTok, website, brosur — tanpa ada yang memantau mana yang aktif dan efektif." },
          ].map((p) => (
            <div key={p.title} className="flex gap-4 p-5 border border-red-100 bg-red-50/40 rounded-lg">
              <div className="text-2xl flex-shrink-0">{p.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 p-5 bg-gray-900 text-white rounded-lg text-center">
          <p className="text-base font-medium">Rata-rata bisnis kehilangan <span className="text-green-400 font-bold">40% budget iklan</span> karena tidak tahu channel mana yang konversi.</p>
          <p className="text-sm text-gray-400 mt-1">Sumber: riset internal WA Tools, 2024</p>
        </div>
      </section>

      {/* SOLUTION / FEATURES */}
      <section id="fitur" className="bg-gray-50 border-y py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-2">Solusinya</p>
            <h2 className="text-3xl font-bold">Satu Dashboard untuk Semua<br />WhatsApp Marketing Anda</h2>
          </div>
          <div className="space-y-6">
            {[
              {
                icon: "🔗",
                label: "URL Generator + UTM Tracking",
                problem: "Dulu: Tidak tahu iklan mana yang menghasilkan chat",
                solution: "Sekarang: Setiap link WA membawa data UTM. Anda tahu persis chat ini dari Instagram Story, TikTok Ads, atau Google — hingga campaign-nya.",
                highlight: "Ketahui ROI iklan secara akurat",
              },
              {
                icon: "🔄",
                label: "Chat Rotator Otomatis",
                problem: "Dulu: CS kewalahan karena chat tidak terbagi rata",
                solution: "Sekarang: Satu link WA publik, chat terdistribusi otomatis ke semua CS secara bergiliran. Tidak ada yang overload, tidak ada yang nganggur.",
                highlight: "Respons lebih cepat, pelanggan tidak kabur",
              },
              {
                icon: "👤",
                label: "Halaman Bio Link Profesional",
                problem: "Dulu: Bio Instagram hanya bisa satu link, repot ganti-ganti",
                solution: "Sekarang: Satu halaman bio dengan banyak tombol WA, bisa untuk produk berbeda atau CS berbeda. Terlihat profesional, mudah diperbarui kapan saja.",
                highlight: "Tingkatkan kepercayaan calon pelanggan",
              },
              {
                icon: "📊",
                label: "Analytics Real-Time",
                problem: "Dulu: Laporan cuma bisa lihat total klik tanpa detail",
                solution: "Sekarang: Dashboard menampilkan klik per channel, per kampanye, per CS, per hari — semua real-time. Laporan ke manajemen jadi mudah dan meyakinkan.",
                highlight: "Ambil keputusan berbasis data, bukan tebakan",
              },
            ].map((f, i) => (
              <div key={f.label} className="bg-white border rounded-lg overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{f.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">0{i+1}</span>
                        <h3 className="font-bold text-gray-900">{f.label}</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex gap-2 p-3 bg-red-50 rounded border border-red-100">
                          <span className="text-red-400 flex-shrink-0">✗</span>
                          <p className="text-gray-600">{f.problem}</p>
                        </div>
                        <div className="flex gap-2 p-3 bg-green-50 rounded border border-green-100">
                          <span className="text-green-500 flex-shrink-0">✓</span>
                          <p className="text-gray-600">{f.solution}</p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-green-700 mt-3 bg-green-50 inline-block px-2 py-1 rounded">→ {f.highlight}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">Kata Mereka</p>
          <h2 className="text-3xl font-bold">Bisnis yang Sudah Merasakan Hasilnya</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              name: "Rina Kusuma",
              role: "Owner Skincare Brand, Jakarta",
              avatar: "RK",
              quote: "Sebelum pakai WA Tools, saya buang 3 juta/bulan ke TikTok Ads tanpa tahu hasilnya. Sekarang saya tahu persis iklan mana yang menghasilkan — dan sudah cut 2 campaign yang ternyata tidak efektif.",
              star: 5,
            },
            {
              name: "Budi Santoso",
              role: "Digital Marketing Manager, Surabaya",
              avatar: "BS",
              quote: "Chat Rotator-nya game changer. Dulu CS pertama selalu ngeluh kelebihan, sekarang semua merata. Response time turun dari 10 menit ke 2 menit rata-rata.",
              star: 5,
            },
            {
              name: "Dewi Hartanti",
              role: "Founder Fashion Store, Bandung",
              avatar: "DH",
              quote: "Bio Link-nya keren banget, terlihat profesional. Customer saya sekarang bisa pilih langsung mau chat produk apa. Konversi naik 40% bulan pertama.",
              star: 5,
            },
          ].map((t) => (
            <div key={t.name} className="border rounded-lg p-5 flex flex-col gap-4">
              <div className="flex text-yellow-400 text-sm">{"★".repeat(t.star)}</div>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center flex-shrink-0">{t.avatar}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="harga" className="bg-gray-50 border-y py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-2">Harga Transparan</p>
            <h2 className="text-3xl font-bold">Investasi Lebih Kecil dari<br />1 Hari Budget Iklan</h2>
            <p className="text-gray-500 mt-3 text-base">Kalau iklan Anda 1 juta/hari, WA Tools balik modal dalam hitungan jam.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">

            {/* Starter */}
            <div className="bg-white border rounded-lg p-6">
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Starter</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">Rp 149.000</span>
                </div>
                <p className="text-gray-400 text-sm mt-0.5">/ bulan · Setara Rp 5.000/hari</p>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-6">
                {[
                  "10 link WA + UTM tracking",
                  "2 Chat Rotator (maks. 5 CS)",
                  "1 halaman Bio Link",
                  "Analytics 30 hari",
                  "Conversion tracking (manual CS)",
                  "Meta CAPI — event Lead & Purchase",
                  "Support via email",
                ].map((f) => (
                  <li key={f} className="flex gap-2 items-start"><span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>{f}</li>
                ))}
                {[
                  "Watermark WA Tools di Bio Link",
                  "Analytics multi-currency",
                  "CRM (kontak & pipeline)",
                  "Wallet WA API",
                ].map((f) => (
                  <li key={f} className="flex gap-2 items-start text-gray-300"><span className="flex-shrink-0 mt-0.5">✗</span>{f}</li>
                ))}
              </ul>
              <Link href="/register" className="block w-full text-center py-2.5 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
                Coba 7 Hari Gratis
              </Link>
            </div>

            {/* Pro — highlighted */}
            <div className="bg-gray-900 text-white rounded-lg p-6 relative shadow-xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">PALING POPULER</span>
              </div>
              <div className="mb-5">
                <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Pro</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">Rp 299.000</span>
                </div>
                <p className="text-gray-400 text-sm mt-0.5">/ bulan · Setara Rp 10.000/hari</p>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-300 mb-6">
                {[
                  "Link WA tidak terbatas",
                  "Chat Rotator tidak terbatas (CS tak terbatas)",
                  "Bio Link tanpa watermark + custom domain",
                  "Analytics multi-currency (IDR, USD, HKD, TWD, MYR)",
                  "Analytics hingga 1 tahun",
                  "Conversion tracking + Meta CAPI otomatis",
                  "CRM — kelola kontak, pipeline & notes",
                  "Wallet WA API (topup saldo untuk broadcast)",
                  "Export laporan Excel/PDF",
                  "Prioritas support via WhatsApp",
                ].map((f) => (
                  <li key={f} className="flex gap-2 items-start"><span className="text-green-400 flex-shrink-0 mt-0.5">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/register" className="block w-full text-center py-2.5 bg-green-500 hover:bg-green-400 text-white rounded text-sm font-semibold transition-colors">
                Mulai 7 Hari Gratis →
              </Link>
              <p className="text-center text-xs text-gray-500 mt-3">Tidak perlu kartu kredit</p>
            </div>

            {/* Agency */}
            <div className="bg-white border rounded-lg p-6">
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Agency</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">Rp 799.000</span>
                </div>
                <p className="text-gray-400 text-sm mt-0.5">/ bulan · Untuk agensi & tim besar</p>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-6">
                {[
                  "Semua fitur Pro",
                  "Multi-workspace (kelola banyak klien)",
                  "Akses API untuk integrasi custom",
                  "Sub-akun untuk tim / klien",
                  "Laporan per klien otomatis",
                  "Dedicated support + onboarding",
                  "SLA uptime 99.9%",
                ].map((f) => (
                  <li key={f} className="flex gap-2 items-start"><span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/register" className="block w-full text-center py-2.5 bg-gray-900 text-white rounded text-sm font-semibold hover:bg-gray-700 transition-colors">
                Hubungi Kami →
              </Link>
            </div>
          </div>

          {/* Comparison note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Semua paket termasuk 7 hari trial gratis · Batalkan kapan saja · Pembayaran via QRIS, Transfer Bank, GoPay, OVO
          </p>

          {/* Guarantee */}
          <div className="mt-6 flex items-start gap-4 p-5 bg-white border rounded-lg">
            <div className="text-2xl flex-shrink-0">🛡️</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Garansi Uang Kembali 30 Hari</p>
              <p className="text-sm text-gray-500 mt-0.5">Jika dalam 30 hari Anda tidak puas dengan hasilnya, kami kembalikan pembayaran penuh — tanpa pertanyaan, tanpa ribet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold">Pertanyaan Umum</h2>
        </div>
        <div className="space-y-4">
          {[
            { q: "Apakah perlu install aplikasi?", a: "Tidak perlu. WA Tools 100% berbasis web, bisa diakses dari browser HP maupun laptop tanpa install apapun." },
            { q: "Apakah aman? Apakah chat saya bisa dibaca?", a: "WA Tools hanya melacak klik pada link, bukan isi percakapan WhatsApp. Privasi chat Anda dan pelanggan 100% terlindungi." },
            { q: "Bisa dipakai untuk berapa nomor WA?", a: "Paket Pro mendukung nomor WA tidak terbatas. Anda bisa kelola semua CS, semua produk, dalam satu akun." },
            { q: "Bagaimana cara pembayaran?", a: "Kami menerima transfer bank (BCA, Mandiri, BRI, BNI), QRIS, GoPay, OVO, dan kartu kredit/debit." },
            { q: "Apakah bisa dicoba gratis dulu?", a: "Ya! Anda bisa coba semua fitur selama 7 hari tanpa biaya dan tanpa kartu kredit. Setelah itu baru pilih paket Pro atau tetap di paket gratis." },
          ].map((item) => (
            <div key={item.q} className="border rounded-lg p-4">
              <p className="font-semibold text-gray-900 text-sm">{item.q}</p>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gray-900 text-white py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Hentikan Pemborosan Budget Iklan<br />Mulai Hari Ini</h2>
          <p className="text-gray-400 mb-8 text-base">
            Setiap hari tanpa WA Tools adalah hari Anda membuang uang iklan tanpa tahu hasilnya. Bergabunglah dengan 500+ bisnis yang sudah mendapat hasil nyata.
          </p>
          <Link href="/register" className="inline-block px-10 py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded text-base transition-colors">
            Mulai 7 Hari Gratis — Tanpa Kartu Kredit
          </Link>
          <p className="text-gray-500 text-sm mt-4">Setup 5 menit. Langsung bisa dipakai.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">WA</div>
            <span className="font-semibold text-gray-600">WA Tools</span>
          </div>
          <p>© 2025 WA Tools. Semua hak dilindungi.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-600 transition-colors">Privasi</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Syarat Layanan</a>
            <Link href="/login" className="hover:text-gray-600 transition-colors">Masuk</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
