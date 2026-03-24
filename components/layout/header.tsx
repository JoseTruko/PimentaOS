import { verifySession } from '@/lib/dal'

export async function Header() {
  const session = await verifySession()

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0">
      <div />

      {session && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground leading-tight">
              {session.user.name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {session.user.role === 'admin' ? 'Administrador' : 'Miembro'}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0 ring-2 ring-primary/20">
            <span className="text-sm font-bold text-primary-foreground">
              {session.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
