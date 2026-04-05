import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { Badge } from '@/components/ui/badge'
import { NewUserButton } from '@/components/team/new-user-button'
import { DeleteUserButton } from '@/components/team/delete-user-button'
import { FolderOpen, Users } from 'lucide-react'

export default async function TeamPage() {
  const session = await verifySession()
  if (!session) return null

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    include: {
      assignedClients: { where: { deletedAt: null }, select: { id: true, status: true } },
      assignedProjects: { where: { deletedAt: null }, select: { id: true, status: true } },
    },
    orderBy: { name: 'asc' },
  })

  const isAdmin = session.user.role === 'admin'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipo</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} miembros</p>
        </div>
        {isAdmin && <NewUserButton />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const activeProjects = user.assignedProjects.filter(p => p.status === 'active').length
          const activeClients = user.assignedClients.filter(c => c.status === 'active').length
          const isSelf = user.id === session.user.id

          return (
            <div key={user.id} className="bg-card rounded-xl border p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-base font-bold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-foreground truncate">{user.name}</p>
                    {isSelf && (
                      <span className="text-[10px] text-muted-foreground font-medium">(tú)</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Admin' : 'Miembro'}
                  </Badge>
                  {isAdmin && <DeleteUserButton id={user.id} isSelf={isSelf} />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{activeProjects}</p>
                    <p className="text-xs text-muted-foreground">Proyectos activos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{activeClients}</p>
                    <p className="text-xs text-muted-foreground">Clientes activos</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Miembro desde {new Date(user.createdAt).toLocaleDateString('es', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
