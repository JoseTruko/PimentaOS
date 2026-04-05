import Link from 'next/link'
import { getProjects } from '@/actions/projects'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProjectFilters } from '@/components/projects/project-filters'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { prisma } from '@/lib/prisma'
import { Plus, Clock } from 'lucide-react'

const statusLabel: Record<string, string> = { active: 'Activo', paused: 'Pausado', completed: 'Completado' }
const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default', paused: 'secondary', completed: 'outline',
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; clientId?: string; assignedUserId?: string }>
}) {
  const params = await searchParams
  const [projects, clients, users] = await Promise.all([
    getProjects(params),
    prisma.client.findMany({ where: { deletedAt: null }, select: { id: true, name: true, company: true }, orderBy: { name: 'asc' } }),
    prisma.user.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proyectos</h1>
          <p className="text-muted-foreground text-sm mt-1">{projects.length} proyectos encontrados</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
          </Link>
        </Button>
      </div>

      <ProjectFilters users={users} clients={clients} />

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead>Presupuesto</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Fecha fin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No hay proyectos aún
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Link href={`/clients/${project.client.id}`} className="hover:underline">
                      {project.client.company ?? project.client.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[project.status]}>{statusLabel[project.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-7 text-right">{project.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.budget ? `$${Number(project.budget).toLocaleString('es')}` : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.assignedUser?.name ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.endDate ? (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(project.endDate).toLocaleDateString('es')}
                      </span>
                    ) : '—'}
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
