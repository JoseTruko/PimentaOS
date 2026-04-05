'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { TeamFormState } from '@/actions/team'

type User = { id: string; name: string; email: string; role: string }

type Props = {
  action: (prevState: TeamFormState, formData: FormData) => Promise<TeamFormState>
  user?: User
}

export function UserForm({ action, user }: Props) {
  const [state, formAction, pending] = useActionState(action, {})
  const router = useRouter()

  useEffect(() => {
    if (state.message && !state.errors) router.push('/team')
  }, [state, router])

  return (
    <form action={formAction} className="space-y-5 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" name="name" defaultValue={user?.name} required />
        {state.errors?.name && <p className="text-xs text-destructive">{state.errors.name[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" defaultValue={user?.email} required />
        {state.errors?.email && <p className="text-xs text-destructive">{state.errors.email[0]}</p>}
      </div>

      {!user && (
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña *</Label>
          <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
          {state.errors?.password && <p className="text-xs text-destructive">{state.errors.password[0]}</p>}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="role">Rol *</Label>
        <Select name="role" defaultValue={user?.role ?? 'member'}>
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Miembro</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
        {state.errors?.role && <p className="text-xs text-destructive">{state.errors.role[0]}</p>}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : user ? 'Actualizar Usuario' : 'Crear Usuario'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
