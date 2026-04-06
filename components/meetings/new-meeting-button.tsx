'use client'

import { useActionState, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createMeeting } from '@/actions/meetings'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Client = { id: string; name: string }
type User = { id: string; name: string }

export function NewMeetingButton({ clients, users }: { clients: Client[]; users: User[] }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createMeeting, {})
  const router = useRouter()

  useEffect(() => {
    if (state.message && !state.errors) {
      setOpen(false)
      router.refresh()
    }
  }, [state, router])

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" /> Nueva Reunión
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl border p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Nueva Reunión</h2>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input name="title" placeholder="Ej: Revisión de proyecto" required />
            {state.errors?.title && <p className="text-xs text-destructive">{state.errors.title[0]}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select name="type" defaultValue="internal">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Interna</SelectItem>
                  <SelectItem value="client">Con cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha y hora *</Label>
              <Input name="dateTime" type="datetime-local" required />
              {state.errors?.dateTime && <p className="text-xs text-destructive">{state.errors.dateTime[0]}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select name="clientId" defaultValue="none">
              <SelectTrigger className="w-full"><SelectValue placeholder="Sin cliente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin cliente</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Participantes</Label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto rounded-lg border p-2">
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded">
                  <input type="checkbox" name="participantIds" value={u.id} className="accent-primary" />
                  <span className="text-sm">{u.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Link de reunión</Label>
            <Input name="meetingLink" type="url" placeholder="https://meet.google.com/..." />
            {state.errors?.meetingLink && <p className="text-xs text-destructive">{state.errors.meetingLink[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Notas adicionales..."
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? 'Guardando...' : 'Crear Reunión'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
