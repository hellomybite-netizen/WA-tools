import { createServerSupabaseClient, isSupabaseConfiguredServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/roles";
import { SubscriptionTier } from "@/lib/tiers";
import DashboardShell from "@/components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isDemo = !isSupabaseConfiguredServer();
  let user = null;
  let role: UserRole | null = null;
  let tier: SubscriptionTier | null = null;

  if (!isDemo) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (!user) redirect("/login");

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, tier")
      .eq("id", user.id)
      .single();

    role = (profile?.role as UserRole) ?? "advertiser";
    tier = (profile?.tier as SubscriptionTier) ?? "starter";
  }

  return (
    <DashboardShell
      serverRole={role}
      serverTier={tier}
      userEmail={user?.email ?? null}
      isDemo={isDemo}
    >
      {children}
    </DashboardShell>
  );
}
