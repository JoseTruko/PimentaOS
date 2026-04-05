import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getQuoteById } from '@/actions/quotes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { QuoteStatusButton } from '@/components/quotes/quote-status-button'
import { DeleteQuoteButton } from '@/components/quotes/delete-quote-button'
import { ConvertToProjectButton } from '@/components/quotes/convert-to-project-button'
import { CalendarClock, Download } from 'lucide-react'

const statusLabel: Record<string, string> = {
  draft: 'Borrador', sent: 'Enviada', approved: 'Aprobada', rejected: 'Rechazada',
}
const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary', sent: 'outline', approved: 'default', rejected: 'outline',
}

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const quote = await getQuoteById(id)
  if (!quote) notFound()

  const isExpired = quote.validUntil && new Date(quote.validUntil) < new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {quote.title ?? `Cotización — ${quote.client.company ?? quote.client.name}`}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            <Link href={`/clients/${quote.client.id}`} className="hover:underline">
              {quote.client.name}
            </Link>
            {' · '}
            {new Date(quote.createdAt).toLocaleDateString('es', { dateStyle: 'long' })}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant={statusVariant[quote.status]}>{statusLabel[quote.status]}</Badge>
            {quote.validUntil && (
              <span className={`flex items-center gap-1 text-xs font-medium ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
                <CalendarClock className="h-3.5 w-3.5" />
                {isExpired ? 'Venció el' : 'Válida hasta'}{' '}
                {new Date(quote.validUntil).toLocaleDateString('es')}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end shrink-0">
          <ConvertToProjectButton
            quoteId={id}
            hasProject={!!quote.project}
            projectId={quote.project?.id}
          />
          <Button asChild size="sm" variant="outline">
            <a href={`/quotes/${id}/pdf`} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" /> Exportar
            </a>
          </Button>
          <QuoteStatusButton id={id} currentStatus={quote.status} />
          <DeleteQuoteButton id={id} />
        </div>
      </div>

      {/* Client info */}
      <div className="bg-card rounded-xl border p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Cliente</p>
          <Link href={`/clients/${quote.client.id}`} className="font-medium text-sm hover:underline mt-0.5 block">
            {quote.client.name}
          </Link>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="font-medium text-sm mt-0.5">{quote.client.email}</p>
        </div>
        {quote.project && (
          <div>
            <p className="text-xs text-muted-foreground">Proyecto</p>
            <Link href={`/projects/${quote.project.id}`} className="font-medium text-sm hover:underline mt-0.5 block">
              {quote.project.name}
            </Link>
          </div>
        )}
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="bg-card rounded-xl border p-5">
          <p className="text-xs text-muted-foreground mb-1">Notas</p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{quote.notes}</p>
        </div>
      )}

      {/* Items */}
      <div className="bg-card rounded-xl border">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-foreground">Ítems</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio unitario</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quote.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">${Number(item.unitPrice).toLocaleString('es')}</TableCell>
                <TableCell className="text-right font-medium">${Number(item.total).toLocaleString('es')}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} className="text-right font-semibold">Total</TableCell>
              <TableCell className="text-right font-bold text-lg text-primary">
                ${Number(quote.total).toLocaleString('es')}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
