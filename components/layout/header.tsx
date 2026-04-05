import { verifySession } from '@/lib/dal'
import { Search, Bell, MessageSquare, Settings } from 'lucide-react'

export async function Header() {
  const session = await verifySession()

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0 gap-4">
      <h1 className="text-lg font-bold text-foreground shrink-0">Dashboard</h1>

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search insights..."
            className="w-full h-9 pl-9 pr-4 rounded-full bg-muted text-sm text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        <button className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <button className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <MessageSquare className="h-4 w-4" />
        </button>
        <button className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Settings className="h-4 w-4" />
        </button>

        {session && (
          <div className="flex items-center gap-2.5 ml-2 pl-3 border-l">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground leading-tight">{session.user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {session.user.role === 'admin' ? 'Agency Director' : 'Miembro'}
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0 ring-2 ring-primary/20">
              <span className="text-sm font-bold text-primary-foreground">
                {session.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
