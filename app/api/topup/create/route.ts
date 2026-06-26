import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSnapClient, TOPUP_PACKAGES } from "@/lib/midtrans";

export async function POST(req: NextRequest) {
  const { amount, userId, userEmail } = await req.json();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configured = supabaseUrl && !supabaseUrl.includes("your_supabase");
  if (!configured) return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });

  const pkg = TOPUP_PACKAGES.find((p) => p.amount === amount);
  if (!pkg) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, { cookies: { getAll: () => [], setAll: () => {} } });

  const orderId = `TOPUP-${userId.slice(0, 8)}-${Date.now()}`;
  const totalAmount = pkg.amount + pkg.bonus;

  // Simpan pending transaction
  await supabase.from("topup_transactions").insert({
    user_id: userId,
    order_id: orderId,
    amount: pkg.amount,
    bonus: pkg.bonus,
    total_credited: totalAmount,
    status: "pending",
  });

  // Cek apakah Midtrans sudah dikonfigurasi
  const midtransKey = process.env.MIDTRANS_SERVER_KEY;
  if (!midtransKey || midtransKey.includes("your_midtrans")) {
    // Return demo token untuk testing UI
    return NextResponse.json({ token: "demo-token", orderId, demo: true });
  }

  const snap = getSnapClient();
  const transaction = await snap.createTransaction({
    transaction_details: { order_id: orderId, gross_amount: pkg.amount },
    item_details: [{ id: "WALLET_TOPUP", price: pkg.amount, quantity: 1, name: `Topup Saldo WA API ${pkg.label}` }],
  } as any);

  return NextResponse.json({ token: transaction.token, orderId });
}
