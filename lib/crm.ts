import { CurrencyCode } from "./currencies";

export type ContactStatus = "lead" | "prospect" | "customer" | "churned";
export type DealStage = "new" | "contacted" | "negotiating" | "won" | "lost";

export const CONTACT_STATUS: Record<ContactStatus, { label: string; color: string }> = {
  lead:     { label: "Lead",      color: "bg-blue-100 text-blue-700" },
  prospect: { label: "Prospek",   color: "bg-yellow-100 text-yellow-700" },
  customer: { label: "Customer",  color: "bg-green-100 text-green-700" },
  churned:  { label: "Churn",     color: "bg-gray-100 text-gray-500" },
};

export const DEAL_STAGES: Record<DealStage, { label: string; color: string; bg: string }> = {
  new:         { label: "Baru",       color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  contacted:   { label: "Dihubungi",  color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  negotiating: { label: "Negosiasi",  color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  won:         { label: "Menang",     color: "text-green-700",  bg: "bg-green-50 border-green-200" },
  lost:        { label: "Kalah",      color: "text-gray-500",   bg: "bg-gray-50 border-gray-200" },
};

export interface ContactNote {
  id: string;
  text: string;
  createdAt: string;
  author: string;
}

export interface ContactDeal {
  id: string;
  title: string;
  value: number;
  currency: CurrencyCode;
  stage: DealStage;
  source: string;
  campaign: string;
  createdAt: string;
  closedAt?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: ContactStatus;
  tags: string[];
  source: string;        // instagram, tiktok, etc.
  campaign: string;
  assignedTo: string;
  totalValue: number;    // sum of won deals in IDR-equivalent
  currency: CurrencyCode;
  deals: ContactDeal[];
  notes: ContactNote[];
  createdAt: string;
  lastContactedAt: string;
}

export const DEMO_CONTACTS: Contact[] = [
  {
    id: "c1", name: "Andi Setiawan",   phone: "628111222333", email: "andi@gmail.com",
    status: "customer", tags: ["VIP", "Repeat"], source: "instagram", campaign: "promo-ramadan",
    assignedTo: "CS Siti", totalValue: 3500000, currency: "IDR",
    createdAt: "2025-06-01", lastContactedAt: "2025-07-01",
    deals: [
      { id: "d1", title: "Paket Premium Juni", value: 1500000, currency: "IDR", stage: "won", source: "instagram", campaign: "promo-juni", createdAt: "2025-06-05", closedAt: "2025-06-07" },
      { id: "d2", title: "Paket Premium Juli", value: 2000000, currency: "IDR", stage: "won", source: "instagram", campaign: "promo-juli", createdAt: "2025-07-01", closedAt: "2025-07-01" },
    ],
    notes: [
      { id: "n1", text: "Customer loyal, suka produk varian A. Selalu bayar tepat waktu.", createdAt: "2025-06-10 10:30", author: "CS Siti" },
      { id: "n2", text: "Minta diskon 5% untuk pembelian berikutnya — sudah disetujui.", createdAt: "2025-07-01 14:20", author: "CS Ahmad" },
    ],
  },
  {
    id: "c2", name: "Budi Wijaya",     phone: "628222333444",
    status: "prospect", tags: ["Hangat"], source: "tiktok", campaign: "fyp-ads",
    assignedTo: "CS Ahmad", totalValue: 480, currency: "HKD",
    createdAt: "2025-06-20", lastContactedAt: "2025-07-01",
    deals: [
      { id: "d3", title: "Konsultasi HK", value: 480, currency: "HKD", stage: "negotiating", source: "tiktok", campaign: "fyp-ads", createdAt: "2025-06-20" },
    ],
    notes: [
      { id: "n3", text: "Tertarik paket agency. Follow up besok pagi.", createdAt: "2025-07-01 11:00", author: "CS Ahmad" },
    ],
  },
  {
    id: "c3", name: "Citra Maharani",  phone: "628333444555",
    status: "customer", tags: ["Taiwan", "Agency"], source: "facebook", campaign: "brand-awareness",
    assignedTo: "CS Dewi", totalValue: 95000, currency: "TWD",
    createdAt: "2025-05-15", lastContactedAt: "2025-06-28",
    deals: [
      { id: "d4", title: "Agency Pack TW", value: 95000, currency: "TWD", stage: "won", source: "facebook", campaign: "brand-awareness", createdAt: "2025-05-15", closedAt: "2025-05-18" },
    ],
    notes: [
      { id: "n4", text: "Client dari Taiwan, komunikasi via WA dalam bahasa Indonesia.", createdAt: "2025-05-16 09:00", author: "CS Dewi" },
    ],
  },
  {
    id: "c4", name: "Dewi Pratiwi",    phone: "628444555666",
    status: "lead", tags: [], source: "instagram", campaign: "promo-ramadan",
    assignedTo: "CS Siti", totalValue: 0, currency: "IDR",
    createdAt: "2025-07-01", lastContactedAt: "2025-07-01",
    deals: [
      { id: "d5", title: "Inbound WA", value: 0, currency: "IDR", stage: "new", source: "instagram", campaign: "promo-ramadan", createdAt: "2025-07-01" },
    ],
    notes: [],
  },
  {
    id: "c5", name: "Eko Nugroho",     phone: "628555666777",
    status: "prospect", tags: ["Malaysia", "Reseller"], source: "google", campaign: "brand-search",
    assignedTo: "CS Ahmad", totalValue: 8750, currency: "MYR",
    createdAt: "2025-06-25", lastContactedAt: "2025-07-01",
    deals: [
      { id: "d6", title: "Reseller Pack MYR", value: 8750, currency: "MYR", stage: "negotiating", source: "google", campaign: "brand-search", createdAt: "2025-06-25" },
    ],
    notes: [
      { id: "n5", text: "Mau resell ke klien lokal Malaysia. Minta harga grosir.", createdAt: "2025-06-26 15:45", author: "CS Ahmad" },
    ],
  },
  {
    id: "c6", name: "Fitri Handayani", phone: "628666777888",
    status: "churned", tags: ["Ex-Customer"], source: "tiktok", campaign: "fyp-promo",
    assignedTo: "CS Siti", totalValue: 350000, currency: "IDR",
    createdAt: "2025-04-01", lastContactedAt: "2025-05-20",
    deals: [
      { id: "d7", title: "Paket Starter", value: 350000, currency: "IDR", stage: "won", source: "tiktok", campaign: "fyp-promo", createdAt: "2025-04-01", closedAt: "2025-04-03" },
    ],
    notes: [
      { id: "n6", text: "Tidak perpanjang karena pindah vendor. Coba re-engage bulan Agustus.", createdAt: "2025-05-20 10:00", author: "CS Siti" },
    ],
  },
];
