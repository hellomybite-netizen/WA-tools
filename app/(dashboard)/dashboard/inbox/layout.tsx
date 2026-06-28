import TierGatedPage from "@/components/tier-gated-page";

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return <TierGatedPage feature="wallet">{children}</TierGatedPage>;
}
