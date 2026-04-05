import { prisma } from '@/lib/prisma'
import { createQuote } from '@/actions/quotes'
import { QuoteForm } from '@/components/quotes/quote-form'

export default async function NewQuotePage() {
  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, company: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nueva Cotización</h1>
        <p className="text-muted-foreground text-sm mt-1">Crea una cotización para un cliente</p>
      </div>
      <QuoteForm action={createQuote} clients={clients} />
    </div>
  )
}
