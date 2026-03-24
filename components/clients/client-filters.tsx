'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCallback } from 'react'

export function ClientFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-wrap gap-3">
      <Input
        placeholder="Buscar por nombre o empresa..."
        defaultValue={searchParams.get('q') ?? ''}
        onChange={(e) => updateParam('q', e.target.value)}
        className="max-w-xs"
      />

      <Select
        defaultValue={searchParams.get('status') ?? 'all'}
        onValueChange={(v) => updateParam('status', v)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="lead">Lead</SelectItem>
          <SelectItem value="active">Activo</SelectItem>
          <SelectItem value="inactive">Inactivo</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get('type') ?? 'all'}
        onValueChange={(v) => updateParam('type', v)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="web">Web</SelectItem>
          <SelectItem value="system">Sistema</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="other">Otro</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get('priority') ?? 'all'}
        onValueChange={(v) => updateParam('priority', v)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="high">Alta</SelectItem>
          <SelectItem value="medium">Media</SelectItem>
          <SelectItem value="low">Baja</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
