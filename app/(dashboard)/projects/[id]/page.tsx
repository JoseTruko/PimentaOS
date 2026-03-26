import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProjectById } from '@/actions/projects'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProjectStatusSelect } from '@/components/projects/project-status-select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pencil, ExternalLink, ArrowLeft, Calendar, DollarSign, User } from 'lucide-react'

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

  const totalIncome = project.incomes.reduce((sum, i) => sum + Number(i.amount), 0)
  const paidIncome = project.incomes
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + Number(i.amount), 0)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link href="/projects" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Proyectos
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-muted-foreground text-sm">
            {project.client.name}{project.client.company ? ` · ${project.client.company}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ProjectStatusSelect projectId={id} currentStatus={project.status} />
          <Button asChild size="sm" variant="outline">
            <Link href={`/projects/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium">Presupuesto</span>
          </div>
          <p className="font-bold text-foreground">
            {project.budget ? `$${Number(project.budget).toLocaleString('es')}` : '—'}
          </p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <User className="h-4 w-4" />
            <span className="text-xs font-medium">Responsable</span>
          </div>
          <p className="font-bold text-foreground">{project.assignedUser?.name ?? '—'}</p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium">Inicio</span>
          </div>
          <p className="font-bold text-foreground">
            {project.startDate ? new Date(project.startDate).toLocaleDateString('es') : '—'}
          </p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium">Fin</span>
          </div>
          <p className="font-bold text-foreground">
            {project.endDate ? new Date(project.endDate).toLocaleDateString('es') : '—'}
          </p>
        </div>
      </div>

      {/* Jira link */}
      {project.jiraUrl && (
        <a
          href={project.jiraUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          Ver en Jira
        </a>
      )}

      {/* Cotización vinculada */}
      {project.quote && (
        <div className="flex items-center gap-3 bg-accent rounded-xl border border-primary/20 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Cotización origen:</span>
          <Link href={`/quotes/${project.quote.id}`} className="font-medium text-primary hover:underline">
            ${Number(project.quote.total).toLocaleString('es')}
          </Link>
          <Badge variant="outline" className="text-xs">{project.quote.status}</Badge>
        </div>
      )}

      {/* Ingresos */}
      <div className="bg-card rounded-xl border">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Ingresos</h2>
          <div className="text-sm text-muted-foreground">
            Cobrado: <span className="font-semibold text-foreground">${paidIncome.toLocaleString('es')}</span>
            {' / '}
            Total: <span className="font-semibold text-foreground">${totalIncome.toLocaleString('es')}</span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.incomes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  Sin ingresos registrados
                </TableCell>
              </TableRow>
            ) : project.incomes.map((income) => (
              <TableRow key={income.id}>
                <TableCell className="text-sm">{new Date(income.date).toLocaleDateString('es')}</TableCell>
                <TableCell className="text-right font-semibold">${Number(income.amount).toLocaleString('es')}</TableCell>
                <TableCell>
                  <Badge variant={income.status === 'paid' ? 'default' : 'secondary'}>
                    {incomeStatusLabel[income.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
