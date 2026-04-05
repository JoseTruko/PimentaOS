import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import {
  TrendingUp, TrendingDown, Wallet, FolderOpen,
  Users, Clock, ArrowUpRight, Calendar, AlertTriangle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const statusLabel: Record<string, string> = { lead: 'Lead', active: 'Activo', inactive: 'Inactivo' }
const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  lead: 'secondary', active: 'default', inactive: 'outline',
}
const projectStatusLabel: Record<string, string> = { active: 'Activo', paused: 'Pausado', completed: 'Completado' }
const projectStatusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default', paused: 'secondary', completed: 'outline',
}

export default async function DashboardPage() {
  const session = await verifySession()
  if (!session) return null

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const staleDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) // 14 days ago

  const [
    totalClients, activeClients, leadClients, inactiveClients,
    activeProjects, recentClients, upcomingMeetings, recentProjects,
    monthIncome, lastMonthIncome, monthExpenses,
    staleQuotes,
  ] = await Promise.all([
    prisma.client.count({ where: { deletedAt: null } }),
    prisma.client.count({ where: { deletedAt: null, status: 'active' } }),
    prisma.client.count({ where: { deletedAt: null, status: 'lead' } }),
    prisma.client.count({ where: { deletedAt: null, status: 'inactive' } }),
    prisma.project.count({ where: { deletedAt: null, status: 'active' } }),
    prisma.client.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { assignedUser: { select: { name: true } } },
    }),
    prisma.meeting.findMany({
      where: { dateTime: { gte: now } },
      orderBy: { dateTime: 'asc' },
      take: 4,
      include: { client: { select: { name: true } } },
    }),
    prisma.project.findMany({
      where: { deletedAt: null, status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { client: { select: { name: true } } },
    }),
    prisma.income.aggregate({
      where: { date: { gte: startOfMonth }, status: 'paid' },
      _sum: { amount: true },
    }),
    prisma.income.aggregate({
      where: { date: { gte: startOfLastMonth, lte: endOfLastMonth }, status: 'paid' },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    // Cotizaciones enviadas hace más de 14 días sin respuesta
    prisma.quote.findMany({
      where: { status: 'sent', createdAt: { lte: staleDate } },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
      take: 5,
    }),
  ])

  const income = Number(monthIncome._sum.amount ?? 0)
  const lastIncome = Number(lastMonthIncome._sum.amount ?? 0)
  const expenses = Number(monthExpenses._sum.amount ?? 0)
  const netProfit = income - expenses
  const incomeChange = lastIncome > 0 ? ((income - lastIncome) / lastIncome) * 100 : null

  // Conversion rate: leads that became active
  const conversionRate = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0

  const stats = [
    {
      label: 'Ingresos del Mes',
      value: `$${income.toLocaleString('es')}`,
      sub: incomeChange !== null
        ? `${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}% vs mes anterior`
        : 'Sin datos anteriores',
      positive: incomeChange === null ? null : incomeChange >= 0,
      icon: TrendingUp, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50',
    },
    {
      label: 'Gastos del Mes',
      value: `$${expenses.toLocaleString('es')}`,
      sub: 'Mes actual',
      positive: false,
      icon: TrendingDown, iconColor: 'text-rose-600', iconBg: 'bg-rose-50',
    },
    {
      label: 'Ganancia Neta',
      value: `$${netProfit.toLocaleString('es')}`,
      sub: 'Ingresos − Gastos',
      positive: netProfit >= 0,
      icon: Wallet, iconColor: 'text-primary', iconBg: 'bg-accent',
    },
    {
      label: 'Proyectos Activos',
      value: String(activeProjects),
      sub: `${totalClients} clientes · ${activeClients} activos`,
      positive: null,
      icon: FolderOpen, iconColor: 'text-blue-600', iconBg: 'bg-blue-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Resumen general de tu agencia</p>
      </div>

      {/* Alertas */}
      {staleQuotes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              {staleQuotes.length} cotización{staleQuotes.length > 1 ? 'es' : ''} sin respuesta hace más de 14 días
            </p>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {staleQuotes.map((q) => (
                <Link key={q.id} href={`/quotes/${q.id}`}
                  className="text-xs text-amber-700 hover:text-amber-900 hover:underline">
                  {q.title ?? q.client.name} ({Math.floor((now.getTime() - new Date(q.createdAt).getTime()) / 86400000)}d)
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-card rounded-xl border p-5 flex items-start gap-4">
              <div className={`h-10 w-10 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{stat.value}</p>
                <p className={`text-xs mt-0.5 ${
                  stat.positive === null ? 'text-muted-foreground'
                  : stat.positive ? 'text-emerald-600' : 'text-rose-600'
                }`}>{stat.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Conversión + Reuniones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pipeline de conversión */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Pipeline de Clientes</h2>
            <Link href="/clients?view=kanban" className="text-xs text-primary hover:underline">Ver kanban →</Link>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Leads', count: leadClients, total: totalClients, color: 'bg-amber-400' },
              { label: 'Activos', count: activeClients, total: totalClients, color: 'bg-emerald-500' },
              { label: 'Inactivos', count: inactiveClients, total: totalClients, color: 'bg-muted-foreground' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold text-foreground">{item.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tasa de conversión</span>
              <span className="text-sm font-bold text-primary">{conversionRate}%</span>
            </div>
          </div>
        </div>

        {/* Clientes recientes */}
        <div className="lg:col-span-2 bg-card rounded-xl border">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Clientes Recientes</h2>
            </div>
            <Link href="/clients" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              Ver todos <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {recentClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No hay clientes aún</p>
              <Link href="/clients/new" className="text-xs text-primary mt-1 hover:underline">Crear el primero</Link>
            </div>
          ) : (
            <div className="divide-y">
              {recentClients.map((client) => (
                <Link key={client.id} href={`/clients/${client.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{client.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{client.company ?? client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <Badge variant={statusVariant[client.status]} className="text-xs">
                      {statusLabel[client.status]}
                    </Badge>
                    {client.assignedUser && (
                      <span className="text-xs text-muted-foreground hidden sm:block">{client.assignedUser.name}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reuniones + Proyectos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border flex flex-col">
          <div className="flex items-center gap-2 px-5 py-4 border-b">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Próximas Reuniones</h2>
          </div>
          {upcomingMeetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
              <p className="text-sm text-muted-foreground">Sin reuniones próximas</p>
            </div>
          ) : (
            <div className="divide-y flex-1">
              {upcomingMeetings.map((meeting) => {
                const date = new Date(meeting.dateTime)
                return (
                  <div key={meeting.id} className="px-5 py-3 flex gap-3">
                    <div className="text-center shrink-0 w-9">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                        {date.toLocaleString('es', { month: 'short' })}
                      </p>
                      <p className="text-lg font-bold text-foreground leading-tight">{date.getDate()}</p>
                    </div>
                    <div className="border-l pl-3 min-w-0">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        {date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm font-medium text-foreground truncate">{meeting.title}</p>
                      {meeting.client && (
                        <p className="text-xs text-muted-foreground truncate">{meeting.client.name}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="px-5 py-3 border-t">
            <Link href="/meetings" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              <Calendar className="h-3.5 w-3.5" /> Ver agenda completa
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Proyectos Activos</h2>
            </div>
            <Link href="/projects" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              Ver todos <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No hay proyectos activos</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{project.client.name}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 w-24">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-7 text-right">{project.progress}%</span>
                    </div>
                    <Badge variant={projectStatusVariant[project.status]} className="text-xs">
                      {projectStatusLabel[project.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
