'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'

const IncomeSchema = z.object({
  projectId: z.string().min(1, 'El proyecto es requerido'),
  clientId: z.string().min(1, 'El cliente es requerido'),
  amount: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
  date: z.string().min(1, 'La fecha es requerida'),
})

const ExpenseSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  amount: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
  category: z.enum(['tools', 'marketing', 'salaries', 'other']),
  date: z.string().min(1, 'La fecha es requerida'),
})

export type FinanceFormState = {
  errors?: Record<string, string[]>
  message?: string
}

export async function getIncomes() {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  return prisma.income.findMany({
    include: {
      project: { select: { id: true, name: true } },
      client: { select: { id: true, name: true } },
    },
    orderBy: { date: 'desc' },
  })
}

export async function getExpenses() {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  return prisma.expense.findMany({ orderBy: { date: 'desc' } })
}

export async function getFinanceSummary() {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const [incomes, expenses] = await Promise.all([
    prisma.income.aggregate({
      _sum: { amount: true },
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
    }),
  ])

  const totalIncome = Number(incomes._sum.amount ?? 0)
  const totalExpenses = Number(expenses._sum.amount ?? 0)

  return {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
  }
}

export async function createIncome(
  prevState: FinanceFormState,
  formData: FormData
): Promise<FinanceFormState> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const parsed = IncomeSchema.safeParse({
    projectId: formData.get('projectId'),
    clientId: formData.get('clientId'),
    amount: formData.get('amount'),
    date: formData.get('date'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  await prisma.income.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
      status: 'pending',
    },
  })

  revalidatePath('/finance')
  return { message: 'Ingreso registrado exitosamente' }
}

export async function markIncomePaid(id: string): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.income.update({
    where: { id },
    data: { status: 'paid', paidAt: new Date() },
  })

  revalidatePath('/finance')
}

export async function createExpense(
  prevState: FinanceFormState,
  formData: FormData
): Promise<FinanceFormState> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const parsed = ExpenseSchema.safeParse({
    description: formData.get('description'),
    amount: formData.get('amount'),
    category: formData.get('category'),
    date: formData.get('date'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  await prisma.expense.create({
    data: { ...parsed.data, date: new Date(parsed.data.date) },
  })

  revalidatePath('/finance')
  return { message: 'Gasto registrado exitosamente' }
}
