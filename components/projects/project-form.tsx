'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { ProjectFormState } from '@/actions/projects'

type Client = { id: string; name: string; company: string | null }
type User = { id: string; name: string }

type Project = {
  id: string
  name: string
  clientId: string
  assignedUserId: string | null
  jiraUrl: string | null
  status: string
  budget: unknown
  startDate: Date | null
  endDate: Date | null
}

type Props = {
  action: (prevState: ProjectFormState, formData: FormData) => Promise<ProjectFormState>
  clients: Client[]
  users: User[]
  project?: Project
}

function toDateInput(date: Date | null | undefined) {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

export function ProjectForm({ action, clients, users, project }: Props) {
  const [state, formAction, pending] = useActionState(action, {})
  const router = useRouter()

  useEffect(() => {
    if (state.message && !state.errors) {
      router.push('/projects')
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="name">Nombre del proyecto *</Label>
          <Input id="name" name="name" defaultValue={project?.name} required />
          {state.errors?.name && <p className="text-xs text-destructive">{state.errors.name[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientId">Cliente *</Label>
          <Select name="clientId" defaultValue={project?.clientId ?? ''} required>
            <SelectTrigger id="clientId">
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}{c.company ? ` · ${c.company}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.clientId && <p className="text-xs text-destructive">{state.errors.clientId[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignedUserId">Responsable</Label>
          <Select name="assignedUserId" defaultValue={project?.assignedUserId ?? 'none'}>
            <SelectTrigger id="assignedUserId">
              <SelectValue placeholder="Sin asignar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin asignar</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Estado *</Label>
          <Select name="status" defaultValue={project?.status ?? 'active'}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Presupuesto</Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            min="0"
            step="0.01"
            defaultValue={project?.budget ? String(project.budget) : ''}
            placeholder="0.00"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="jiraUrl">URL de Jira</Label>
          <Input
            id="jiraUrl"
            name="jiraUrl"
            type="url"
            defaultValue={project?.jiraUrl ?? ''}
            placeholder="https://tu-empresa.atlassian.net/browse/..."
          />
          {state.errors?.jiraUrl && <p className="text-xs text-destructive">{state.errors.jiraUrl[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha de inicio</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={toDateInput(project?.startDate)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha de fin</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={toDateInput(project?.endDate)}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : project ? 'Actualizar Proyecto' : 'Crear Proyecto'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
