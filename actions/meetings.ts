'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'

const MeetingSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  type: z.enum(['internal', 'client']),
  clientId: z.string().optional(),
  dateTime: z.string().min(1, 'La fecha es requerida'),
  meetingLink: z.string().url('URL inválida').optional().or(z.literal('')),
  notes: z.string().optional(),
  participantIds: z.array(z.string()).optional(),
})

export type MeetingFormState = {
  errors?: Record<string, string[]>
  message?: string
}

export async function getMeetings(params?: { type?: string; upcoming?: boolean }) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const where: Record<string, unknown> = {}
  if (params?.type) where.type = params.type
  if (params?.upcoming) where.dateTime = { gte: new Date() }

  return prisma.meeting.findMany({
    where,
    include: {
      client: { select: { id: true, name: true } },
      participants: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { dateTime: 'asc' },
  })
}

export async function createMeeting(
  prevState: MeetingFormState,
  formData: FormData
): Promise<MeetingFormState> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const participantIds = formData.getAll('participantIds') as string[]

  const parsed = MeetingSchema.safeParse({
    title: formData.get('title'),
    type: formData.get('type'),
    clientId: formData.get('clientId') === 'none' ? undefined : (formData.get('clientId') as string) || undefined,
    dateTime: formData.get('dateTime'),
    meetingLink: formData.get('meetingLink') || undefined,
    notes: formData.get('notes') || undefined,
    participantIds,
  })

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const { participantIds: pIds, clientId, meetingLink, ...rest } = parsed.data

  await prisma.meeting.create({
    data: {
      ...rest,
      clientId: clientId || null,
      meetingLink: meetingLink || null,
      dateTime: new Date(rest.dateTime),
      participants: pIds?.length
        ? { create: pIds.map((userId) => ({ userId })) }
        : undefined,
    },
  })

  revalidatePath('/meetings')
  return { message: 'Reunión creada exitosamente' }
}

export async function deleteMeeting(id: string): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  await prisma.meeting.delete({ where: { id } })
  revalidatePath('/meetings')
}
