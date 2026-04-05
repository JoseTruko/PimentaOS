'use client'

import { useActionState, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createUser } from '@/actions/team'
import { UserPlus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function NewUserButton() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createUser, {})
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
        <UserPlus className="h-4 w-4 mr-1" /> Nuevo Miembro
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl border p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Nuevo Miembro del Equipo</h2>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input name="name" placeholder="Nombre completo" required />
            {state.errors?.name && <p className="text-xs text-destructive">{state.errors.name[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input name="email" type="email" placeholder="correo@ejemplo.com" required />
            {state.errors?.email && <p className="text-xs text-destructive">{state.errors.email[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>Contraseña *</Label>
            <Input name="password" type="password" placeholder="Mínimo 6 caracteres" required />
            {state.errors?.password && <p className="text-xs text-destructive">{state.errors.password[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>Rol *</Label>
            <Select name="role" defaultValue="member">
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Miembro</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? 'Creando...' : 'Crear Miembro'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
