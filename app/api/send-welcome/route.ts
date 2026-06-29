import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_placeholder") {
    return NextResponse.json({ ok: true, note: "Resend not configured" });
  }

  const { name, email } = await req.json();
  if (!name || !email) return NextResponse.json({ error: "name and email required" }, { status: 400 });

  const resend = new Resend(apiKey);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://wa-tools-zeta.vercel.app";

  const { error } = await resend.emails.send({
    from: "WA Tools <noreply@chatlacak.com>",
    to: email,
    subject: `Selamat datang di WA Tools, ${name}! 🎉`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">

        <!-- Header -->
        <tr>
          <td style="background:#16a34a;padding:32px 40px;text-align:center">
            <p style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px">WA Tools</p>
            <p style="margin:8px 0 0;color:#bbf7d0;font-size:14px">WhatsApp Marketing Platform</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px">
            <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#111827">Halo, ${name}! 👋</p>
            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6">
              Akun WA Tools Anda sudah aktif. Anda mendapatkan akses <strong>semua fitur Pro gratis selama 30 hari</strong> — tidak perlu kartu kredit.
            </p>

            <!-- Feature list -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;padding:20px;margin-bottom:24px">
              <tr><td>
                <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#166534;text-transform:uppercase;letter-spacing:0.05em">Yang bisa Anda lakukan sekarang:</p>
                ${[
                  ["🔗", "Buat link WA dengan UTM tracking"],
                  ["🔄", "Atur Chat Rotator untuk distribusi CS otomatis"],
                  ["📊", "Pantau analytics klik & konversi real-time"],
                  ["📱", "Hubungkan Meta Pixel untuk kirim event CAPI"],
                  ["🌐", "Buat Bio Link halaman profil bisnis"],
                ].map(([icon, text]) => `
                <p style="margin:0 0 8px;font-size:14px;color:#374151">
                  <span style="margin-right:8px">${icon}</span>${text}
                </p>`).join("")}
              </td></tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${appUrl}/dashboard" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600">
                  Mulai Gunakan WA Tools →
                </a>
              </td></tr>
            </table>

            <p style="margin:32px 0 0;font-size:13px;color:#9ca3af;text-align:center">
              Ada pertanyaan? Balas email ini atau hubungi kami langsung.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center">
            <p style="margin:0;font-size:12px;color:#9ca3af">
              WA Tools · <a href="${appUrl}" style="color:#6b7280;text-decoration:none">${appUrl}</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
