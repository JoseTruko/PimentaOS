'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { LayoutList, Kanban } from 'lucide-react'

export function ClientViewToggle({ currentView }: { currentView: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setView = (view: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <button
        onClick={() => setView('list')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
          currentView === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <LayoutList className="h-3.5 w-3.5" /> Lista
      </button>
      <button
        onClick={() => setView('kanban')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
          currentView === 'kanban' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Kanban className="h-3.5 w-3.5" /> Kanban
      </button>
    </div>
  )
}
