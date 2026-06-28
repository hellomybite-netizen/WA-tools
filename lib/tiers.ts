export type SubscriptionTier = "trial" | "starter" | "pro" | "agency";

export const TIERS = {
  trial: {
    label: "Trial",
    price: 0,
    color: "bg-green-100 text-green-700",
    badge: "bg-green-500",
    ring: "ring-green-400",
  },
  starter: {
    label: "Starter",
    price: 149_000,
    color: "bg-gray-100 text-gray-700",
    badge: "bg-gray-500",
    ring: "ring-gray-300",
  },
  pro: {
    label: "Pro",
    price: 299_000,
    color: "bg-blue-100 text-blue-700",
    badge: "bg-blue-500",
    ring: "ring-blue-400",
  },
  agency: {
    label: "Agency",
    price: 799_000,
    color: "bg-purple-100 text-purple-700",
    badge: "bg-purple-500",
    ring: "ring-purple-400",
  },
} as const;

export interface TierFeatures {
  maxLinks: number | "unlimited";
  maxRotators: number | "unlimited";
  maxCSPerRotator: number | "unlimited";
  maxBioLinks: number | "unlimited";
  maxTeamMembers: number | "unlimited";
  metaCapi: boolean;
  multiCurrency: boolean;
  crm: boolean;
  wallet: boolean;
  exportReports: boolean;
  multiWorkspace: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  // Trial = full Agency features for 30 days
  trial: {
    maxLinks: "unlimited",
    maxRotators: "unlimited",
    maxCSPerRotator: "unlimited",
    maxBioLinks: "unlimited",
    maxTeamMembers: "unlimited",
    metaCapi: true,
    multiCurrency: true,
    crm: true,
    wallet: true,
    exportReports: true,
    multiWorkspace: true,
    apiAccess: true,
    prioritySupport: true,
  },
  starter: {
    maxLinks: 10,
    maxRotators: 2,
    maxCSPerRotator: 5,
    maxBioLinks: 1,
    maxTeamMembers: 1,
    metaCapi: true,
    multiCurrency: false,
    crm: false,
    wallet: false,
    exportReports: false,
    multiWorkspace: false,
    apiAccess: false,
    prioritySupport: false,
  },
  pro: {
    maxLinks: "unlimited",
    maxRotators: "unlimited",
    maxCSPerRotator: "unlimited",
    maxBioLinks: "unlimited",
    maxTeamMembers: 5,
    metaCapi: true,
    multiCurrency: true,
    crm: true,
    wallet: true,
    exportReports: true,
    multiWorkspace: false,
    apiAccess: false,
    prioritySupport: true,
  },
  agency: {
    maxLinks: "unlimited",
    maxRotators: "unlimited",
    maxCSPerRotator: "unlimited",
    maxBioLinks: "unlimited",
    maxTeamMembers: "unlimited",
    metaCapi: true,
    multiCurrency: true,
    crm: true,
    wallet: true,
    exportReports: true,
    multiWorkspace: true,
    apiAccess: true,
    prioritySupport: true,
  },
};

/** Pages/features locked per tier — returns the minimum tier required */
export const FEATURE_TIER_GATE: Record<string, SubscriptionTier> = {
  crm: "pro",
  wallet: "pro",
  multiCurrency: "pro",
  exportReports: "pro",
  multiWorkspace: "agency",
  apiAccess: "agency",
  teamMembers: "pro",
};

export const TIER_ORDER: SubscriptionTier[] = ["trial", "starter", "pro", "agency"];

export function tierSatisfies(current: SubscriptionTier, required: SubscriptionTier): boolean {
  return TIER_ORDER.indexOf(current) >= TIER_ORDER.indexOf(required);
}

export function getUpgradeTier(current: SubscriptionTier): SubscriptionTier | null {
  const idx = TIER_ORDER.indexOf(current);
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : null;
}

export function formatPrice(tier: SubscriptionTier): string {
  return `Rp ${TIERS[tier].price.toLocaleString("id-ID")}`;
}
