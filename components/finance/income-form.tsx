'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createIncome } from '@/actions/finance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

type Project = { id: string; name: string; clientId: string; client: { id: string; name: string } }

export function IncomeForm({ projects }: { projects: Project[] }) {
  const [state, formAction, pending] = useActionState(createIncome, {})
  const router = useRouter()

  useEffect(() => {
    if (state.message && !state.errors) router.refresh()
  }, [state, router])

  const today = new Date().toISOString().split('T')[0]

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="projectId">Proyecto *</Label>
          <Select name="projectId" required>
            <SelectTrigger id="projectId">
              <SelectValue placeholder="Seleccionar proyecto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.projectId && <p className="text-xs text-destructive">{state.errors.projectId[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientId">Cliente *</Label>
          <Select name="clientId" required>
            <SelectTrigger id="clientId">
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {[...new Map(projects.map((p) => [p.client.id, p.client])).values()].map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.clientId && <p className="text-xs text-destructive">{state.errors.clientId[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Monto *</Label>
          <Input id="amount" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required />
          {state.errors?.amount && <p className="text-xs text-destructive">{state.errors.amount[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Fecha *</Label>
          <Input id="date" name="date" type="date" defaultValue={today} required />
          {state.errors?.date && <p className="text-xs text-destructive">{state.errors.date[0]}</p>}
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Registrando...' : 'Registrar Ingreso'}
      </Button>
    </form>
  )
}
