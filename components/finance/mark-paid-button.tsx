'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { markIncomePaid } from '@/actions/finance'
import { CheckCircle } from 'lucide-react'

export function MarkPaidButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(async () => { await markIncomePaid(id) })}
    >
      <CheckCircle className="h-3.5 w-3.5 mr-1" />
      {isPending ? '...' : 'Marcar pagado'}
    </Button>
  )
}
