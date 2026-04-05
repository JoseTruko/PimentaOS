import { prisma } from '@/lib/prisma'
import { createProject } from '@/actions/projects'
import { ProjectForm } from '@/components/projects/project-form'

export default async function NewProjectPage() {
  const [clients, users] = await Promise.all([
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nuevo Proyecto</h1>
        <p className="text-muted-foreground text-sm mt-1">Completa los datos del proyecto</p>
      </div>
      <ProjectForm action={createProject} clients={clients} users={users} />
    </div>
  )
}
