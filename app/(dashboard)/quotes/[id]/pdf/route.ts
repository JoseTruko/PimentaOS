import { NextRequest, NextResponse } from 'next/server'
import { getQuoteById } from '@/actions/quotes'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const quote = await getQuoteById(id)
  if (!quote) return new NextResponse('Not found', { status: 404 })

  const statusLabel: Record<string, string> = {
    draft: 'Borrador', sent: 'Enviada', approved: 'Aprobada', rejected: 'Rechazada',
  }

  const itemsRows = quote.items.map((item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${item.description}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right">$${Number(item.unitPrice).toLocaleString('es')}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600">$${Number(item.total).toLocaleString('es')}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Cotización${quote.title ? ` — ${quote.title}` : ''}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#1a1a1a; background:#fff; padding:48px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; }
  .brand { font-size:22px; font-weight:700; color:#fe8002; }
  .brand-sub { font-size:11px; color:#888; text-transform:uppercase; letter-spacing:.08em; margin-top:2px; }
  .meta { text-align:right; }
  .meta h1 { font-size:18px; font-weight:700; }
  .meta .status { display:inline-block; margin-top:6px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; background:#f5f5f5; color:#555; }
  .section { margin-bottom:28px; }
  .section-title { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:#888; margin-bottom:10px; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .info-item label { font-size:11px; color:#888; display:block; margin-bottom:2px; }
  .info-item span { font-size:14px; font-weight:500; }
  table { width:100%; border-collapse:collapse; }
  thead tr { background:#f8f8f8; }
  th { padding:10px 12px; text-align:left; font-size:12px; font-weight:600; color:#555; }
  th:not(:first-child) { text-align:right; }
  th:nth-child(2) { text-align:center; }
  .total-row td { padding:14px 12px; font-size:16px; font-weight:700; border-top:2px solid #fe8002; }
  .total-row td:last-child { color:#fe8002; }
  .notes { background:#fafafa; border-left:3px solid #fe8002; padding:12px 16px; border-radius:0 8px 8px 0; font-size:13px; color:#555; line-height:1.6; }
  .footer { margin-top:48px; padding-top:20px; border-top:1px solid #f0f0f0; font-size:11px; color:#aaa; text-align:center; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">pimentaOS</div>
      <div class="brand-sub">Studio Panel</div>
    </div>
    <div class="meta">
      <h1>${quote.title ?? 'Cotización'}</h1>
      <div class="status">${statusLabel[quote.status]}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Información del cliente</div>
    <div class="info-grid">
      <div class="info-item"><label>Cliente</label><span>${quote.client.name}</span></div>
      <div class="info-item"><label>Email</label><span>${quote.client.email}</span></div>
      ${quote.client.company ? `<div class="info-item"><label>Empresa</label><span>${quote.client.company}</span></div>` : ''}
      <div class="info-item"><label>Fecha</label><span>${new Date(quote.createdAt).toLocaleDateString('es', { dateStyle: 'long' })}</span></div>
      ${quote.validUntil ? `<div class="info-item"><label>Válida hasta</label><span>${new Date(quote.validUntil).toLocaleDateString('es', { dateStyle: 'long' })}</span></div>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Servicios</div>
    <table>
      <thead>
        <tr>
          <th>Descripción</th>
          <th style="text-align:center">Cantidad</th>
          <th style="text-align:right">Precio unit.</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
        <tr class="total-row">
          <td colspan="3" style="text-align:right">Total</td>
          <td style="text-align:right">$${Number(quote.total).toLocaleString('es')}</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${quote.notes ? `
  <div class="section">
    <div class="section-title">Notas</div>
    <div class="notes">${quote.notes.replace(/\n/g, '<br/>')}</div>
  </div>` : ''}

  <div class="footer">Pimenta Studio OS · Documento generado el ${new Date().toLocaleDateString('es', { dateStyle: 'long' })}</div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="cotizacion-${id}.html"`,
    },
  })
}
