import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#fdf8f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#b5673d 0%,#d4845a 100%);padding:36px 40px;text-align:center;">
            <p style="margin:0 0 6px 0;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:3px;text-transform:uppercase;font-weight:600;">Pesha's Bake Shop — Admin</p>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">🎂 ${title}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:#fdf8f4;padding:24px 40px;text-align:center;border-top:1px solid #f0e8e0;">
            <p style="margin:0;font-size:12px;color:#a0856d;">This is an automated admin notification from Pesha's Bake Shop.</p>
            <p style="margin:8px 0 0;font-size:11px;color:#c4a992;">© ${new Date().getFullYear()} Pesha's Bake Shop. Made with 💛 in Sri Lanka.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const { to, subject, html, text } = await request.json();

    const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
    const port = Number(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const fromName = process.env.SMTP_FROM_NAME || "Pesha's Bake Shop";
    const fromEmail = process.env.SMTP_FROM_EMAIL || user;

    if (!user || !pass) {
      console.warn(`[Email] No SMTP credentials — simulated send to: ${to}\nSubject: ${subject}`);
      return NextResponse.json({ success: true, simulated: true });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const finalHtml = html || wrapHtml(subject, `<p style="color:#5c3d2e;font-size:15px;line-height:1.7;">${text || ''}</p>`);

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text: text || subject,
      html: finalHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Email] Failed to send:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
