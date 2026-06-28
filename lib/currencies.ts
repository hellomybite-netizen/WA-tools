export const CURRENCIES = {
  IDR: { code: "IDR", symbol: "Rp", name: "Rupiah", locale: "id-ID", flag: "🇮🇩" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", flag: "🇺🇸" },
  HKD: { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", locale: "zh-HK", flag: "🇭🇰" },
  TWD: { code: "TWD", symbol: "NT$", name: "Taiwan Dollar", locale: "zh-TW", flag: "🇹🇼" },
  MYR: { code: "MYR", symbol: "RM", name: "Ringgit Malaysia", locale: "ms-MY", flag: "🇲🇾" },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export function formatCurrency(amount: number, code: CurrencyCode): string {
  const cur = CURRENCIES[code];
  if (code === "IDR") {
    // IDR: no decimal, use dot separator
    return `${cur.symbol} ${amount.toLocaleString("id-ID")}`;
  }
  return new Intl.NumberFormat(cur.locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Approximate rates to USD for cross-currency comparison (update periodically)
export const RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1,
  IDR: 0.000062,   // 1 IDR = 0.000062 USD
  HKD: 0.128,      // 1 HKD = 0.128 USD
  TWD: 0.031,      // 1 TWD = 0.031 USD
  MYR: 0.213,      // 1 MYR = 0.213 USD
};

export function convertToUSD(amount: number, from: CurrencyCode): number {
  return amount * RATES_TO_USD[from];
}

export function convertTo(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  const usd = amount * RATES_TO_USD[from];
  return usd / RATES_TO_USD[to];
}
