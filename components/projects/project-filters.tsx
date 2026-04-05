'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCallback } from 'react'

type User = { id: string; name: string }
type Client = { id: string; name: string; company: string | null }

export function ProjectFilters({ users, clients }: { users: User[]; clients: Client[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  return (
    <div className="flex flex-wrap gap-3">
      <Input
        placeholder="Buscar proyecto..."
        defaultValue={searchParams.get('q') ?? ''}
        onChange={(e) => update('q', e.target.value)}
        className="max-w-xs"
      />
      <Select defaultValue={searchParams.get('status') ?? 'all'} onValueChange={(v) => update('status', v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Estado" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Activo</SelectItem>
          <SelectItem value="paused">Pausado</SelectItem>
          <SelectItem value="completed">Completado</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue={searchParams.get('clientId') ?? 'all'} onValueChange={(v) => update('clientId', v)}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Cliente" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los clientes</SelectItem>
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}{c.company ? ` — ${c.company}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select defaultValue={searchParams.get('assignedUserId') ?? 'all'} onValueChange={(v) => update('assignedUserId', v)}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Responsable" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
