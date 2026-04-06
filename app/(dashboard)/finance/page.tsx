import { getIncomes, getExpenses } from '@/actions/finance'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddIncomeButton } from '@/components/finance/add-income-button'
import { AddExpenseButton } from '@/components/finance/add-expense-button'
import { MarkPaidButton } from '@/components/finance/mark-paid-button'
import { DeleteFinanceButton } from '@/components/finance/delete-finance-button'
import { FinanceChart } from '@/components/finance/finance-chart'
import { PeriodSelector } from '@/components/finance/period-selector'
import { prisma } from '@/lib/prisma'
import { getPeriodRange, getChartMonths, type Period } from '@/lib/period'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

const categoryLabel: Record<string, string> = {
  tools: 'Herramientas', marketing: 'Marketing', salaries: 'Salarios', other: 'Otro',
}
const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period: rawPeriod } = await searchParams
  const period = (rawPeriod ?? 'all') as Period
  const { start, label } = getPeriodRange(period)
  const chartMonths = getChartMonths(period)
  const now = new Date()

  const dateFilter = start ? { gte: start } : undefined
  const chartStart = new Date(now.getFullYear(), now.getMonth() - (chartMonths - 1), 1)

  const [incomes, expenses, periodIncome, periodExpenses, projects, clients, chartIncomes, chartExpenses] = await Promise.all([
    getIncomes(),
    getExpenses(),
    prisma.income.aggregate({
      where: { ...(dateFilter ? { date: dateFilter } : {}), status: 'paid' },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: dateFilter ? { date: dateFilter } : {},
      _sum: { amount: true },
    }),
    prisma.project.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, client: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.client.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.income.findMany({
      where: { date: { gte: chartStart }, status: 'paid' },
      select: { amount: true, date: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: chartStart } },
      select: { amount: true, date: true },
    }),
  ])

  const income = Number(periodIncome._sum.amount ?? 0)
  const expensesTotal = Number(periodExpenses._sum.amount ?? 0)
  const net = income - expensesTotal

  // Build chart data
  const chartData = Array.from({ length: chartMonths }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (chartMonths - 1) + i, 1)
    const y = d.getFullYear()
    const m = d.getMonth()
    const monthInc = chartIncomes
      .filter(r => new Date(r.date).getFullYear() === y && new Date(r.date).getMonth() === m)
      .reduce((s, r) => s + Number(r.amount), 0)
    const monthExp = chartExpenses
      .filter(r => new Date(r.date).getFullYear() === y && new Date(r.date).getMonth() === m)
      .reduce((s, r) => s + Number(r.amount), 0)
    return { month: MONTHS_ES[m], income: monthInc, expenses: monthExp }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finanzas</h1>
          <p className="text-muted-foreground text-sm mt-1">{label}</p>
        </div>
        <PeriodSelector />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ingresos pagados</p>
            <p className="text-xl font-bold text-foreground">${income.toLocaleString('es')}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            <TrendingDown className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gastos</p>
            <p className="text-xl font-bold text-foreground">${expensesTotal.toLocaleString('es')}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ganancia neta</p>
            <p className={`text-xl font-bold ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ${net.toLocaleString('es')}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card rounded-xl border p-5">
        <h2 className="font-semibold text-foreground mb-4">{label}</h2>
        <FinanceChart data={chartData} />
      </div>

      <Tabs defaultValue="incomes">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="incomes">Ingresos ({incomes.length})</TabsTrigger>
            <TabsTrigger value="expenses">Gastos ({expenses.length})</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <AddIncomeButton projects={projects} clients={clients} />
            <AddExpenseButton />
          </div>
        </div>

        <TabsContent value="incomes" className="mt-4">
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Proyecto / Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      No hay ingresos registrados
                    </TableCell>
                  </TableRow>
                ) : incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell className="text-muted-foreground">{new Date(income.date).toLocaleDateString('es')}</TableCell>
                    <TableCell className="font-medium">{income.client?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-muted-foreground">{income.project?.name ?? income.description ?? '—'}</TableCell>
                    <TableCell className="font-medium">${Number(income.amount).toLocaleString('es')}</TableCell>
                    <TableCell>
                      <Badge variant={income.status === 'paid' ? 'default' : 'secondary'}>
                        {income.status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        {income.status === 'pending' && <MarkPaidButton id={income.id} />}
                        <DeleteFinanceButton id={income.id} type="income" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      No hay gastos registrados
                    </TableCell>
                  </TableRow>
                ) : expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="text-muted-foreground">{new Date(expense.date).toLocaleDateString('es')}</TableCell>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell className="text-muted-foreground">{categoryLabel[expense.category]}</TableCell>
                    <TableCell className="font-medium">${Number(expense.amount).toLocaleString('es')}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DeleteFinanceButton id={expense.id} type="expense" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
