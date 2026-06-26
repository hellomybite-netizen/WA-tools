import Link from "next/link";

const features = [
  { href: "/dashboard/url-generator", icon: "🔗", title: "URL Generator", desc: "Buat WhatsApp link dengan UTM tracking dan pesan pembuka otomatis" },
  { href: "/dashboard/chat-rotator", icon: "🔄", title: "Chat Rotator", desc: "Distribusi chat ke banyak CS secara merata" },
  { href: "/dashboard/bio-link", icon: "👤", title: "Bio Link", desc: "Halaman profil publik dengan tombol WA dan branding" },
  { href: "/dashboard/analytics", icon: "📊", title: "Analytics", desc: "Pantau performa per channel dan kampanye" },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Selamat datang di WA Tools</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="bg-white border rounded-lg p-5 hover:border-green-400 hover:shadow-sm transition-all group"
          >
            <div className="text-2xl mb-3">{f.icon}</div>
            <h2 className="font-semibold text-gray-900 mb-1 group-hover:text-green-700">{f.title}</h2>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
