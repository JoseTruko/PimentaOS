import Link from 'next/link'
import {
  Users,
  UserCheck,
  FileText,
  FolderOpen,
  DollarSign,
  Calendar,
  BarChart3,
  LogOut,
} from 'lucide-react'
import { signOut } from '@/lib/auth'

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Cotizaciones', href: '/quotes', icon: FileText },
  { name: 'Proyectos', href: '/projects', icon: FolderOpen },
  { name: 'Finanzas', href: '/finance', icon: DollarSign },
  { name: 'Reuniones', href: '/meetings', icon: Calendar },
  { name: 'Equipo', href: '/team', icon: UserCheck },
]

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-bold text-sm">P</span>
        </div>
        <div>
          <p className="text-sidebar-foreground font-semibold text-sm leading-tight">Pimenta Studio</p>
          <p className="text-sidebar-foreground/40 text-xs">OS Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Cerrar Sesión
          </button>
        </form>
      </div>
    </div>
  )
}
