'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { updateQuoteStatus } from '@/actions/quotes'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function QuoteStatusButton({ id, currentStatus }: { id: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Select
      defaultValue={currentStatus}
      onValueChange={(value) => {
        startTransition(async () => {
          await updateQuoteStatus(id, value)
        })
      }}
      disabled={isPending}
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Borrador</SelectItem>
        <SelectItem value="sent">Enviada</SelectItem>
        <SelectItem value="approved">Aprobada</SelectItem>
        <SelectItem value="rejected">Rechazada</SelectItem>
      </SelectContent>
    </Select>
  )
}
