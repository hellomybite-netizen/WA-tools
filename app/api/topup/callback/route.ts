import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { verifyMidtransSignature } from "@/lib/midtrans";

// Midtrans webhook — dipanggil Midtrans server saat payment berhasil/gagal
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body;

  // Verifikasi signature
  const expectedSig = verifyMidtransSignature(
    order_id,
    status_code,
    gross_amount,
    process.env.MIDTRANS_SERVER_KEY!
  );
  if (signature_key !== expectedSig) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const isPaid =
    (transaction_status === "capture" && fraud_status === "accept") ||
    transaction_status === "settlement";

  const isFailed = ["cancel", "deny", "expire"].includes(transaction_status);

  if (isPaid) {
    // Ambil data transaksi
    const { data: txn } = await supabase
      .from("topup_transactions")
      .select("user_id, total_credited")
      .eq("order_id", order_id)
      .single();

    if (txn) {
      // Update status transaksi
      await supabase
        .from("topup_transactions")
        .update({ status: "success", paid_at: new Date().toISOString() })
        .eq("order_id", order_id);

      // Tambah saldo wallet user (upsert)
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", txn.user_id)
        .single();

      const newBalance = (wallet?.balance ?? 0) + txn.total_credited;
      await supabase
        .from("wallets")
        .upsert({ user_id: txn.user_id, balance: newBalance, updated_at: new Date().toISOString() });

      // Catat ke wallet_ledger
      await supabase.from("wallet_ledger").insert({
        user_id: txn.user_id,
        type: "topup",
        amount: txn.total_credited,
        description: `Topup via Midtrans (${order_id})`,
        order_id,
      });
    }
  }

  if (isFailed) {
    await supabase
      .from("topup_transactions")
      .update({ status: transaction_status })
      .eq("order_id", order_id);
  }

  return NextResponse.json({ ok: true });
}
