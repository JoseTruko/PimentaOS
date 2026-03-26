import Link from 'next/link'
import { getProjects } from '@/actions/projects'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ExternalLink } from 'lucide-react'

const statusLabel: Record<string, string> = {
  active: 'Activo', paused: 'Pausado', completed: 'Completado',
}
const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default', paused: 'secondary', completed: 'outline',
}
const statusColor: Record<string, string> = {
  active: 'bg-emerald-50 border-emerald-200',
  paused: 'bg-amber-50 border-amber-200',
  completed: 'bg-muted border-border',
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const params = await searchParams
  const projects = await getProjects(params)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proyectos</h1>
          <p className="text-muted-foreground text-sm">{projects.length} proyectos</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proyecto
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[undefined, 'active', 'paused', 'completed'].map((s) => (
          <Link
            key={s ?? 'all'}
            href={s ? `/projects?status=${s}` : '/projects'}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              params.status === s || (!params.status && !s)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {s ? statusLabel[s] : 'Todos'}
          </Link>
        ))}
      </div>

      {/* Grid de proyectos */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border">
          <p className="text-sm font-medium text-foreground">Sin proyectos</p>
          <p className="text-xs text-muted-foreground mt-1">Crea uno manualmente o aprueba una cotización</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className={`group block rounded-xl border p-5 hover:shadow-md transition-all ${statusColor[project.status]}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {project.name}
                </h3>
                <Badge variant={statusVariant[project.status]} className="shrink-0">
                  {statusLabel[project.status]}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {project.client.name}
                {project.client.company && ` · ${project.client.company}`}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{project.assignedUser?.name ?? 'Sin asignar'}</span>
                <div className="flex items-center gap-2">
                  {project.budget && (
                    <span className="font-medium text-foreground">
                      ${Number(project.budget).toLocaleString('es')}
                    </span>
                  )}
                  {project.jiraUrl && (
                    <ExternalLink className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
