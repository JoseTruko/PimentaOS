'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markIncomePaid } from '@/actions/finance'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export function MarkPaidButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await markIncomePaid(id)
          router.refresh()
        })
      }
      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
    >
      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
      {isPending ? 'Marcando...' : 'Marcar pagado'}
    </Button>
  )
}
