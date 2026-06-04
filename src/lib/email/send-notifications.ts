import 'server-only'

import nodemailer from 'nodemailer'

const FROM_NAME = 'Vehical Advertise'
const FROM_EMAIL = process.env.SMTP_FROM ?? 'noreply@kjasnguyen.id.vn'
const APP_NAME = 'Vehical Advertise'

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function baseHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:Arial,sans-serif;background:#f7f8fa;margin:0;padding:32px">
  <table style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e0de">
    <tr><td style="background:#1a1a1a;padding:24px 32px">
      <span style="color:#ff5c00;font-size:22px;font-weight:900;letter-spacing:-0.5px">${APP_NAME}</span>
    </td></tr>
    <tr><td style="padding:32px">
      ${body}
      <hr style="border:none;border-top:1px solid #e0e0de;margin:24px 0">
      <p style="color:#999;font-size:12px;margin:0">${APP_NAME} · Hà Nội, Việt Nam</p>
    </td></tr>
  </table>
</body>
</html>`
}

/** Fire-and-forget — logs errors but never throws. DB ops must not depend on this. */
async function send(to: string, subject: string, html: string): Promise<void> {
  // Skip silently when SMTP is not configured (dev / CI)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('[send-notifications] SMTP not configured — email skipped:', subject)
    return
  }
  try {
    const transporter = createTransport()
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
  } catch (err) {
    console.error('[send-notifications] SMTP error:', err)
  }
}

// ── Welcome (new signup) ───────────────────────────────────────────────────

export async function sendWelcome({ email, name }: { email: string; name: string }): Promise<void> {
  const html = baseHtml(
    'Chào mừng bạn đến với Vehical Advertise',
    `<h2 style="color:#1a1a1a;margin:0 0 16px">Xin chào ${name},</h2>
     <p style="color:#444;line-height:1.6">🎉 Tài khoản của bạn đã được tạo thành công trên <strong>${APP_NAME}</strong>.</p>
     <p style="color:#444;line-height:1.6">Tiếp theo, hãy chọn vai trò của bạn (Driver, Partner hoặc Garage) và hoàn thành xác minh hồ sơ.</p>
     <a href="https://wheelsearner.vn/onboarding" style="display:inline-block;margin-top:16px;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700">Bắt đầu →</a>`,
  )
  await send(email, `[${APP_NAME}] Chào mừng bạn đến với Vehical Advertise!`, html)
}

// ── Driver KYC ─────────────────────────────────────────────────────────────

export async function sendDriverKycApproved({
  email,
  name,
}: {
  email: string
  name: string
}): Promise<void> {
  const html = baseHtml(
    'KYC được duyệt',
    `<h2 style="color:#1a1a1a;margin:0 0 16px">Xin chào ${name},</h2>
     <p style="color:#444;line-height:1.6">🎉 Hồ sơ xác minh danh tính (KYC) của bạn đã được <strong style="color:#16a34a">duyệt thành công</strong>.</p>
     <p style="color:#444;line-height:1.6">Bạn có thể đăng nhập và bắt đầu nhận chuyến ngay hôm nay.</p>
     <a href="https://wheelsearner.vn/driver/dashboard" style="display:inline-block;margin-top:16px;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700">Vào Dashboard →</a>`,
  )
  await send(email, `[${APP_NAME}] KYC đã được duyệt`, html)
}

export async function sendDriverKycRejected({
  email,
  name,
  reason,
}: {
  email: string
  name: string
  reason?: string
}): Promise<void> {
  const reasonHtml = reason
    ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:12px 16px;margin:16px 0">
         <p style="color:#dc2626;margin:0;font-size:14px"><strong>Lý do:</strong> ${reason}</p>
       </div>`
    : ''
  const html = baseHtml(
    'KYC cần bổ sung',
    `<h2 style="color:#1a1a1a;margin:0 0 16px">Xin chào ${name},</h2>
     <p style="color:#444;line-height:1.6">Hồ sơ xác minh danh tính (KYC) của bạn chưa được duyệt.</p>
     ${reasonHtml}
     <p style="color:#444;line-height:1.6">Vui lòng đăng nhập, cập nhật thông tin và gửi lại.</p>
     <a href="https://wheelsearner.vn/driver/verify" style="display:inline-block;margin-top:16px;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700">Cập nhật KYC →</a>`,
  )
  await send(email, `[${APP_NAME}] KYC cần bổ sung thông tin`, html)
}

