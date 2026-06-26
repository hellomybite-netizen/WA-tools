"use client";
import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";

// Redirect page: catat klik → kirim Lead event → redirect ke WA
export default function RedirectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  useEffect(() => {
    const utmSource = searchParams.get("utm_source") ?? undefined;
    const utmMedium = searchParams.get("utm_medium") ?? undefined;
    const utmCampaign = searchParams.get("utm_campaign") ?? undefined;
    const fbclid = searchParams.get("fbclid") ?? undefined;
    const target = searchParams.get("target");

    // Catat klik dan kirim Lead event (fire-and-forget)
    fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        utmSource,
        utmMedium,
        utmCampaign,
        fbclid,
        eventSourceUrl: window.location.href,
      }),
    }).catch(() => {});

    // Redirect ke WA setelah 300ms (beri waktu request terkirim)
    const waUrl = target ?? `https://wa.me/?text=Halo`;
    setTimeout(() => {
      window.location.href = waUrl;
    }, 300);
  }, [slug, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
        <p className="text-gray-600 text-sm">Membuka WhatsApp...</p>
      </div>
    </div>
  );
}
