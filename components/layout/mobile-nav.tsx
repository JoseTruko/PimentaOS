'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users, FolderOpen, LayoutDashboard, Calendar,
  FileText, UserCheck, DollarSign, Rocket, Menu, X,
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { SidebarLogout } from './sidebar-logout'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Proyectos', href: '/projects', icon: FolderOpen },
  { name: 'Cotizaciones', href: '/quotes', icon: FileText },
  { name: 'Finanzas', href: '/finance', icon: DollarSign },
  { name: 'Reuniones', href: '/meetings', icon: Calendar },
  { name: 'Equipo', href: '/team', icon: UserCheck },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transition-transform duration-300 lg:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Rocket className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sidebar-foreground font-bold text-sm leading-tight">pimentaOS</p>
              <p className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">Studio Panel</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-sidebar-foreground/50 hover:text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </button>
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
                onClick={() => setOpen(false)}
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
    </>
  )
}
