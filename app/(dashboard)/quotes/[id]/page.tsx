import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getQuoteById } from '@/actions/quotes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QuoteItemRow } from '@/components/quotes/quote-item-row'
import { AddItemForm } from '@/components/quotes/add-item-form'
import { QuoteActions } from '@/components/quotes/quote-actions'
import { FileDown, ArrowLeft } from 'lucide-react'

const statusLabel: Record<string, string> = {
  draft: 'Borrador', sent: 'Enviada', approved: 'Aprobada', rejected: 'Rechazada',
}
const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'secondary', sent: 'outline', approved: 'default', rejected: 'destructive',
}

const locked = (status: string) => status === 'approved' || status === 'rejected'

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const quote = await getQuoteById(id)
  if (!quote) notFound()

  const isLocked = locked(quote.status)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link href="/quotes" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Cotizaciones
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {quote.client.name}
            {quote.client.company && (
              <span className="text-muted-foreground font-normal text-lg"> · {quote.client.company}</span>
            )}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant[quote.status]}>{statusLabel[quote.status]}</Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(quote.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button asChild variant="outline" size="sm">
            <a href={`/api/quotes/${id}/pdf`} target="_blank">
              <FileDown className="mr-2 h-4 w-4" />
              PDF
            </a>
          </Button>
          <QuoteActions quoteId={id} status={quote.status} />
        </div>
      </div>

      {/* Proyecto vinculado */}
      {quote.project && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm">
          <span className="text-emerald-700">Proyecto creado:</span>
          <Link href={`/projects/${quote.project.id}`} className="font-medium text-emerald-800 hover:underline">
            {quote.project.name}
          </Link>
        </div>
      )}

      {/* Tabla de ítems */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30">
          <p className="text-sm font-semibold text-foreground">Ítems de la cotización</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="px-4 py-2.5 text-left font-medium">Descripción</th>
              <th className="px-4 py-2.5 text-center font-medium">Cant.</th>
              <th className="px-4 py-2.5 text-right font-medium">Precio unit.</th>
              <th className="px-4 py-2.5 text-right font-medium">Total</th>
              {!isLocked && <th className="px-4 py-2.5" />}
            </tr>
          </thead>
          <tbody className="divide-y">
            {quote.items.length === 0 ? (
              <tr>
                <td colSpan={isLocked ? 4 : 5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Sin ítems aún
                </td>
              </tr>
            ) : quote.items.map((item) => (
              <QuoteItemRow
                key={item.id}
                quoteId={id}
                item={{
                  id: item.id,
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: Number(item.unitPrice),
                  total: Number(item.total),
                }}
                locked={isLocked}
              />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/20">
              <td colSpan={isLocked ? 3 : 4} className="px-4 py-3 text-sm font-semibold text-right text-foreground">
                Total
              </td>
              <td className="px-4 py-3 text-right font-bold text-lg text-foreground">
                ${Number(quote.total).toLocaleString('es')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Agregar ítem */}
      {!isLocked && <AddItemForm quoteId={id} />}
    </div>
  )
}
