'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteProject } from '@/actions/projects'
import { Trash2 } from 'lucide-react'

export function DeleteProjectButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    if (!confirm('¿Eliminar este proyecto?')) return
    startTransition(async () => {
      await deleteProject(id)
      router.push('/projects')
    })
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
      <Trash2 className="mr-2 h-4 w-4" />
      {isPending ? 'Eliminando...' : 'Eliminar'}
    </Button>
  )
}
