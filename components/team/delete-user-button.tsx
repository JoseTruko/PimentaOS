'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteUser } from '@/actions/team'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DeleteUserButton({ id, isSelf }: { id: string; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (isSelf) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!confirm('¿Eliminar este miembro del equipo?')) return
        startTransition(async () => {
          await deleteUser(id)
          router.refresh()
        })
      }}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
