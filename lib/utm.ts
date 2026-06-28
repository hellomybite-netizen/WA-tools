export function buildWhatsAppUrl(phone: string, message: string, utmParams?: Record<string, string>): string {
  const cleaned = phone.replace(/\D/g, '')
  if (!message || !message.trim()) return `https://wa.me/${cleaned}`
  const encoded = encodeURIComponent(message.trim())
  return `https://wa.me/${cleaned}?text=${encoded}`
}

export function parseUtmFromUrl(url: string): Record<string, string> {
  try {
    const u = new URL(url)
    const params: Record<string, string> = {}
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
      const val = u.searchParams.get(key)
      if (val) params[key] = val
    }
    return params
  } catch {
    return {}
  }
}
