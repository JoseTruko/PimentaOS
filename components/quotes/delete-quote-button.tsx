'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteQuote } from '@/actions/quotes'
import { Trash2 } from 'lucide-react'

export function DeleteQuoteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!confirm('¿Eliminar esta cotización?')) return
        startTransition(async () => {
          await deleteQuote(id)
          router.push('/quotes')
        })
      }}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isPending ? 'Eliminando...' : 'Eliminar'}
    </Button>
  )
}
