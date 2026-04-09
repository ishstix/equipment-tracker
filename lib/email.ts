import nodemailer from 'nodemailer';
import { CheckoutRequest, CheckoutItem, Equipment } from './types';

const transporter = nodemailer.createTransport({
  host: 'smtp.ionos.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

type ItemWithEquipment = CheckoutItem & { equipment: Equipment };

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildItemsHtml(items: ItemWithEquipment[]) {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.equipment.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
      </tr>`
    )
    .join('');
}

function buildEmailHtml(
  request: CheckoutRequest,
  items: ItemWithEquipment[],
  recipientType: 'admin' | 'requester'
) {
  const greeting =
    recipientType === 'admin'
      ? `<p>A new equipment checkout request has been submitted.</p>`
      : `<p>Hi <strong>${request.requester_name}</strong>, your checkout request has been received! Here's a summary:</p>`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;color:#111827;max-width:600px;margin:0 auto;padding:24px;">
  <div style="background:#2563EB;color:white;padding:20px 24px;border-radius:8px 8px 0 0;">
    <h1 style="margin:0;font-size:20px;">Equipment Checkout Request</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
    ${greeting}
    <table style="width:100%;margin-top:16px;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#6b7280;width:140px;">Requester</td><td style="padding:6px 0;font-weight:600;">${request.requester_name}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;">${request.requester_email}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Pickup Date</td><td style="padding:6px 0;font-weight:600;">${formatDate(request.checkout_date)}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Due Back</td><td style="padding:6px 0;font-weight:600;color:#DC2626;">${formatDate(request.due_date)}</td></tr>
      ${request.notes ? `<tr><td style="padding:6px 0;color:#6b7280;">Notes</td><td style="padding:6px 0;">${request.notes}</td></tr>` : ''}
    </table>

    <h3 style="margin-top:24px;margin-bottom:8px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;">Items Requested</h3>
    <table style="width:100%;border-collapse:collapse;background:white;border-radius:6px;overflow:hidden;border:1px solid #e5e7eb;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:8px 12px;text-align:left;font-size:13px;color:#374151;">Item</th>
          <th style="padding:8px 12px;text-align:center;font-size:13px;color:#374151;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${buildItemsHtml(items)}
      </tbody>
    </table>

    <p style="margin-top:24px;font-size:13px;color:#9ca3af;">Request ID: ${request.id}</p>
  </div>
</body>
</html>`;
}

export async function sendCheckoutEmail(
  request: CheckoutRequest,
  items: ItemWithEquipment[]
) {
  const adminHtml = buildEmailHtml(request, items, 'admin');
  const requesterHtml = buildEmailHtml(request, items, 'requester');

  const itemsText = items
    .map((i) => `  • ${i.equipment.name} (Qty: ${i.quantity})`)
    .join('\n');

  const textBody = `
Equipment Checkout Request

Requester: ${request.requester_name}
Email: ${request.requester_email}
Pickup Date: ${formatDate(request.checkout_date)}
Due Back: ${formatDate(request.due_date)}
${request.notes ? `Notes: ${request.notes}` : ''}

Items:
${itemsText}

Request ID: ${request.id}
  `.trim();

  await transporter.sendMail({
    from: `"Equipment Tracker" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Checkout Request — ${request.requester_name}`,
    text: textBody,
    html: adminHtml,
  });

  await transporter.sendMail({
    from: `"Equipment Tracker" <${process.env.EMAIL_USER}>`,
    to: request.requester_email,
    subject: `Your Equipment Checkout Request`,
    text: `Hi ${request.requester_name},\n\nYour request was received.\n\n${textBody}`,
    html: requesterHtml,
  });
}
