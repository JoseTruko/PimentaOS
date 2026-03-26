import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { updateProject } from '@/actions/projects'
import { ProjectForm } from '@/components/projects/project-form'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [project, clients, users] = await Promise.all([
    prisma.project.findFirst({ where: { id, deletedAt: null } }),
    prisma.client.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, company: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!project) notFound()

  const updateProjectWithId = updateProject.bind(null, id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Editar Proyecto</h1>
        <p className="text-muted-foreground text-sm">{project.name}</p>
      </div>
      <ProjectForm action={updateProjectWithId} clients={clients} users={users} project={project} />
    </div>
  )
}
