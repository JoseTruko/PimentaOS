'use client'

import { useTheme } from '@/components/providers/theme-provider'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-8 w-full" />

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
    >
      <div className="flex items-center gap-3">
        {isDark ? <Moon className="h-4 w-4 shrink-0" /> : <Sun className="h-4 w-4 shrink-0" />}
        <span className="text-sm font-medium">{isDark ? 'Modo oscuro' : 'Modo claro'}</span>
      </div>
      {/* Switch visual */}
      <div className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${isDark ? 'bg-primary' : 'bg-sidebar-foreground/20'}`}>
        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${isDark ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
    </button>
  )
}
