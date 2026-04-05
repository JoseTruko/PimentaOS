'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { MeetingFormState } from '@/actions/meetings'

type User = { id: string; name: string }
type Client = { id: string; name: string; company: string | null }
type Meeting = {
  id: string
  title: string
  type: string
  clientId: string | null
  dateTime: Date
  meetingLink: string | null
  notes: string | null
  participants: { user: { id: string } }[]
}

type Props = {
  action: (prevState: MeetingFormState, formData: FormData) => Promise<MeetingFormState>
  users: User[]
  clients: Client[]
  meeting?: Meeting
}

function toDateTimeLocal(date: Date) {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function MeetingForm({ action, users, clients, meeting }: Props) {
  const [state, formAction, pending] = useActionState(action, {})
  const router = useRouter()
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    meeting?.participants.map((p) => p.user.id) ?? []
  )

  useEffect(() => {
    if (state.message && !state.errors) router.push('/meetings')
  }, [state, router])

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input id="title" name="title" defaultValue={meeting?.title} required />
          {state.errors?.title && <p className="text-xs text-destructive">{state.errors.title[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo *</Label>
          <Select name="type" defaultValue={meeting?.type ?? 'internal'}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">Interna</SelectItem>
              <SelectItem value="client">Con cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientId">Cliente (opcional)</Label>
          <Select name="clientId" defaultValue={meeting?.clientId ?? 'none'}>
            <SelectTrigger id="clientId">
              <SelectValue placeholder="Sin cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin cliente</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}{c.company ? ` · ${c.company}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTime">Fecha y hora *</Label>
          <Input
            id="dateTime"
            name="dateTime"
            type="datetime-local"
            defaultValue={meeting ? toDateTimeLocal(meeting.dateTime) : ''}
            required
          />
          {state.errors?.dateTime && <p className="text-xs text-destructive">{state.errors.dateTime[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="meetingLink">Link de reunión</Label>
          <Input
            id="meetingLink"
            name="meetingLink"
            type="url"
            defaultValue={meeting?.meetingLink ?? ''}
            placeholder="https://meet.google.com/..."
          />
          {state.errors?.meetingLink && <p className="text-xs text-destructive">{state.errors.meetingLink[0]}</p>}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <textarea
            id="notes"
            name="notes"
            defaultValue={meeting?.notes ?? ''}
            rows={3}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            placeholder="Agenda, temas a tratar..."
          />
        </div>

        {/* Participantes */}
        <div className="md:col-span-2 space-y-2">
          <Label>Participantes *</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {users.map((user) => {
              const selected = selectedParticipants.includes(user.id)
              return (
                <label
                  key={user.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                    selected
                      ? 'bg-accent border-primary/30 text-foreground'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <input
                    type="checkbox"
                    name="participantIds"
                    value={user.id}
                    checked={selected}
                    onChange={() => toggleParticipant(user.id)}
                    className="sr-only"
                  />
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name}
                </label>
              )
            })}
          </div>
          {state.errors?.participantIds && (
            <p className="text-xs text-destructive">{state.errors.participantIds[0]}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : meeting ? 'Actualizar Reunión' : 'Crear Reunión'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
