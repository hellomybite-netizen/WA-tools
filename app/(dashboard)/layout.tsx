import { createServerSupabaseClient, isSupabaseConfiguredServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/roles";
import DashboardShell from "@/components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isDemo = !isSupabaseConfiguredServer();
  let user = null;
  let role: UserRole | null = null;

  if (!isDemo) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (!user) redirect("/login");

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    role = (profile?.role as UserRole) ?? "advertiser";
  }

  return (
    <DashboardShell
      serverRole={role}
      userEmail={user?.email ?? null}
      isDemo={isDemo}
    >
      {children}
    </DashboardShell>
  );
}
