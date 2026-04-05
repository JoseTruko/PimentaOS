'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users,
  FolderOpen,
  LayoutDashboard,
  Calendar,
  FileText,
  UserCheck,
  DollarSign,
  Rocket,
} from 'lucide-react'
import { SidebarLogout } from './sidebar-logout'
import { ThemeToggle } from './theme-toggle'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Proyectos', href: '/projects', icon: FolderOpen },
  { name: 'Cotizaciones', href: '/quotes', icon: FileText },
  { name: 'Finanzas', href: '/finance', icon: DollarSign },
  { name: 'Reuniones', href: '/meetings', icon: Calendar },
  { name: 'Equipo', href: '/team', icon: UserCheck },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <div className="flex h-full w-60 flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border shrink-0">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Rocket className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sidebar-foreground font-bold text-sm leading-tight">pimentaOS</p>
          <p className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">Studio Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-sidebar-border shrink-0 space-y-0.5">
        <ThemeToggle />
        <SidebarLogout />
      </div>
    </div>
  )
}
