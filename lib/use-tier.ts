import { useEffect, useState } from "react";
import { TIERS, SubscriptionTier } from "@/lib/tiers";

export function useTier(defaultTier: SubscriptionTier = "pro"): SubscriptionTier {
  const [tier, setTier] = useState<SubscriptionTier>(defaultTier);
  useEffect(() => {
    const saved = localStorage.getItem("demo_tier") as SubscriptionTier | null;
    if (saved && saved in TIERS) setTier(saved);
  }, []);
  return tier;
}
