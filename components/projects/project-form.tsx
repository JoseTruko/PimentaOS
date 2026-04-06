'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ProjectFormState } from '@/actions/projects'

type Client = { id: string; name: string; company: string | null }
type User = { id: string; name: string }
type Project = {
  id: string; name: string; clientId: string; assignedUserId: string | null
  status: string; budget: unknown; startDate: string | Date | null; endDate: string | Date | null
  jiraUrl: string | null
}

type Props = {
  action: (prevState: ProjectFormState, formData: FormData) => Promise<ProjectFormState>
  clients: Client[]
  users: User[]
  project?: Project
}

export function ProjectForm({ action, clients, users, project }: Props) {
  const [state, formAction, pending] = useActionState(action, {})
  const router = useRouter()

  useEffect(() => {
    if (state.message && !state.errors) router.push('/projects')
  }, [state, router])

  const toDateInput = (d: string | Date | null | undefined) => {
    if (!d) return ''
    if (typeof d === 'string') return d.split('T')[0]
    return d.toISOString().split('T')[0]
  }

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" name="name" defaultValue={project?.name} required />
          {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientId">Cliente *</Label>
          <Select name="clientId" defaultValue={project?.clientId ?? ''}>
            <SelectTrigger id="clientId" className="w-full">
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}{c.company ? ` — ${c.company}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.clientId && <p className="text-sm text-destructive">{state.errors.clientId[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Estado *</Label>
          <Select name="status" defaultValue={project?.status ?? 'active'}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignedUserId">Responsable</Label>
          <Select name="assignedUserId" defaultValue={project?.assignedUserId ?? 'none'}>
            <SelectTrigger id="assignedUserId" className="w-full">
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
          <Label htmlFor="budget">Presupuesto</Label>
          <Input id="budget" name="budget" type="number" step="0.01" min="0"
            defaultValue={project?.budget ? String(project.budget) : ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha inicio</Label>
          <Input id="startDate" name="startDate" type="date" defaultValue={toDateInput(project?.startDate ?? null)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha fin</Label>
          <Input id="endDate" name="endDate" type="date" defaultValue={toDateInput(project?.endDate ?? null)} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="jiraUrl">URL de Jira</Label>
          <Input id="jiraUrl" name="jiraUrl" type="url" placeholder="https://..." defaultValue={project?.jiraUrl ?? ''} />
          {state.errors?.jiraUrl && <p className="text-sm text-destructive">{state.errors.jiraUrl[0]}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : project ? 'Actualizar Proyecto' : 'Crear Proyecto'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  )
}
