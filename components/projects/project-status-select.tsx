'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { changeProjectStatus } from '@/actions/projects'

type Props = { projectId: string; currentStatus: string }

export function ProjectStatusSelect({ projectId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Select
      defaultValue={currentStatus}
      disabled={isPending}
      onValueChange={(status) =>
        startTransition(async () => {
          await changeProjectStatus(projectId, status as 'active' | 'paused' | 'completed')
          router.refresh()
        })
      }
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="active">Activo</SelectItem>
        <SelectItem value="paused">Pausado</SelectItem>
        <SelectItem value="completed">Completado</SelectItem>
      </SelectContent>
    </Select>
  )
}
