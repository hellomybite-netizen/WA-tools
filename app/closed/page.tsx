import Link from "next/link";

export const metadata = { title: "Sedang Tutup — WA Tools" };

interface Props {
  searchParams: Promise<{ message?: string; phone?: string; open?: string }>;
}

export default async function ClosedPage({ searchParams }: Props) {
  const params = await searchParams;
  const message = params.message ?? "Kami sedang tutup. Silakan hubungi kami saat jam operasional.";
  const openTime = params.open;
  const phone    = params.phone;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full bg-white border rounded-2xl p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">🕐</span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">Sedang Tutup</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">{message}</p>

        {openTime && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-green-800">
              ✅ Buka kembali pukul <strong>{openTime}</strong>
            </p>
          </div>
        )}

        {phone && (
          <a
            href={`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`}
            className="block w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors mb-3"
          >
            💬 Kirim Pesan Sekarang
          </a>
        )}

        <p className="text-xs text-gray-400">
          Powered by{" "}
          <Link href="/" className="text-green-600 hover:underline">
            WA Tools
          </Link>
        </p>
      </div>
    </div>
  );
}
