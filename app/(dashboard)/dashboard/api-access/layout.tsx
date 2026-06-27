import TierGatedPage from "@/components/tier-gated-page";

export default function ApiAccessLayout({ children }: { children: React.ReactNode }) {
  return <TierGatedPage feature="apiAccess">{children}</TierGatedPage>;
}
