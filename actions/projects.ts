'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'

const ProjectSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  clientId: z.string().min(1, 'El cliente es requerido'),
  assignedUserId: z.string().optional(),
  jiraUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  status: z.enum(['active', 'paused', 'completed']),
  budget: z.coerce.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type ProjectFormState = {
  errors?: Record<string, string[]>
  message?: string
}

export async function getProjects(params?: { status?: string; q?: string }) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const where: Record<string, unknown> = { deletedAt: null }
  if (params?.status) where.status = params.status
  if (params?.q) {
    where.name = { contains: params.q, mode: 'insensitive' }
  }

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
      quote: { select: { id: true, total: true, status: true } },
      incomes: { orderBy: { date: 'desc' } },
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
    assignedUserId: (() => { const v = formData.get('assignedUserId'); return (!v || v === 'none') ? undefined : v })(),
    jiraUrl: formData.get('jiraUrl') || '',
    status: formData.get('status'),
    budget: formData.get('budget') || undefined,
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { jiraUrl, startDate, endDate, budget, ...rest } = parsed.data

  await prisma.project.create({
    data: {
      ...rest,
      jiraUrl: jiraUrl || null,
      budget: budget ?? null,
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
    assignedUserId: (() => { const v = formData.get('assignedUserId'); return (!v || v === 'none') ? undefined : v })(),
    jiraUrl: formData.get('jiraUrl') || '',
    status: formData.get('status'),
    budget: formData.get('budget') || undefined,
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { jiraUrl, startDate, endDate, budget, ...rest } = parsed.data

  await prisma.project.update({
    where: { id },
    data: {
      ...rest,
      jiraUrl: jiraUrl || null,
      budget: budget ?? null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  })

  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
  return { message: 'Proyecto actualizado exitosamente' }
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
