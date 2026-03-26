import { prisma } from '@/lib/prisma'
import { TrendingUp, TrendingDown, Wallet, FolderOpen } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const [incomeAgg, expenseAgg, activeProjects, recentClients] = await Promise.all([
    prisma.income.aggregate({
      _sum: { amount: true },
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
    }),
    prisma.project.count({
      where: { status: 'active', deletedAt: null },
    }),
    prisma.client.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, company: true, status: true, createdAt: true },
    }),
  ])

  const totalIncome = Number(incomeAgg._sum.amount ?? 0)
  const totalExpenses = Number(expenseAgg._sum.amount ?? 0)
  const netProfit = totalIncome - totalExpenses

  const stats = [
    {
      label: 'Ingresos del Mes',
      value: `$${totalIncome.toLocaleString('es')}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      ring: 'ring-emerald-100',
    },
    {
      label: 'Gastos del Mes',
      value: `$${totalExpenses.toLocaleString('es')}`,
      icon: TrendingDown,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      ring: 'ring-rose-100',
    },
    {
      label: 'Ganancia Neta',
      value: `$${netProfit.toLocaleString('es')}`,
      icon: Wallet,
      color: netProfit >= 0 ? 'text-primary' : 'text-rose-600',
      bg: netProfit >= 0 ? 'bg-accent' : 'bg-rose-50',
      ring: netProfit >= 0 ? 'ring-primary/10' : 'ring-rose-100',
    },
    {
      label: 'Proyectos Activos',
      value: String(activeProjects),
      icon: FolderOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      ring: 'ring-blue-100',
    },
  ]

  const monthName = now.toLocaleDateString('es', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm capitalize">{monthName}</p>
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

      {/* Clientes recientes */}
      <div className="bg-card rounded-xl border">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Clientes Recientes</h2>
          <Link href="/clients" className="text-sm text-primary hover:underline">Ver todos</Link>
        </div>
        {recentClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No hay clientes aún</p>
            <Link href="/clients/new" className="text-sm text-primary hover:underline mt-1">
              Agregar primer cliente
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {recentClients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-muted/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{client.name}</p>
                  {client.company && (
                    <p className="text-xs text-muted-foreground">{client.company}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  client.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                  client.status === 'lead' ? 'bg-amber-100 text-amber-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {client.status === 'active' ? 'Activo' : client.status === 'lead' ? 'Lead' : 'Inactivo'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
