import { getIncomes, getExpenses } from '@/actions/finance'
import { prisma } from '@/lib/prisma'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { IncomeForm } from '@/components/finance/income-form'
import { ExpenseForm } from '@/components/finance/expense-form'
import { MarkPaidButton } from '@/components/finance/mark-paid-button'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

const categoryLabel: Record<string, string> = {
  tools: 'Herramientas', marketing: 'Marketing', salaries: 'Salarios', other: 'Otro',
}

export default async function FinancePage() {
  const [incomes, expenses, projects] = await Promise.all([
    getIncomes(),
    getExpenses(),
    prisma.project.findMany({
      where: { deletedAt: null, status: { not: 'completed' } },
      select: { id: true, name: true, clientId: true, client: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    }),
  ])

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const monthlyIncomes = incomes.filter((i) => {
    const d = new Date(i.date)
    return d >= startOfMonth && d <= endOfMonth
  })
  const monthlyExpenses = expenses.filter((e) => {
    const d = new Date(e.date)
    return d >= startOfMonth && d <= endOfMonth
  })

  const totalIncome = monthlyIncomes.reduce((s, i) => s + Number(i.amount), 0)
  const totalExpenses = monthlyExpenses.reduce((s, e) => s + Number(e.amount), 0)
  const netProfit = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Finanzas</h1>
        <p className="text-muted-foreground text-sm">Resumen del mes actual</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border p-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Ingresos del mes</p>
            <p className="text-xl font-bold text-foreground">${totalIncome.toLocaleString('es')}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-rose-50 ring-1 ring-rose-100 flex items-center justify-center shrink-0">
            <TrendingDown className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Gastos del mes</p>
            <p className="text-xl font-bold text-foreground">${totalExpenses.toLocaleString('es')}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5 flex items-center gap-4">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ring-1 ${netProfit >= 0 ? 'bg-accent ring-primary/10' : 'bg-rose-50 ring-rose-100'}`}>
            <Wallet className={`h-5 w-5 ${netProfit >= 0 ? 'text-primary' : 'text-rose-600'}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Ganancia neta</p>
            <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-foreground' : 'text-rose-600'}`}>
              ${netProfit.toLocaleString('es')}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="incomes">
        <TabsList>
          <TabsTrigger value="incomes">Ingresos ({incomes.length})</TabsTrigger>
          <TabsTrigger value="expenses">Gastos ({expenses.length})</TabsTrigger>
        </TabsList>

        {/* Ingresos */}
        <TabsContent value="incomes" className="mt-4 space-y-4">
          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-semibold text-foreground mb-4">Registrar Ingreso</h3>
            <IncomeForm projects={projects} />
          </div>

          <div className="bg-card rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Sin ingresos registrados</TableCell>
                  </TableRow>
                ) : incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell className="font-medium text-sm">{income.project.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{income.client.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(income.date).toLocaleDateString('es')}</TableCell>
                    <TableCell className="text-right font-semibold">${Number(income.amount).toLocaleString('es')}</TableCell>
                    <TableCell>
                      <Badge variant={income.status === 'paid' ? 'default' : 'secondary'}>
                        {income.status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {income.status === 'pending' && <MarkPaidButton id={income.id} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Gastos */}
        <TabsContent value="expenses" className="mt-4 space-y-4">
          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-semibold text-foreground mb-4">Registrar Gasto</h3>
            <ExpenseForm />
          </div>

          <div className="bg-card rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Sin gastos registrados</TableCell>
                  </TableRow>
                ) : expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium text-sm">{expense.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{categoryLabel[expense.category]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString('es')}</TableCell>
                    <TableCell className="text-right font-semibold">${Number(expense.amount).toLocaleString('es')}</TableCell>
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
