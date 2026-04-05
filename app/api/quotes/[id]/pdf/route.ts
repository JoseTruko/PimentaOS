import { prisma } from '@/lib/prisma'
import { generateQuotePdf } from '@/lib/pdf'
import { auth } from '@/lib/auth'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return new Response('No autorizado', { status: 401 })
  }

  const { id } = await params

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      client: { select: { name: true, company: true, email: true } },
      items: { orderBy: { id: 'asc' } },
    },
  })

  if (!quote) {
    return new Response('Cotización no encontrada', { status: 404 })
  }

  const pdfBytes = await generateQuotePdf({
    clientName: quote.client.name,
    clientCompany: quote.client.company,
    clientEmail: quote.client.email,
    createdAt: quote.createdAt,
    items: quote.items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      total: Number(i.total),
    })),
    total: Number(quote.total),
  })

  return new Response(pdfBytes.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="cotizacion-${id}.pdf"`,
    },
  })
}
