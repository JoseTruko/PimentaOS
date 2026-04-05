'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteIncome, deleteExpense } from '@/actions/finance'
import { Trash2 } from 'lucide-react'

export function DeleteFinanceButton({ id, type }: { id: string; type: 'income' | 'expense' }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isPending}
      onClick={() => {
        if (!confirm('¿Eliminar este registro?')) return
        startTransition(async () => {
          if (type === 'income') await deleteIncome(id)
          else await deleteExpense(id)
          router.refresh()
        })
      }}
    >
      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
    </Button>
  )
}
