// Branded alert email templates. Rendered server-side by /api/alerts.

const wrap = (inner: string) => `
<div style="background:#f7f8f9;padding:32px 16px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e6e8eb;border-radius:16px;overflow:hidden;">
    <div style="padding:20px 28px;border-bottom:1px solid #e6e8eb;">
      <span style="display:inline-block;width:12px;height:12px;border-radius:999px;background:#12b76a;vertical-align:middle;"></span>
      <span style="font-size:17px;font-weight:700;color:#17181c;vertical-align:middle;margin-left:9px;">Marevo</span>
    </div>
    <div style="padding:28px;">${inner}</div>
    <div style="padding:16px 28px;border-top:1px solid #e6e8eb;font-size:11px;color:#9aa1ac;">
      Marevo freight intelligence · automated alert · reply to reach the team
    </div>
  </div>
</div>`;

export function freeTimeAlert(p: {
  containerNo: string;
  port: string;
  daysLeft: number;
  dailyRate?: number;
}) {
  const urgency = p.daysLeft <= 1 ? "#dc2626" : "#d97706";
  return {
    subject: `⏱ ${p.daysLeft} day${p.daysLeft === 1 ? "" : "s"} of free time left — ${p.containerNo} at ${p.port}`,
    html: wrap(`
      <h2 style="margin:0;font-size:19px;color:#17181c;">Free time is running out</h2>
      <p style="font-size:14px;color:#6a7280;line-height:1.6;">
        Container <strong style="color:#17181c;font-family:monospace;">${p.containerNo}</strong> at
        <strong style="color:#17181c;">${p.port}</strong> has
        <strong style="color:${urgency};">${p.daysLeft} free day${p.daysLeft === 1 ? "" : "s"} remaining</strong>.
        ${p.dailyRate ? `After that, charges accrue at <strong style="color:#17181c;">£${p.dailyRate}/day</strong>.` : ""}
      </p>
      <p style="font-size:14px;color:#6a7280;line-height:1.6;">
        Book your haulier or arrange pickup now to keep this charge at zero.
      </p>
      <a href="https://marevohq.com/app/shipments"
         style="display:inline-block;background:#12b76a;color:#ffffff;font-size:14px;font-weight:600;padding:11px 22px;border-radius:999px;text-decoration:none;">
        View the countdown
      </a>`),
  };
}

export function disputableInvoice(p: {
  invoiceNo: string;
  carrier: string;
  amount: number;
  disputable: number;
  grounds: string;
}) {
  return {
    subject: `💰 £${p.disputable.toLocaleString()} disputable — invoice ${p.invoiceNo} from ${p.carrier}`,
    html: wrap(`
      <h2 style="margin:0;font-size:19px;color:#17181c;">The audit found money</h2>
      <p style="font-size:14px;color:#6a7280;line-height:1.6;">
        Invoice <strong style="color:#17181c;font-family:monospace;">${p.invoiceNo}</strong> from
        <strong style="color:#17181c;">${p.carrier}</strong> (£${p.amount.toLocaleString()}) carries
        <strong style="color:#12b76a;">£${p.disputable.toLocaleString()} in disputable charges</strong>.
      </p>
      <div style="background:#f1f3f5;border-radius:12px;padding:14px 18px;font-size:13px;color:#17181c;line-height:1.6;">
        <strong>Grounds:</strong> ${p.grounds}
      </div>
      <p style="font-size:14px;color:#6a7280;line-height:1.6;">
        The dispute letter is drafted with the evidence attached — review and send with one click.
      </p>
      <a href="https://marevohq.com/app/invoices"
         style="display:inline-block;background:#12b76a;color:#ffffff;font-size:14px;font-weight:600;padding:11px 22px;border-radius:999px;text-decoration:none;">
        Review &amp; send the dispute
      </a>`),
  };
}
