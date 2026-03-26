'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'

const QuoteSchema = z.object({
  clientId: z.string().min(1, 'El cliente es requerido'),
})

const QuoteItemSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  quantity: z.coerce.number().int().min(1, 'La cantidad debe ser al menos 1'),
  unitPrice: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
})

export type QuoteFormState = {
  errors?: Record<string, string[]>
  message?: string
  quoteId?: string
}

export async function getQuotes(params?: { status?: string; clientId?: string }) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const where: Record<string, unknown> = {}
  if (params?.status) where.status = params.status
  if (params?.clientId) where.clientId = params.clientId

  return prisma.quote.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, company: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getQuoteById(id: string) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  return prisma.quote.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, company: true, email: true } },
      items: { orderBy: { id: 'asc' } },
      project: { select: { id: true, name: true } },
    },
  })
}

export async function createQuote(
  prevState: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const parsed = QuoteSchema.safeParse({ clientId: formData.get('clientId') })
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const quote = await prisma.quote.create({
    data: { clientId: parsed.data.clientId, total: 0, status: 'draft' },
  })

  revalidatePath('/quotes')
  return { message: 'Cotización creada', quoteId: quote.id }
}

export async function updateQuote(
  id: string,
  prevState: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const parsed = QuoteSchema.safeParse({ clientId: formData.get('clientId') })
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  await prisma.quote.update({ where: { id }, data: { clientId: parsed.data.clientId } })
  revalidatePath('/quotes')
  revalidatePath(`/quotes/${id}`)
  return { message: 'Cotización actualizada' }
}

export async function addQuoteItem(
  quoteId: string,
  prevState: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const parsed = QuoteItemSchema.safeParse({
    description: formData.get('description'),
    quantity: formData.get('quantity'),
    unitPrice: formData.get('unitPrice'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { description, quantity, unitPrice } = parsed.data
  const total = quantity * unitPrice

  await prisma.$transaction(async (tx) => {
    await tx.quoteItem.create({
      data: { quoteId, description, quantity, unitPrice, total },
    })
    const items = await tx.quoteItem.findMany({ where: { quoteId } })
    const newTotal = items.reduce((sum, i) => sum + Number(i.total), 0)
    await tx.quote.update({ where: { id: quoteId }, data: { total: newTotal } })
  })

  revalidatePath(`/quotes/${quoteId}`)
  return { message: 'Ítem agregado' }
}

export async function removeQuoteItem(quoteId: string, itemId: string): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.$transaction(async (tx) => {
    await tx.quoteItem.delete({ where: { id: itemId } })
    const items = await tx.quoteItem.findMany({ where: { quoteId } })
    const newTotal = items.reduce((sum, i) => sum + Number(i.total), 0)
    await tx.quote.update({ where: { id: quoteId }, data: { total: newTotal } })
  })

  revalidatePath(`/quotes/${quoteId}`)
}

export async function changeQuoteStatus(
  quoteId: string,
  status: 'draft' | 'sent' | 'rejected'
): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.quote.update({ where: { id: quoteId }, data: { status } })
  revalidatePath('/quotes')
  revalidatePath(`/quotes/${quoteId}`)
}

export async function approveQuote(quoteId: string): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id: quoteId },
    include: { client: true },
  })

  await prisma.$transaction([
    prisma.quote.update({ where: { id: quoteId }, data: { status: 'approved' } }),
    prisma.project.create({
      data: {
        name: `${quote.client.name} — Proyecto`,
        clientId: quote.clientId,
        quoteId: quote.id,
        budget: quote.total,
        status: 'active',
        startDate: new Date(),
      },
    }),
  ])

  revalidatePath('/quotes')
  revalidatePath(`/quotes/${quoteId}`)
  revalidatePath('/projects')
}
