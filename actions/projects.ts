'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'

const ProjectSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  clientId: z.string().min(1, 'El cliente es requerido'),
  assignedUserId: z.string().optional(),
  quoteId: z.string().optional(),
  jiraUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  status: z.enum(['active', 'paused', 'completed']),
  budget: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type ProjectFormState = {
  errors?: Record<string, string[]>
  message?: string
}

export async function getProjects(params?: { status?: string; clientId?: string; assignedUserId?: string; q?: string }) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const where: Record<string, unknown> = { deletedAt: null }
  if (params?.status) where.status = params.status
  if (params?.clientId) where.clientId = params.clientId
  if (params?.assignedUserId) where.assignedUserId = params.assignedUserId
  if (params?.q) where.name = { contains: params.q, mode: 'insensitive' }

  return prisma.project.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, company: true } },
      assignedUser: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getProjectById(id: string) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  return prisma.project.findFirst({
    where: { id, deletedAt: null },
    include: {
      client: { select: { id: true, name: true, company: true } },
      assignedUser: { select: { id: true, name: true } },
      quote: { include: { items: true } },
      incomes: { orderBy: { date: 'desc' } },
      tasks: { orderBy: { order: 'asc' } },
    },
  })
}

export async function createProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const parsed = ProjectSchema.safeParse({
    name: formData.get('name'),
    clientId: formData.get('clientId'),
    assignedUserId: formData.get('assignedUserId') === 'none' ? undefined : (formData.get('assignedUserId') as string) || undefined,
    quoteId: formData.get('quoteId') || undefined,
    jiraUrl: formData.get('jiraUrl') || undefined,
    status: formData.get('status'),
    budget: formData.get('budget') || undefined,
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
  })

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const { budget, startDate, endDate, jiraUrl, ...rest } = parsed.data

  await prisma.project.create({
    data: {
      ...rest,
      jiraUrl: jiraUrl || null,
      budget: budget ? parseFloat(budget) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  })

  revalidatePath('/projects')
  return { message: 'Proyecto creado exitosamente' }
}

export async function updateProject(
  id: string,
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const parsed = ProjectSchema.safeParse({
    name: formData.get('name'),
    clientId: formData.get('clientId'),
    assignedUserId: formData.get('assignedUserId') === 'none' ? undefined : (formData.get('assignedUserId') as string) || undefined,
    quoteId: formData.get('quoteId') || undefined,
    jiraUrl: formData.get('jiraUrl') || undefined,
    status: formData.get('status'),
    budget: formData.get('budget') || undefined,
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
  })

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const { budget, startDate, endDate, jiraUrl, ...rest } = parsed.data

  await prisma.project.update({
    where: { id },
    data: {
      ...rest,
      jiraUrl: jiraUrl || null,
      budget: budget ? parseFloat(budget) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  })

  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
  return { message: 'Proyecto actualizado exitosamente' }
}

export async function deleteProject(id: string): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } })
  revalidatePath('/projects')
}

export async function changeProjectStatus(
  id: string,
  status: 'active' | 'paused' | 'completed'
): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.project.update({ where: { id }, data: { status } })
  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
}
