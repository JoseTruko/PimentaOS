'use client'

import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

export function SidebarLogout() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      Cerrar Sesión
    </button>
  )
}
