import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProjectById } from '@/actions/projects'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { DeleteProjectButton } from '@/components/projects/delete-project-button'
import { ProjectTasks } from '@/components/projects/project-tasks'
import { Pencil, ExternalLink } from 'lucide-react'

const statusLabel: Record<string, string> = { active: 'Activo', paused: 'Pausado', completed: 'Completado' }
const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default', paused: 'secondary', completed: 'outline',
}
const incomeStatusLabel: Record<string, string> = { pending: 'Pendiente', paid: 'Pagado' }

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            <Link href={`/clients/${project.client.id}`} className="hover:underline">
              {project.client.company ?? project.client.name}
            </Link>
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant={statusVariant[project.status]}>{statusLabel[project.status]}</Badge>
            {project.budget && (
              <Badge variant="outline">${Number(project.budget).toLocaleString('es')}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/projects/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Link>
          </Button>
          <DeleteProjectButton id={id} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-card rounded-xl border p-5 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Progreso general</span>
          <span className="font-bold text-primary">{project.progress}%</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{project.tasks.filter(t => t.done).length} de {project.tasks.length} tareas completadas</span>
          {project.endDate && (
            <span>Entrega: {new Date(project.endDate).toLocaleDateString('es', { dateStyle: 'medium' })}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-card rounded-xl border p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Responsable</p>
          <p className="font-medium text-sm mt-0.5">{project.assignedUser?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Fecha inicio</p>
          <p className="font-medium text-sm mt-0.5">
            {project.startDate ? new Date(project.startDate).toLocaleDateString('es') : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Fecha fin</p>
          <p className="font-medium text-sm mt-0.5">
            {project.endDate ? new Date(project.endDate).toLocaleDateString('es') : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Presupuesto</p>
          <p className="font-medium text-sm mt-0.5">
            {project.budget ? `$${Number(project.budget).toLocaleString('es')}` : '—'}
          </p>
        </div>
        {project.jiraUrl && (
          <div className="col-span-2 md:col-span-4">
            <p className="text-xs text-muted-foreground">Jira</p>
            <a href={project.jiraUrl} target="_blank" rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1 mt-0.5">
              {project.jiraUrl} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tareas ({project.tasks.length})</TabsTrigger>
          <TabsTrigger value="incomes">Ingresos ({project.incomes.length})</TabsTrigger>
          {project.quote && <TabsTrigger value="quote">Cotización</TabsTrigger>}
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <div className="bg-card rounded-xl border p-5">
            <ProjectTasks
              projectId={id}
              tasks={project.tasks}
              progress={project.progress}
            />
          </div>
        </TabsContent>

        <TabsContent value="incomes" className="mt-4">
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pagado el</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.incomes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Sin ingresos registrados
                    </TableCell>
                  </TableRow>
                ) : project.incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>{new Date(income.date).toLocaleDateString('es')}</TableCell>
                    <TableCell className="font-medium">${Number(income.amount).toLocaleString('es')}</TableCell>
                    <TableCell>
                      <Badge variant={income.status === 'paid' ? 'default' : 'secondary'}>
                        {incomeStatusLabel[income.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {income.paidAt ? new Date(income.paidAt).toLocaleDateString('es') : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {project.quote && (
          <TabsContent value="quote" className="mt-4">
            <div className="bg-card rounded-xl border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">
                  {project.quote.title ?? `Cotización del ${new Date(project.quote.createdAt).toLocaleDateString('es')}`}
                </p>
                <Link href={`/quotes/${project.quote.id}`} className="text-xs text-primary hover:underline">
                  Ver detalle →
                </Link>
              </div>
              <p className="text-2xl font-bold text-foreground">${Number(project.quote.total).toLocaleString('es')}</p>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Cant.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.quote.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${Number(item.total).toLocaleString('es')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
