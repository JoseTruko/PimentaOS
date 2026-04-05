'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'

const ClientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  company: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  status: z.enum(['lead', 'active', 'inactive']),
  type: z.enum(['web', 'system', 'marketing', 'other']),
  priority: z.enum(['high', 'medium', 'low']),
  assignedUserId: z.string().optional(),
})

export type ClientFormState = {
  errors?: Record<string, string[]>
  message?: string
}

export async function getClients(params?: {
  status?: string
  type?: string
  priority?: string
  q?: string
}) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const where: Record<string, unknown> = { deletedAt: null }

  if (params?.status) where.status = params.status
  if (params?.type) where.type = params.type
  if (params?.priority) where.priority = params.priority
  if (params?.q) {
    where.OR = [
      { name: { contains: params.q, mode: 'insensitive' } },
      { company: { contains: params.q, mode: 'insensitive' } },
    ]
  }

  return prisma.client.findMany({
    where,
    include: { assignedUser: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getClientById(id: string) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  return prisma.client.findFirst({
    where: { id, deletedAt: null },
    include: {
      assignedUser: { select: { id: true, name: true } },
      quotes: { orderBy: { createdAt: 'desc' } },
      projects: { orderBy: { createdAt: 'desc' } },
      meetings: { orderBy: { dateTime: 'desc' } },
      incomes: { orderBy: { date: 'desc' } },
      notes: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  })
}

export async function createClient(
  prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const parsed = ClientSchema.safeParse({
    name: formData.get('name'),
    company: formData.get('company') || undefined,
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    status: formData.get('status'),
    type: formData.get('type'),
    priority: formData.get('priority'),
    assignedUserId: formData.get('assignedUserId') === 'none' ? undefined : (formData.get('assignedUserId') as string) || undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  await prisma.client.create({ data: parsed.data })
  revalidatePath('/clients')
  return { message: 'Cliente creado exitosamente' }
}

export async function updateClient(
  id: string,
  prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const parsed = ClientSchema.safeParse({
    name: formData.get('name'),
    company: formData.get('company') || undefined,
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    status: formData.get('status'),
    type: formData.get('type'),
    priority: formData.get('priority'),
    assignedUserId: formData.get('assignedUserId') === 'none' ? undefined : (formData.get('assignedUserId') as string) || undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  await prisma.client.update({ where: { id }, data: parsed.data })
  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  return { message: 'Cliente actualizado exitosamente' }
}

export async function updateClientStatus(id: string, status: 'lead' | 'active' | 'inactive') {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.client.update({ where: { id }, data: { status } })
  revalidatePath('/clients')
}

export async function deleteClient(id: string): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.client.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
  revalidatePath('/clients')
}
