import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getClientById } from '@/actions/clients'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteClientButton } from '@/components/clients/delete-client-button'
import { Pencil } from 'lucide-react'

const statusLabel: Record<string, string> = { lead: 'Lead', active: 'Activo', inactive: 'Inactivo' }
const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  lead: 'secondary', active: 'default', inactive: 'outline',
}
const priorityLabel: Record<string, string> = { high: 'Alta', medium: 'Media', low: 'Baja' }
const typeLabel: Record<string, string> = { web: 'Web', system: 'Sistema', marketing: 'Marketing', other: 'Otro' }
const quoteStatusLabel: Record<string, string> = { draft: 'Borrador', sent: 'Enviada', approved: 'Aprobada', rejected: 'Rechazada' }
const projectStatusLabel: Record<string, string> = { active: 'Activo', paused: 'Pausado', completed: 'Completado' }
const incomeStatusLabel: Record<string, string> = { pending: 'Pendiente', paid: 'Pagado' }

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = await getClientById(id)

  if (!client) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
          {client.company && (
            <p className="text-muted-foreground">{client.company}</p>
          )}
          <div className="flex gap-2 mt-2">
            <Badge variant={statusVariant[client.status]}>{statusLabel[client.status]}</Badge>
            <Badge variant="outline">{typeLabel[client.type]}</Badge>
            <Badge variant="outline">{priorityLabel[client.priority]}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/clients/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteClientButton id={id} />
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="quotes">Cotizaciones ({client.quotes.length})</TabsTrigger>
          <TabsTrigger value="projects">Proyectos ({client.projects.length})</TabsTrigger>
          <TabsTrigger value="meetings">Reuniones ({client.meetings.length})</TabsTrigger>
          <TabsTrigger value="incomes">Ingresos ({client.incomes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <div className="bg-card rounded-lg border p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{client.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teléfono</p>
              <p className="font-medium">{client.phone ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Responsable</p>
              <p className="font-medium">{client.assignedUser?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Creado</p>
              <p className="font-medium">{new Date(client.createdAt).toLocaleDateString('es')}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quotes" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">Sin cotizaciones</TableCell>
                  </TableRow>
                ) : client.quotes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell>
                      <Link href={`/quotes/${q.id}`} className="hover:underline">
                        {new Date(q.createdAt).toLocaleDateString('es')}
                      </Link>
                    </TableCell>
                    <TableCell>${Number(q.total).toLocaleString('es')}</TableCell>
                    <TableCell><Badge variant="outline">{quoteStatusLabel[q.status]}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Presupuesto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">Sin proyectos</TableCell>
                  </TableRow>
                ) : client.projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/projects/${p.id}`} className="hover:underline font-medium">{p.name}</Link>
                    </TableCell>
                    <TableCell><Badge variant="outline">{projectStatusLabel[p.status]}</Badge></TableCell>
                    <TableCell>{p.budget ? `$${Number(p.budget).toLocaleString('es')}` : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.meetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">Sin reuniones</TableCell>
                  </TableRow>
                ) : client.meetings.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.title}</TableCell>
                    <TableCell>{new Date(m.dateTime).toLocaleDateString('es')}</TableCell>
                    <TableCell><Badge variant="outline">{m.type === 'internal' ? 'Interna' : 'Cliente'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="incomes" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.incomes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">Sin ingresos</TableCell>
                  </TableRow>
                ) : client.incomes.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{new Date(i.date).toLocaleDateString('es')}</TableCell>
                    <TableCell>${Number(i.amount).toLocaleString('es')}</TableCell>
                    <TableCell><Badge variant={i.status === 'paid' ? 'default' : 'secondary'}>{incomeStatusLabel[i.status]}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
