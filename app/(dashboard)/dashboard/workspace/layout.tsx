import TierGatedPage from "@/components/tier-gated-page";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <TierGatedPage feature="multiWorkspace">{children}</TierGatedPage>;
}
