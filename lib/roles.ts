export type UserRole = "admin" | "advertiser" | "cs";

export const ROLES = {
  admin: {
    label: "Admin",
    description: "Akses penuh — kelola user, semua fitur, dan pengaturan",
    color: "bg-red-100 text-red-700",
    badge: "bg-red-500",
  },
  advertiser: {
    label: "Advertiser",
    description: "Kelola iklan, analytics, URL generator, dan konversi",
    color: "bg-blue-100 text-blue-700",
    badge: "bg-blue-500",
  },
  cs: {
    label: "CS",
    description: "Tandai konversi dan lihat antrian chat masuk",
    color: "bg-green-100 text-green-700",
    badge: "bg-green-500",
  },
} as const;

// Halaman yang diizinkan per role
export const ROLE_NAV: Record<UserRole, { href: string; label: string; icon: string }[]> = {
  admin: [
    { href: "/dashboard", label: "Overview", icon: "▦" },
    { href: "/dashboard/admin/users", label: "Kelola User", icon: "👥" },
    { href: "/dashboard/url-generator", label: "URL Generator", icon: "🔗" },
    { href: "/dashboard/chat-rotator", label: "Chat Rotator", icon: "🔄" },
    { href: "/dashboard/bio-link", label: "Bio Link", icon: "👤" },
    { href: "/dashboard/conversions", label: "Konversi", icon: "💰" },
    { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
    { href: "/dashboard/wallet", label: "Wallet WA API", icon: "👛" },
    { href: "/dashboard/settings", label: "Pixel Settings", icon: "⚙️" },
  ],
  advertiser: [
    { href: "/dashboard", label: "Overview", icon: "▦" },
    { href: "/dashboard/url-generator", label: "URL Generator", icon: "🔗" },
    { href: "/dashboard/chat-rotator", label: "Chat Rotator", icon: "🔄" },
    { href: "/dashboard/bio-link", label: "Bio Link", icon: "👤" },
    { href: "/dashboard/conversions", label: "Konversi", icon: "💰" },
    { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
    { href: "/dashboard/settings", label: "Pixel Settings", icon: "⚙️" },
  ],
  cs: [
    { href: "/dashboard/cs", label: "Antrian Chat", icon: "💬" },
    { href: "/dashboard/conversions", label: "Tandai Konversi", icon: "💰" },
  ],
};

export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/dashboard",
  advertiser: "/dashboard",
  cs: "/dashboard/cs",
};

// Halaman yang TIDAK boleh diakses role tertentu
export const RESTRICTED_PATHS: Record<string, UserRole[]> = {
  "/dashboard/admin/users": ["admin"],
  "/dashboard/wallet": ["admin"],
  "/dashboard/settings": ["admin", "advertiser"],
  "/dashboard/url-generator": ["admin", "advertiser"],
  "/dashboard/chat-rotator": ["admin", "advertiser"],
  "/dashboard/bio-link": ["admin", "advertiser"],
  "/dashboard/analytics": ["admin", "advertiser"],
  "/dashboard": ["admin", "advertiser"],
};
