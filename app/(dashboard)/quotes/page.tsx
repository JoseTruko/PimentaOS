import Link from 'next/link'
import { getQuotes } from '@/actions/quotes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus } from 'lucide-react'

const statusLabel: Record<string, string> = {
  draft: 'Borrador', sent: 'Enviada', approved: 'Aprobada', rejected: 'Rechazada',
}
const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary', sent: 'outline', approved: 'default', rejected: 'outline',
}

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const quotes = await getQuotes(params)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cotizaciones</h1>
          <p className="text-muted-foreground text-sm mt-1">{quotes.length} cotizaciones encontradas</p>
        </div>
        <Button asChild>
          <Link href="/quotes/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cotización
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título / Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Válida hasta</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Proyecto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No hay cotizaciones aún
                </TableCell>
              </TableRow>
            ) : (
              quotes.map((quote) => {
                const isExpired = quote.validUntil && new Date(quote.validUntil) < new Date()
                return (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <Link href={`/quotes/${quote.id}`} className="font-medium hover:underline">
                        {quote.title ?? `Cotización — ${quote.client.company ?? quote.client.name}`}
                      </Link>
                      <p className="text-xs text-muted-foreground">{quote.client.company ?? quote.client.name}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(quote.createdAt).toLocaleDateString('es')}
                    </TableCell>
                    <TableCell className={isExpired ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                      {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('es') : '—'}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${Number(quote.total).toLocaleString('es')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[quote.status]}>
                        {statusLabel[quote.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {quote.items.length} ítems
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
