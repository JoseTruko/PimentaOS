'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { redirect } from 'next/navigation'

const QuoteItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
})

const QuoteSchema = z.object({
  clientId: z.string().min(1, 'El cliente es requerido'),
  title: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'sent', 'approved', 'rejected']),
  validUntil: z.string().optional(),
  items: z.array(QuoteItemSchema).min(1, 'Agrega al menos un ítem'),
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
      items: true,
      project: true,
    },
  })
}

export async function createQuote(
  prevState: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const rawItems: { description: string; quantity: string; unitPrice: string }[] = []
  const descriptions = formData.getAll('item_description')
  const quantities = formData.getAll('item_quantity')
  const unitPrices = formData.getAll('item_unitPrice')

  for (let i = 0; i < descriptions.length; i++) {
    rawItems.push({
      description: descriptions[i] as string,
      quantity: quantities[i] as string,
      unitPrice: unitPrices[i] as string,
    })
  }

  const parsed = QuoteSchema.safeParse({
    clientId: formData.get('clientId'),
    title: formData.get('title') || undefined,
    notes: formData.get('notes') || undefined,
    status: formData.get('status'),
    validUntil: formData.get('validUntil') || undefined,
    items: rawItems.map((item) => ({
      description: item.description,
      quantity: parseInt(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
    })),
  })

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const items = parsed.data.items.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }))

  const total = items.reduce((sum, item) => sum + item.total, 0)

  await prisma.quote.create({
    data: {
      clientId: parsed.data.clientId,
      title: parsed.data.title || null,
      notes: parsed.data.notes || null,
      status: parsed.data.status,
      validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
      total,
      items: { create: items },
    },
  })

  revalidatePath('/quotes')
  return { message: 'Cotización creada exitosamente' }
}

export async function updateQuoteStatus(id: string, status: string): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.quote.update({
    where: { id },
    data: { status: status as 'draft' | 'sent' | 'approved' | 'rejected' },
  })
  revalidatePath('/quotes')
  revalidatePath(`/quotes/${id}`)
}

export async function convertQuoteToProject(quoteId: string): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { client: true, project: true },
  })

  if (!quote) throw new Error('Cotización no encontrada')
  if (quote.project) redirect(`/projects/${quote.project.id}`)

  const project = await prisma.project.create({
    data: {
      name: quote.title ?? `Proyecto — ${quote.client.name}`,
      clientId: quote.clientId,
      quoteId: quote.id,
      budget: quote.total,
      status: 'active',
    },
  })

  // Mark quote as approved if it wasn't already
  if (quote.status !== 'approved') {
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'approved' },
    })
  }

  revalidatePath('/quotes')
  revalidatePath('/projects')
  redirect(`/projects/${project.id}`)
}

export async function deleteQuote(id: string): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.quote.delete({ where: { id } })
  revalidatePath('/quotes')
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

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const total = parsed.data.quantity * parsed.data.unitPrice

  await prisma.$transaction(async (tx) => {
    await tx.quoteItem.create({
      data: { quoteId, ...parsed.data, total },
    })
    const items = await tx.quoteItem.findMany({ where: { quoteId } })
    const newTotal = items.reduce((s, i) => s + Number(i.total), 0)
    await tx.quote.update({ where: { id: quoteId }, data: { total: newTotal } })
  })

  revalidatePath(`/quotes/${quoteId}`)
  return { message: 'Ítem agregado' }
}

export async function changeQuoteStatus(
  id: string,
  status: 'draft' | 'sent' | 'approved' | 'rejected'
): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.quote.update({ where: { id }, data: { status } })
  revalidatePath('/quotes')
  revalidatePath(`/quotes/${id}`)
}

export async function approveQuote(id: string): Promise<void> {
  await changeQuoteStatus(id, 'approved')
}

export async function removeQuoteItem(quoteId: string, itemId: string): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.$transaction(async (tx) => {
    await tx.quoteItem.delete({ where: { id: itemId } })
    const items = await tx.quoteItem.findMany({ where: { quoteId } })
    const newTotal = items.reduce((s, i) => s + Number(i.total), 0)
    await tx.quote.update({ where: { id: quoteId }, data: { total: newTotal } })
  })

  revalidatePath(`/quotes/${quoteId}`)
}
