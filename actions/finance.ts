'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'

const IncomeSchema = z.object({
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  description: z.string().optional(),
  amount: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
  status: z.enum(['pending', 'paid']),
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

export async function getIncomes(params?: { status?: string; clientId?: string }) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const where: Record<string, unknown> = {}
  if (params?.status) where.status = params.status
  if (params?.clientId) where.clientId = params.clientId

  return prisma.income.findMany({
    where,
    include: {
      project: { select: { id: true, name: true } },
      client: { select: { id: true, name: true } },
    },
    orderBy: { date: 'desc' },
  })
}

export async function getExpenses(params?: { category?: string }) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const where: Record<string, unknown> = {}
  if (params?.category) where.category = params.category

  return prisma.expense.findMany({
    where,
    orderBy: { date: 'desc' },
  })
}

export async function createIncome(
  prevState: FinanceFormState,
  formData: FormData
): Promise<FinanceFormState> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const parsed = IncomeSchema.safeParse({
    projectId: formData.get('projectId') === 'none' ? undefined : (formData.get('projectId') as string) || undefined,
    clientId: formData.get('clientId') === 'none' ? undefined : (formData.get('clientId') as string) || undefined,
    description: formData.get('description') as string || undefined,
    amount: formData.get('amount'),
    status: formData.get('status'),
    date: formData.get('date'),
  })

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  await prisma.income.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
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

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  await prisma.expense.create({
    data: { ...parsed.data, date: new Date(parsed.data.date) },
  })

  revalidatePath('/finance')
  return { message: 'Gasto registrado exitosamente' }
}

export async function deleteExpense(id: string): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.expense.delete({ where: { id } })
  revalidatePath('/finance')
}

export async function deleteIncome(id: string): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.income.delete({ where: { id } })
  revalidatePath('/finance')
}
