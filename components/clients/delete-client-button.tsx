'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteClient } from '@/actions/clients'
import { Trash2 } from 'lucide-react'

export function DeleteClientButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) return
    startTransition(async () => {
      await deleteClient(id)
      router.push('/clients')
    })
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isPending ? 'Eliminando...' : 'Eliminar'}
    </Button>
  )
}
