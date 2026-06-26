import Link from "next/link";
import { createServerSupabaseClient, isSupabaseConfiguredServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "▦" },
  { href: "/dashboard/url-generator", label: "URL Generator", icon: "🔗" },
  { href: "/dashboard/chat-rotator", label: "Chat Rotator", icon: "🔄" },
  { href: "/dashboard/bio-link", label: "Bio Link", icon: "👤" },
  { href: "/dashboard/conversions", label: "Konversi", icon: "💰" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  { href: "/dashboard/wallet", label: "Wallet WA API", icon: "👛" },
  { href: "/dashboard/settings", label: "Pixel Settings", icon: "⚙️" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user = null;
  if (isSupabaseConfiguredServer()) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (!user) redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="px-5 py-4 border-b">
          <span className="font-bold text-base tracking-tight">WA Tools</span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 text-sm rounded hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t">
          <p className="text-xs text-gray-400 mb-2 truncate">{user?.email ?? "demo@watools.id"}</p>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