// ── Partner ────────────────────────────────────────────────────────────────

export async function sendPartnerApproved({
  email,
  name,
}: {
  email: string
  name: string
}): Promise<void> {
  const html = baseHtml(
    'Hồ sơ đối tác được duyệt',
    `<h2 style="color:#1a1a1a;margin:0 0 16px">Xin chào ${name},</h2>
     <p style="color:#444;line-height:1.6">🎉 Hồ sơ công ty của bạn đã được <strong style="color:#16a34a">duyệt thành công</strong>.</p>
     <p style="color:#444;line-height:1.6">Bạn có thể bắt đầu nạp tiền, tạo chiến dịch và quảng cáo trên xe ngay hôm nay.</p>
     <a href="https://wheelsearner.vn/partner/dashboard" style="display:inline-block;margin-top:16px;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700">Vào Dashboard →</a>`,
  )
  await send(email, `[${APP_NAME}] Hồ sơ đối tác đã được duyệt`, html)
}

export async function sendPartnerRejected({
  email,
  name,
  reason,
}: {
  email: string
  name: string
  reason?: string
}): Promise<void> {
  const reasonHtml = reason
    ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:12px 16px;margin:16px 0">
         <p style="color:#dc2626;margin:0;font-size:14px"><strong>Lý do:</strong> ${reason}</p>
       </div>`
    : ''
  const html = baseHtml(
    'Hồ sơ đối tác cần bổ sung',
    `<h2 style="color:#1a1a1a;margin:0 0 16px">Xin chào ${name},</h2>
     <p style="color:#444;line-height:1.6">Hồ sơ công ty của bạn chưa được duyệt.</p>
     ${reasonHtml}
     <p style="color:#444;line-height:1.6">Vui lòng đăng nhập, chỉnh sửa thông tin và gửi lại.</p>
     <a href="https://wheelsearner.vn/partner/onboarding" style="display:inline-block;margin-top:16px;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700">Cập nhật hồ sơ →</a>`,
  )
  await send(email, `[${APP_NAME}] Hồ sơ đối tác cần bổ sung`, html)
}

export async function sendPartnerDepositSuccess({
  email,
  name,
  amountVnd,
  currentBalanceVnd,
}: {
  email: string
  name: string
  amountVnd: number
  currentBalanceVnd: number
}): Promise<void> {
  const html = baseHtml(
    'Deposit Successful',
    `<h2 style="color:#1a1a1a;margin:0 0 16px">Xin chào ${name},</h2>
     <p style="color:#444;line-height:1.6">Khoản nạp của bạn đã được ghi nhận thành công.</p>
     <table style="width:100%;border-collapse:collapse;margin:16px 0">
       <tr><td style="padding:8px;border:1px solid #e0e0de">Amount</td><td style="padding:8px;border:1px solid #e0e0de"><strong>${amountVnd.toLocaleString('vi-VN')} VNĐ</strong></td></tr>
       <tr><td style="padding:8px;border:1px solid #e0e0de">Current Balance</td><td style="padding:8px;border:1px solid #e0e0de"><strong>${currentBalanceVnd.toLocaleString('vi-VN')} VNĐ</strong></td></tr>
     </table>
     <a href="https://wheelsearner.vn/partner/billing" style="display:inline-block;margin-top:16px;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700">View Billing →</a>`,
  )
  await send(email, `[${APP_NAME}] Deposit Successful`, html)
}
