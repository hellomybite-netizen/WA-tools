import { NextRequest, NextResponse } from "next/server";
import { CONVERSATION_COSTS, ConversationCategory } from "@/lib/waba";
import { CONVERSATION_RATE } from "@/lib/midtrans";

export async function POST(req: NextRequest) {
  try {
    const { userId, conversationId, category } = await req.json() as {
      userId: string;
      conversationId: string;
      category: ConversationCategory;
    };

    const costIDR = CONVERSATION_COSTS[category] ?? CONVERSATION_RATE;

    if (costIDR === 0) {
      // Service / user-initiated within 24h window — free
      return NextResponse.json({ deducted: 0, free: true });
    }

    // TODO: real DB implementation
    // const { data: wallet } = await supabase
    //   .from("wallets").select("balance").eq("user_id", userId).single();
    //
    // if (wallet.balance < costIDR) {
    //   return NextResponse.json({ error: "insufficient_balance", paused: true }, { status: 402 });
    // }
    //
    // await supabase.rpc("deduct_wallet_balance", { uid: userId, amount: costIDR });
    // await supabase.from("wallet_ledger").insert({
    //   user_id: userId, type: "debit", amount: -costIDR,
    //   description: `Conversation ${category} — ${conversationId}`,
    // });

    console.log(`[WABA Deduct] user=${userId} conv=${conversationId} category=${category} cost=Rp${costIDR}`);

    return NextResponse.json({ deducted: costIDR, free: false, conversationId });
  } catch (err) {
    console.error("[WABA Deduct] Error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
