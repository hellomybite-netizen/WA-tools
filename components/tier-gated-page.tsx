"use client";
import { useEffect, useState } from "react";
import { TIERS, TIER_FEATURES, SubscriptionTier } from "@/lib/tiers";
import UpgradeGate from "@/components/upgrade-gate";

interface TierGatedPageProps {
  feature: keyof typeof TIER_FEATURES["starter"];
  children: React.ReactNode;
}

export default function TierGatedPage({ feature, children }: TierGatedPageProps) {
  const [tier, setTier] = useState<SubscriptionTier>("pro"); // optimistic — show content while loading
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("demo_tier") as SubscriptionTier | null;
    if (saved && saved in TIERS) setTier(saved);
    setLoaded(true);
  }, []);

  // Avoid flash of content before localStorage is read
  if (!loaded) return null;

  return (
    <UpgradeGate feature={feature} currentTier={tier}>
      {children}
    </UpgradeGate>
  );
}
