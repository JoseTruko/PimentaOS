'use client'

import { useActionState, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createIncome } from '@/actions/finance'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Project = { id: string; name: string; client: { id: string; name: string } }
type Client = { id: string; name: string }

export function AddIncomeButton({ projects, clients: allClients }: { projects: Project[]; clients: Client[] }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'project' | 'other'>('project')
  const [state, formAction, pending] = useActionState(createIncome, {})
  const router = useRouter()

  useEffect(() => {
    if (state.message && !state.errors) {
      setOpen(false)
      setType('project')
      router.refresh()
    }
  }, [state, router])

  const projectClients = [...new Map(projects.map(p => [p.client.id, p.client])).values()]

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Ingreso
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl border p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Registrar Ingreso</h2>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          {/* Tipo de ingreso */}
          <div className="space-y-2">
            <Label>Tipo de ingreso</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('project')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  type === 'project'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-input hover:bg-muted'
                }`}
              >
                Proyecto
              </button>
              <button
                type="button"
                onClick={() => setType('other')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  type === 'other'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-input hover:bg-muted'
                }`}
              >
                Otro
              </button>
            </div>
          </div>

          {type === 'project' ? (
            <>
              <div className="space-y-2">
                <Label>Proyecto</Label>
                <Select name="projectId" defaultValue="none">
                  <SelectTrigger className="w-full"><SelectValue placeholder="Seleccionar proyecto" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin proyecto</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select name="clientId" defaultValue="none">
                  <SelectTrigger className="w-full"><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin cliente</SelectItem>
                    {projectClients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Descripción *</Label>
                <Input name="description" placeholder="Ej: Consultoría, venta de activo..." required />
                {state.errors?.description && <p className="text-xs text-destructive">{state.errors.description[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label>Cliente <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                <Select name="clientId" defaultValue="none">
                  <SelectTrigger className="w-full"><SelectValue placeholder="Sin cliente" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin cliente</SelectItem>
                    {allClients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Monto *</Label>
            <Input name="amount" type="number" min="0" step="0.01" placeholder="0.00" required />
            {state.errors?.amount && <p className="text-xs text-destructive">{state.errors.amount[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select name="status" defaultValue="pending">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? 'Guardando...' : 'Registrar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
