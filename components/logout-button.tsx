"use client";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left text-xs text-gray-500 hover:text-gray-800 px-1 transition-colors"
    >
      Keluar
    </button>
  );
}
