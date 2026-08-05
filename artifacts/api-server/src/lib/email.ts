/**
 * Email utility — sends OTP emails.
 *
 * In development (no SMTP env vars set) it prints the OTP to the console
 * so the flow can be tested without a real email service.
 *
 * In production, set these environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

interface SendOtpOptions {
  to: string;
  otp: string;
  fullName: string;
}

interface SendPasswordResetOptions {
  to: string;
  otp: string;
  fullName: string;
}

/** Escape special HTML characters to prevent injection via user-controlled strings. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Trim all SMTP env vars — guards against accidental leading/trailing spaces when secrets are pasted. */
function smtpConfig() {
  return {
    host: (process.env.SMTP_HOST ?? "").trim(),
    port: Number((process.env.SMTP_PORT ?? "587").trim()),
    user: (process.env.SMTP_USER ?? "").trim(),
    pass: (process.env.SMTP_PASS ?? "").trim(),
    from: (process.env.SMTP_FROM ?? "SwiftCare <noreply@swiftcare.app>").trim(),
  };
}

function isSmtpConfigured(): boolean {
  const cfg = smtpConfig();
  return !!(cfg.host && cfg.user && cfg.pass);
}

export async function sendPasswordResetEmail({
  to,
  otp,
  fullName,
}: SendPasswordResetOptions): Promise<void> {
  const firstName = escapeHtml(fullName.split(" ")[0]);

  if (!isSmtpConfigured()) {
    console.log(
      `\n🔑  [DEV] Password reset OTP for ${to}: ${otp}  (expires in 10 min)\n`,
    );
    return;
  }

  const cfg = smtpConfig();
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });

  await transporter.sendMail({
    from: cfg.from,
    to,
    subject: `Reset your SwiftCare password: ${otp}`,
    text: [
      `Hi ${fullName.split(" ")[0]},`,
      ``,
      `You requested a password reset for your SwiftCare account.`,
      ``,
      `Your reset code is:`,
      ``,
      `  ${otp}`,
      ``,
      `This code expires in 10 minutes.`,
      ``,
      `If you didn't request a password reset, you can safely ignore this email.`,
    ].join("\n"),
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
        <div style="text-align:center;margin-bottom:24px">
          <span style="display:inline-block;background:#16A34A;color:#fff;font-size:18px;font-weight:700;padding:10px 20px;border-radius:8px">SwiftCare</span>
        </div>
        <h2 style="color:#111827;font-size:20px;margin-bottom:8px">Reset your password</h2>
        <p style="color:#6B7280;font-size:14px;line-height:1.6;margin-bottom:24px">
          Hi ${firstName}, enter the code below in the SwiftCare app to reset your password.
        </p>
        <div style="background:#FFF7ED;border:2px dashed #EA580C;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <span style="font-size:36px;font-weight:700;color:#EA580C;letter-spacing:8px">${otp}</span>
        </div>
        <p style="color:#9CA3AF;font-size:12px;text-align:center">
          This code expires in <strong>10 minutes</strong>. If you didn't request a password reset, ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendOtpEmail({
  to,
  otp,
  fullName,
}: SendOtpOptions): Promise<void> {
  const firstName = escapeHtml(fullName.split(" ")[0]);

  if (!isSmtpConfigured()) {
    // Dev fallback — log OTP so the flow can be tested
    console.log(
      `\n📧  [DEV] OTP for ${to}: ${otp}  (expires in 10 min)\n`,
    );
    return;
  }

  const cfg = smtpConfig();
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });

  await transporter.sendMail({
    from: cfg.from,
    to,
    subject: `Your SwiftCare verification code: ${otp}`,
    text: [
      `Hi ${fullName.split(" ")[0]},`,
      ``,
      `Your SwiftCare email verification code is:`,
      ``,
      `  ${otp}`,
      ``,
      `This code expires in 10 minutes.`,
      ``,
      `If you didn't create a SwiftCare account, you can ignore this email.`,
    ].join("\n"),
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
        <div style="text-align:center;margin-bottom:24px">
          <span style="display:inline-block;background:#16A34A;color:#fff;font-size:18px;font-weight:700;padding:10px 20px;border-radius:8px">SwiftCare</span>
        </div>
        <h2 style="color:#111827;font-size:20px;margin-bottom:8px">Verify your email address</h2>
        <p style="color:#6B7280;font-size:14px;line-height:1.6;margin-bottom:24px">
          Hi ${firstName}, enter the code below in the SwiftCare app to confirm your email address.
        </p>
        <div style="background:#F0FDF4;border:2px dashed #16A34A;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <span style="font-size:36px;font-weight:700;color:#16A34A;letter-spacing:8px">${otp}</span>
        </div>
        <p style="color:#9CA3AF;font-size:12px;text-align:center">
          This code expires in <strong>10 minutes</strong>. If you didn't create a SwiftCare account, ignore this email.
        </p>
      </div>
    `,
  });
}
