'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { updateClientStatus } from '@/actions/clients'
import { Badge } from '@/components/ui/badge'

type Client = {
  id: string
  name: string
  company: string | null
  email: string
  priority: string
  type: string
  assignedUser: { name: string } | null
}

type Column = { id: string; label: string; color: string; clients: Client[] }

const priorityColor: Record<string, string> = {
  high: 'text-rose-500', medium: 'text-amber-500', low: 'text-emerald-500',
}
const priorityLabel: Record<string, string> = { high: 'Alta', medium: 'Media', low: 'Baja' }
const typeLabel: Record<string, string> = { web: 'Web', system: 'Sistema', marketing: 'Marketing', other: 'Otro' }

function KanbanCard({ client, targetStatus }: { client: Client; targetStatus: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className={`bg-card border rounded-xl p-3 space-y-2 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <Link href={`/clients/${client.id}`} className="font-medium text-sm text-foreground hover:underline leading-tight">
          {client.name}
        </Link>
        <span className={`text-[10px] font-semibold shrink-0 ${priorityColor[client.priority]}`}>
          {priorityLabel[client.priority]}
        </span>
      </div>
      {client.company && (
        <p className="text-xs text-muted-foreground truncate">{client.company}</p>
      )}
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className="text-[10px]">{typeLabel[client.type]}</Badge>
        {client.assignedUser && (
          <span className="text-[10px] text-muted-foreground truncate">{client.assignedUser.name}</span>
        )}
      </div>
      {/* Quick move buttons */}
      <div className="flex gap-1 pt-1 border-t">
        {targetStatus !== 'lead' && (
          <button
            onClick={() => startTransition(() => updateClientStatus(client.id, 'lead'))}
            className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors"
          >← Lead</button>
        )}
        {targetStatus !== 'active' && (
          <button
            onClick={() => startTransition(() => updateClientStatus(client.id, 'active'))}
            className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors"
          >Activo</button>
        )}
        {targetStatus !== 'inactive' && (
          <button
            onClick={() => startTransition(() => updateClientStatus(client.id, 'inactive'))}
            className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors ml-auto"
          >Inactivo →</button>
        )}
      </div>
    </div>
  )
}

export function ClientKanban({ columns }: { columns: Column[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {columns.map((col) => (
        <div key={col.id} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${col.color}`} />
            <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
            <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {col.clients.length}
            </span>
          </div>
          <div className="space-y-2 min-h-[120px]">
            {col.clients.length === 0 ? (
              <div className="border border-dashed rounded-xl p-4 text-center text-xs text-muted-foreground">
                Sin clientes
              </div>
            ) : (
              col.clients.map((client) => (
                <KanbanCard key={client.id} client={client} targetStatus={col.id} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
