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
  let trialEndsAt: string | null = null;
  let trialExpired = false;

  if (!isDemo) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (!user) redirect("/login");

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, tier, trial_ends_at")
      .eq("id", user.id)
      .single();

    role = (profile?.role as UserRole) ?? "advertiser";
    tier = (profile?.tier as SubscriptionTier) ?? "starter";
    trialEndsAt = profile?.trial_ends_at ?? null;

    // Check if trial has expired — downgrade to starter behavior
    if (tier === "trial" && trialEndsAt) {
      trialExpired = new Date(trialEndsAt) < new Date();
      if (trialExpired) tier = "starter";
    }
  }

  const trialDaysLeft = trialEndsAt && !trialExpired
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <DashboardShell
      serverRole={role}
      serverTier={tier}
      userEmail={user?.email ?? null}
      isDemo={isDemo}
      trialDaysLeft={trialDaysLeft}
      trialExpired={trialExpired}
    >
      {children}
    </DashboardShell>
  );
}
