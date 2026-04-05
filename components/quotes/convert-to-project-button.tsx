'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { convertQuoteToProject } from '@/actions/quotes'
import { FolderPlus, Loader2 } from 'lucide-react'

export function ConvertToProjectButton({
  quoteId,
  hasProject,
  projectId,
}: {
  quoteId: string
  hasProject: boolean
  projectId?: string
}) {
  const [isPending, startTransition] = useTransition()

  if (hasProject && projectId) {
    return (
      <Button asChild size="sm" variant="outline">
        <a href={`/projects/${projectId}`}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Ver Proyecto
        </a>
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        if (!confirm('¿Convertir esta cotización en un proyecto activo?')) return
        startTransition(async () => {
          await convertQuoteToProject(quoteId)
        })
      }}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FolderPlus className="mr-2 h-4 w-4" />
      )}
      {isPending ? 'Creando...' : 'Convertir a Proyecto'}
    </Button>
  )
}
