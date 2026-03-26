import Link from 'next/link'
import { getQuotes } from '@/actions/quotes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus } from 'lucide-react'

const statusLabel: Record<string, string> = {
  draft: 'Borrador', sent: 'Enviada', approved: 'Aprobada', rejected: 'Rechazada',
}
const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'secondary', sent: 'outline', approved: 'default', rejected: 'destructive',
}

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const quotes = await getQuotes(status ? { status } : undefined)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cotizaciones</h1>
          <p className="text-muted-foreground text-sm">{quotes.length} cotizaciones</p>
        </div>
        <Button asChild>
          <Link href="/quotes/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cotización
          </Link>
        </Button>
      </div>

      {/* Filtros de status */}
      <div className="flex gap-2 flex-wrap">
        {[undefined, 'draft', 'sent', 'approved', 'rejected'].map((s) => (
          <Link
            key={s ?? 'all'}
            href={s ? `/quotes?status=${s}` : '/quotes'}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              status === s || (!status && !s)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {s ? statusLabel[s] : 'Todas'}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Ítems</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No hay cotizaciones
                </TableCell>
              </TableRow>
            ) : quotes.map((q) => (
              <TableRow key={q.id}>
                <TableCell>
                  <Link href={`/quotes/${q.id}`} className="font-medium hover:underline">
                    {q.client.name}
                    {q.client.company && (
                      <span className="text-muted-foreground font-normal"> · {q.client.company}</span>
                    )}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(q.createdAt).toLocaleDateString('es')}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{q.items.length}</TableCell>
                <TableCell className="text-right font-semibold">
                  ${Number(q.total).toLocaleString('es')}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[q.status]}>{statusLabel[q.status]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
