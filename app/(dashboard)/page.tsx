import { TrendingUp, TrendingDown, Wallet, FolderOpen } from 'lucide-react'

const stats = [
  {
    label: 'Ingresos del Mes',
    value: '$0',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
  },
  {
    label: 'Gastos del Mes',
    value: '$0',
    icon: TrendingDown,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    ring: 'ring-rose-100',
  },
  {
    label: 'Ganancia Neta',
    value: '$0',
    icon: Wallet,
    color: 'text-primary',
    bg: 'bg-accent',
    ring: 'ring-primary/10',
  },
  {
    label: 'Proyectos Activos',
    value: '0',
    icon: FolderOpen,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    ring: 'ring-blue-100',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Resumen general de tu agencia
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-card rounded-xl border p-5 flex items-center gap-4 hover:shadow-sm transition-shadow"
            >
              <div className={`h-11 w-11 rounded-xl ${stat.bg} ring-1 ${stat.ring} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Actividad reciente */}
      <div className="bg-card rounded-xl border">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-foreground">Actividad Reciente</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Sin actividad reciente</p>
          <p className="text-xs text-muted-foreground mt-1">
            Aquí aparecerán los últimos movimientos del sistema
          </p>
        </div>
      </div>
    </div>
  )
}
