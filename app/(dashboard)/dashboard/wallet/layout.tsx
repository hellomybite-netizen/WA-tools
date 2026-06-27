import TierGatedPage from "@/components/tier-gated-page";

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return <TierGatedPage feature="wallet">{children}</TierGatedPage>;
}
