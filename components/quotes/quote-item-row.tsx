'use client'

import { useTransition } from 'react'
import { removeQuoteItem } from '@/actions/quotes'
import { Trash2 } from 'lucide-react'

type Props = {
  quoteId: string
  item: {
    id: string
    description: string
    quantity: number
    unitPrice: number | string
    total: number | string
  }
  locked: boolean
}

export function QuoteItemRow({ quoteId, item, locked }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <tr className={isPending ? 'opacity-50' : ''}>
      <td className="px-4 py-3 text-sm text-foreground">{item.description}</td>
      <td className="px-4 py-3 text-sm text-center text-muted-foreground">{item.quantity}</td>
      <td className="px-4 py-3 text-sm text-right text-muted-foreground">
        ${Number(item.unitPrice).toLocaleString('es')}
      </td>
      <td className="px-4 py-3 text-sm text-right font-medium text-foreground">
        ${Number(item.total).toLocaleString('es')}
      </td>
      {!locked && (
        <td className="px-4 py-3 text-center">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(() => removeQuoteItem(quoteId, item.id))
            }
            className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </td>
      )}
    </tr>
  )
}
