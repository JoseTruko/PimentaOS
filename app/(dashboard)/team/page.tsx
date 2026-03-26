import Link from 'next/link'
import { getUsers } from '@/actions/team'
import { verifySession } from '@/lib/dal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil } from 'lucide-react'

export default async function TeamPage() {
  const [users, session] = await Promise.all([getUsers(), verifySession()])
  const isAdmin = session?.user.role === 'admin'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipo</h1>
          <p className="text-muted-foreground text-sm">{users.length} miembros</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/team/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-card rounded-xl border p-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0 ring-2 ring-primary/20">
                <span className="text-sm font-bold text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <Badge
                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                  className="mt-1.5 text-xs"
                >
                  {user.role === 'admin' ? 'Administrador' : 'Miembro'}
                </Badge>
              </div>
            </div>
            {isAdmin && (
              <Button asChild size="icon" variant="ghost" className="shrink-0">
                <Link href={`/team/${user.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
