import TierGatedPage from "@/components/tier-gated-page";

export default function WhiteLabelLayout({ children }: { children: React.ReactNode }) {
  return <TierGatedPage feature="whiteLabel">{children}</TierGatedPage>;
}
