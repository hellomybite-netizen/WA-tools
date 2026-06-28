"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import type { ScheduleCheckResult } from "@/lib/schedule";
import { buildWhatsAppUrl } from "@/lib/utm";

export default function RedirectPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const slug         = params.slug as string;
  const [status, setStatus] = useState<"checking" | "open" | "closed">("checking");
  const [schedule, setSchedule] = useState<ScheduleCheckResult | null>(null);

  useEffect(() => {
    // UTM params may be appended by ad platforms at click time
    const utmSource   = searchParams.get("utm_source")   ?? undefined;
    const utmMedium   = searchParams.get("utm_medium")   ?? undefined;
    const utmCampaign = searchParams.get("utm_campaign") ?? undefined;
    const fbclid      = searchParams.get("fbclid")       ?? undefined;

    async function run() {
      // 1. Lookup link or rotator from DB
      let waUrl = `https://wa.me/?text=Halo`;
      let linkId: string | null = null;

      try {
        // Try regular link first
        const res = await fetch(`/api/links/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const { link } = await res.json();
          linkId = link.id;
          waUrl = buildWhatsAppUrl(link.destination_phone, link.message ?? "");
        } else {
          // Try rotator
          const rres = await fetch(`/api/rotators/redirect?slug=${encodeURIComponent(slug)}`);
          if (rres.ok) {
            const { phone, message } = await rres.json();
            waUrl = buildWhatsAppUrl(phone, message ?? "");
          }
        }
      } catch {
        // fall through with default URL
      }

      // 2. Check schedule
      let schedResult: ScheduleCheckResult | null = null;
      try {
        const res = await fetch(`/api/check-schedule?slug=${encodeURIComponent(slug)}`);
        schedResult = await res.json();
      } catch { /* fail open */ }

      // 3. Track click (fire-and-forget)
      fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId,
          slug,
          utmSource:   utmSource,
          utmMedium:   utmMedium,
          utmCampaign: utmCampaign,
          fbclid,
          eventSourceUrl: window.location.href,
        }),
      }).catch(() => {});

      // 4. Handle schedule
      if (schedResult && !schedResult.isOpen) {
        setSchedule(schedResult);
        setStatus("closed");

        if (schedResult.mode === "redirect") {
          router.replace(`/closed?message=${encodeURIComponent(schedResult.closedMessage)}`);
          return;
        }
        if (schedResult.mode === "fallback" && schedResult.fallbackPhone) {
          const fallbackUrl = `https://wa.me/${schedResult.fallbackPhone.replace(/\D/g, "")}?text=${encodeURIComponent(schedResult.closedMessage)}`;
          setTimeout(() => { window.location.href = fallbackUrl; }, 600);
          return;
        }
        // mode=message: open WA with closed message
        const phone = waUrl.replace("https://wa.me/", "").split("?")[0];
        setTimeout(() => {
          window.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(schedResult!.closedMessage)}`;
        }, 1200);
        return;
      }

      // 5. Normal redirect
      setStatus("open");
      setTimeout(() => { window.location.href = waUrl; }, 300);
    }

    run();
  }, [slug, searchParams, router]);

  if (status === "closed" && schedule?.mode === "message") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm w-full bg-white border rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🕐</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Sedang Tutup</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-5">{schedule.closedMessage}</p>
          <p className="text-xs text-gray-400 animate-pulse">Membuka WhatsApp dengan pesan otomatis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
        <p className="text-gray-600 text-sm">
          {status === "checking" ? "Memuat link..." : "Membuka WhatsApp..."}
        </p>
      </div>
    </div>
  );
}
