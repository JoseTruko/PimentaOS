'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteMeeting } from '@/actions/meetings'
import { Trash2 } from 'lucide-react'

export function DeleteMeetingButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (!confirm('¿Eliminar esta reunión?')) return
        startTransition(async () => {
          await deleteMeeting(id)
          router.refresh()
        })
      }}
      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}
