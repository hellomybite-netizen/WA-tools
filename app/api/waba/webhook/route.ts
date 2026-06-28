import { NextRequest, NextResponse } from "next/server";

// Meta verifies webhook with GET request
export async function GET(req: NextRequest) {
  const mode      = req.nextUrl.searchParams.get("hub.mode");
  const token     = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const verifyToken = process.env.WABA_WEBHOOK_VERIFY_TOKEN ?? "watools_webhook_secret";

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Meta sends incoming messages via POST
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate it's from Meta
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value) return NextResponse.json({ status: "ignored" });

    const messages = value.messages ?? [];
    const contacts = value.contacts ?? [];

    for (const msg of messages) {
      const contactPhone = msg.from;
      const contactName  = contacts.find((c: any) => c.wa_id === contactPhone)?.profile?.name ?? contactPhone;
      const text         = msg.text?.body ?? "[media]";
      const msgId        = msg.id;
      const timestamp    = new Date(parseInt(msg.timestamp) * 1000).toISOString();

      // TODO: persist to DB
      // await supabase.from("waba_messages").insert({...})
      // await supabase.from("waba_conversations").upsert({...})

      console.log(`[WABA Webhook] New message from ${contactName} (${contactPhone}): ${text} [msgId=${msgId} ts=${timestamp}]`);

      // Auto-detect source: check if phone recently clicked a tracking link
      // TODO: query click_events table for recent clicks from this phone
    }

    // Meta requires 200 response quickly
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[WABA Webhook] Error:", err);
    return NextResponse.json({ status: "error" }, { status: 200 }); // still 200 to avoid Meta retry flood
  }
}
