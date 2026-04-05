'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'

export async function createTask(projectId: string, formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const title = formData.get('title') as string
  if (!title?.trim()) return { error: 'El título es requerido' }

  const lastTask = await prisma.projectTask.findFirst({
    where: { projectId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  await prisma.projectTask.create({
    data: { projectId, title: title.trim(), order: (lastTask?.order ?? 0) + 1 },
  })

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function toggleTask(taskId: string, projectId: string, done: boolean) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.projectTask.update({ where: { id: taskId }, data: { done } })

  // Auto-update project progress
  const tasks = await prisma.projectTask.findMany({ where: { projectId } })
  const progress = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.done).length / tasks.length) * 100)
  await prisma.project.update({ where: { id: projectId }, data: { progress } })

  revalidatePath(`/projects/${projectId}`)
}

export async function deleteTask(taskId: string, projectId: string) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.projectTask.delete({ where: { id: taskId } })

  // Recalculate progress
  const tasks = await prisma.projectTask.findMany({ where: { projectId } })
  const progress = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.done).length / tasks.length) * 100)
  await prisma.project.update({ where: { id: projectId }, data: { progress } })

  revalidatePath(`/projects/${projectId}`)
}
