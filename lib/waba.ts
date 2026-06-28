export interface WABAConfig {
  phoneNumberId:   string;
  accessToken:     string;
  wabaId:          string;
  webhookVerifyToken: string;
  businessName:    string;
  phoneNumber:     string;
  connected:       boolean;
}

export type ConversationCategory = "marketing" | "utility" | "authentication" | "service";
export type MessageSource       = "ad_link" | "organic" | "unknown";
export type ConversationStatus  = "open" | "replied" | "closed";

export interface WABAConversation {
  id:            string;
  contactName:   string;
  contactPhone:  string;
  lastMessage:   string;
  lastMessageAt: string;
  status:        ConversationStatus;
  source:        MessageSource;
  utmSource?:    string;
  utmCampaign?:  string;
  category:      ConversationCategory;
  /** Conversation window open until (24h from last customer message) */
  windowExpiresAt: string;
  /** Rp deducted so far for this conversation */
  costIDR:       number;
  assignedCS?:   string;
  unread:        number;
}

export interface WABAMessage {
  id:        string;
  convId:    string;
  from:      "customer" | "business";
  text:      string;
  timestamp: string;
  status?:   "sent" | "delivered" | "read";
}

/** Rp per conversation category (pass-through Meta cost approximation) */
export const CONVERSATION_COSTS: Record<ConversationCategory, number> = {
  marketing:      650,
  utility:        320,
  authentication: 320,
  service:          0, // free — user-initiated within 24h window
};

export const SOURCE_LABELS: Record<MessageSource, { label: string; color: string; icon: string }> = {
  ad_link:  { label: "Dari Iklan",  color: "bg-blue-100 text-blue-700",   icon: "🎯" },
  organic:  { label: "Organik",     color: "bg-green-100 text-green-700", icon: "🌱" },
  unknown:  { label: "Tidak Diketahui", color: "bg-gray-100 text-gray-500", icon: "❓" },
};

export const STATUS_LABELS: Record<ConversationStatus, { label: string; color: string }> = {
  open:    { label: "Belum Dibalas", color: "bg-orange-100 text-orange-700" },
  replied: { label: "Dibalas",       color: "bg-blue-100 text-blue-700" },
  closed:  { label: "Selesai",       color: "bg-gray-100 text-gray-500" },
};

// Demo data
export const DEMO_WABA_CONFIG: WABAConfig = {
  phoneNumberId:      "123456789012345",
  accessToken:        "EAAxxxx...demo",
  wabaId:             "987654321098765",
  webhookVerifyToken: "watools_webhook_secret",
  businessName:       "Toko Demo WA Tools",
  phoneNumber:        "+62 812-3456-7890",
  connected:          true,
};

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600_000).toISOString();

export const DEMO_CONVERSATIONS: WABAConversation[] = [
  {
    id: "c1", contactName: "Budi Santoso", contactPhone: "628111222333",
    lastMessage: "Kak, masih ada stok warna hitam?",
    lastMessageAt: hoursAgo(0.2), status: "open",
    source: "ad_link", utmSource: "tiktok", utmCampaign: "promo-juli",
    category: "service", windowExpiresAt: hoursAgo(-23.8), costIDR: 0, unread: 2,
  },
  {
    id: "c2", contactName: "Siti Rahayu", contactPhone: "628222333444",
    lastMessage: "Oke kak, saya transfer sekarang ya",
    lastMessageAt: hoursAgo(1.5), status: "replied",
    source: "ad_link", utmSource: "instagram", utmCampaign: "flash-sale",
    category: "service", windowExpiresAt: hoursAgo(-22.5), costIDR: 0, assignedCS: "CS Andi", unread: 0,
  },
  {
    id: "c3", contactName: "Ahmad Fauzi", contactPhone: "628333444555",
    lastMessage: "Dapat nomor dari teman, produknya bagus ya?",
    lastMessageAt: hoursAgo(3), status: "open",
    source: "organic", category: "service",
    windowExpiresAt: hoursAgo(-21), costIDR: 0, unread: 1,
  },
  {
    id: "c4", contactName: "Dewi Lestari", contactPhone: "628444555666",
    lastMessage: "Terima kasih kak, sudah diterima 🙏",
    lastMessageAt: hoursAgo(5), status: "closed",
    source: "ad_link", utmSource: "facebook", utmCampaign: "retargeting",
    category: "service", windowExpiresAt: hoursAgo(-19), costIDR: 0, assignedCS: "CS Budi", unread: 0,
  },
  {
    id: "c5", contactName: "Riko Pratama", contactPhone: "628555666777",
    lastMessage: "Broadcast promo diterima, tertarik nih",
    lastMessageAt: hoursAgo(6), status: "open",
    source: "unknown", category: "marketing",
    windowExpiresAt: hoursAgo(-18), costIDR: 650, unread: 1,
  },
  {
    id: "c6", contactName: "Maya Indah", contactPhone: "628666777888",
    lastMessage: "Halo, saya dari Instagram mau tanya produk",
    lastMessageAt: hoursAgo(8), status: "replied",
    source: "ad_link", utmSource: "instagram", utmCampaign: "bio-link",
    category: "service", windowExpiresAt: hoursAgo(-16), costIDR: 0, assignedCS: "CS Andi", unread: 0,
  },
];

export const DEMO_MESSAGES: Record<string, WABAMessage[]> = {
  c1: [
    { id: "m1", convId: "c1", from: "customer", text: "Halo kak, lihat iklan TikTok", timestamp: hoursAgo(0.5) },
    { id: "m2", convId: "c1", from: "customer", text: "Kak, masih ada stok warna hitam?", timestamp: hoursAgo(0.2) },
  ],
  c3: [
    { id: "m3", convId: "c3", from: "customer", text: "Halo, dapat nomor dari teman Saya", timestamp: hoursAgo(3.2) },
    { id: "m4", convId: "c3", from: "customer", text: "Dapat nomor dari teman, produknya bagus ya?", timestamp: hoursAgo(3) },
  ],
};
