import MidtransClient from "midtrans-client";

export function getSnapClient() {
  return new MidtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
  });
}

export function getCoreClient() {
  return new MidtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
  });
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string
): string {
  const crypto = require("crypto");
  return crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
}

export const TOPUP_PACKAGES = [
  { amount: 50_000, label: "Rp 50.000", bonus: 0, conversations: "~75 conv" },
  { amount: 100_000, label: "Rp 100.000", bonus: 0, conversations: "~150 conv" },
  { amount: 200_000, label: "Rp 200.000", bonus: 10_000, conversations: "~320 conv", popular: true },
  { amount: 500_000, label: "Rp 500.000", bonus: 50_000, conversations: "~830 conv" },
  { amount: 1_000_000, label: "Rp 1.000.000", bonus: 150_000, conversations: "~1.750 conv" },
];

export const CONVERSATION_RATE = 650; // Rp per marketing conversation
