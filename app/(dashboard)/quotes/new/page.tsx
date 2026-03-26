import { prisma } from '@/lib/prisma'
import { createQuote } from '@/actions/quotes'
import { NewQuoteForm } from '@/components/quotes/new-quote-form'

export default async function NewQuotePage() {
  const clients = await prisma.client.findMany({
    where: { deletedAt: null, status: { not: 'inactive' } },
    select: { id: true, name: true, company: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nueva Cotización</h1>
        <p className="text-muted-foreground text-sm">Selecciona el cliente para comenzar</p>
      </div>
      <NewQuoteForm action={createQuote} clients={clients} />
    </div>
  )
}
