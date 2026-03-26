'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { changeQuoteStatus, approveQuote } from '@/actions/quotes'
import { CheckCircle, Send, XCircle, RotateCcw } from 'lucide-react'

type Props = {
  quoteId: string
  status: string
}

export function QuoteActions({ quoteId, status }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const run = (fn: () => Promise<void>) =>
    startTransition(async () => { await fn(); router.refresh() })

  if (status === 'approved' || status === 'rejected') {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => run(() => changeQuoteStatus(quoteId, 'draft'))}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Volver a Borrador
      </Button>
    )
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {status === 'draft' && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => changeQuoteStatus(quoteId, 'sent'))}
        >
          <Send className="mr-2 h-4 w-4" />
          Marcar como Enviada
        </Button>
      )}
      {(status === 'draft' || status === 'sent') && (
        <>
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => run(() => approveQuote(quoteId))}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Aprobar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => run(() => changeQuoteStatus(quoteId, 'rejected'))}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rechazar
          </Button>
        </>
      )}
    </div>
  )
}
