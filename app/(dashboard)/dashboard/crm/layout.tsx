import TierGatedPage from "@/components/tier-gated-page";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return <TierGatedPage feature="crm">{children}</TierGatedPage>;
}
