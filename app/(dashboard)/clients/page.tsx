import Link from 'next/link'
import { getClients } from '@/actions/clients'
import { ClientFilters } from '@/components/clients/client-filters'
import { ClientKanban } from '@/components/clients/client-kanban'
import { ClientViewToggle } from '@/components/clients/client-view-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus } from 'lucide-react'

const statusLabel: Record<string, string> = { lead: 'Lead', active: 'Activo', inactive: 'Inactivo' }
const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  lead: 'secondary', active: 'default', inactive: 'outline',
}
const priorityLabel: Record<string, string> = { high: 'Alta', medium: 'Media', low: 'Baja' }
const typeLabel: Record<string, string> = { web: 'Web', system: 'Sistema', marketing: 'Marketing', other: 'Otro' }

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; priority?: string; q?: string; view?: string }>
}) {
  const params = await searchParams
  const clients = await getClients(params)
  const view = params.view ?? 'kanban'

  const kanbanColumns = [
    { id: 'lead', label: 'Leads', color: 'bg-amber-400', clients: clients.filter(c => c.status === 'lead') },
    { id: 'active', label: 'Activos', color: 'bg-emerald-500', clients: clients.filter(c => c.status === 'active') },
    { id: 'inactive', label: 'Inactivos', color: 'bg-muted-foreground', clients: clients.filter(c => c.status === 'inactive') },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">{clients.length} clientes encontrados</p>
        </div>
        <div className="flex items-center gap-2">
          <ClientViewToggle currentView={view} />
          <Button asChild>
            <Link href="/clients/new">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
            </Link>
          </Button>
        </div>
      </div>

      <ClientFilters />

      {view === 'kanban' ? (
        <ClientKanban columns={kanbanColumns} />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Responsable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    No se encontraron clientes
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link href={`/clients/${client.id}`} className="font-medium hover:underline">
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{client.company ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{client.email}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[client.status]}>{statusLabel[client.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{typeLabel[client.type]}</TableCell>
                    <TableCell className="text-muted-foreground">{priorityLabel[client.priority]}</TableCell>
                    <TableCell className="text-muted-foreground">{client.assignedUser?.name ?? '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
