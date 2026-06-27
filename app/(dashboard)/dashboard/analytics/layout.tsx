import TierGatedPage from "@/components/tier-gated-page";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <TierGatedPage feature="multiCurrency">{children}</TierGatedPage>;
}
