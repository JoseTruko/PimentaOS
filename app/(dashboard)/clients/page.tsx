import Link from 'next/link'
import { getClients } from '@/actions/clients'
import { ClientFilters } from '@/components/clients/client-filters'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus } from 'lucide-react'

const statusLabel: Record<string, string> = {
  lead: 'Lead',
  active: 'Activo',
  inactive: 'Inactivo',
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  lead: 'secondary',
  active: 'default',
  inactive: 'outline',
}

const priorityLabel: Record<string, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

const typeLabel: Record<string, string> = {
  web: 'Web',
  system: 'Sistema',
  marketing: 'Marketing',
  other: 'Otro',
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; priority?: string; q?: string }>
}) {
  const params = await searchParams
  const clients = await getClients(params)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">{clients.length} clientes encontrados</p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>

      <ClientFilters />

      <div className="rounded-lg border bg-card">
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
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
                    <Badge variant={statusVariant[client.status]}>
                      {statusLabel[client.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{typeLabel[client.type]}</TableCell>
                  <TableCell className="text-muted-foreground">{priorityLabel[client.priority]}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.assignedUser?.name ?? '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
