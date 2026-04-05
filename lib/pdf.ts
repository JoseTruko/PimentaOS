import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

type QuoteItem = {
  description: string
  quantity: number
  unitPrice: number | string
  total: number | string
}

type QuoteData = {
  clientName: string
  clientCompany: string | null
  clientEmail: string
  createdAt: Date
  items: QuoteItem[]
  total: number | string
}

export async function generateQuotePdf(quote: QuoteData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()

  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)

  const orange = rgb(0.85, 0.33, 0.1)
  const dark = rgb(0.1, 0.1, 0.15)
  const gray = rgb(0.45, 0.45, 0.5)
  const lightGray = rgb(0.95, 0.95, 0.96)
  const white = rgb(1, 1, 1)

  // Header background
  page.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: dark })

  // Logo circle
  page.drawCircle({ x: 55, y: height - 50, size: 22, color: orange })
  page.drawText('P', { x: 47, y: height - 57, size: 18, font: fontBold, color: white })

  // Company name
  page.drawText('Pimenta Studio OS', { x: 85, y: height - 42, size: 14, font: fontBold, color: white })
  page.drawText('Cotización', { x: 85, y: height - 60, size: 10, font: fontRegular, color: rgb(0.7, 0.7, 0.75) })

  // Date top right
  const dateStr = new Date(quote.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
  page.drawText(dateStr, { x: width - 160, y: height - 50, size: 9, font: fontRegular, color: rgb(0.7, 0.7, 0.75) })

  // Client section
  let y = height - 140
  page.drawText('CLIENTE', { x: 50, y, size: 8, font: fontBold, color: orange })
  y -= 18
  page.drawText(quote.clientName, { x: 50, y, size: 14, font: fontBold, color: dark })
  y -= 16
  if (quote.clientCompany) {
    page.drawText(quote.clientCompany, { x: 50, y, size: 10, font: fontRegular, color: gray })
    y -= 14
  }
  page.drawText(quote.clientEmail, { x: 50, y, size: 10, font: fontRegular, color: gray })

  // Divider
  y -= 24
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.88, 0.88, 0.9) })
  y -= 20

  // Table header
  page.drawRectangle({ x: 50, y: y - 6, width: width - 100, height: 24, color: dark })
  page.drawText('DESCRIPCIÓN', { x: 60, y: y + 2, size: 8, font: fontBold, color: white })
  page.drawText('CANT.', { x: 330, y: y + 2, size: 8, font: fontBold, color: white })
  page.drawText('PRECIO UNIT.', { x: 380, y: y + 2, size: 8, font: fontBold, color: white })
  page.drawText('TOTAL', { x: 490, y: y + 2, size: 8, font: fontBold, color: white })
  y -= 24

  // Table rows
  quote.items.forEach((item, i) => {
    if (i % 2 === 0) {
      page.drawRectangle({ x: 50, y: y - 6, width: width - 100, height: 22, color: lightGray })
    }
    const desc = item.description.length > 40 ? item.description.slice(0, 40) + '…' : item.description
    page.drawText(desc, { x: 60, y: y + 2, size: 9, font: fontRegular, color: dark })
    page.drawText(String(item.quantity), { x: 340, y: y + 2, size: 9, font: fontRegular, color: dark })
    page.drawText(`$${Number(item.unitPrice).toLocaleString('es')}`, { x: 380, y: y + 2, size: 9, font: fontRegular, color: dark })
    page.drawText(`$${Number(item.total).toLocaleString('es')}`, { x: 490, y: y + 2, size: 9, font: fontBold, color: dark })
    y -= 22
  })

  // Total row
  y -= 8
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.88, 0.88, 0.9) })
  y -= 20
  page.drawRectangle({ x: 380, y: y - 6, width: width - 430, height: 28, color: orange })
  page.drawText('TOTAL', { x: 390, y: y + 4, size: 9, font: fontBold, color: white })
  page.drawText(`$${Number(quote.total).toLocaleString('es')}`, { x: 460, y: y + 4, size: 11, font: fontBold, color: white })

  // Footer
  page.drawText('Generado por Pimenta Studio OS', {
    x: 50, y: 30, size: 8, font: fontRegular, color: rgb(0.7, 0.7, 0.75),
  })

  return doc.save()
}
