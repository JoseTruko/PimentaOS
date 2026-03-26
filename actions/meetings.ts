'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'

const MeetingSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  type: z.enum(['internal', 'client']),
  clientId: z.string().optional(),
  dateTime: z.string().min(1, 'La fecha y hora son requeridas'),
  meetingLink: z.string().url('URL inválida').optional().or(z.literal('')),
  notes: z.string().optional(),
  participantIds: z.array(z.string()).min(1, 'Selecciona al menos un participante'),
})

export type MeetingFormState = {
  errors?: Record<string, string[]>
  message?: string
}

export async function getMeetings() {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  return prisma.meeting.findMany({
    include: {
      client: { select: { id: true, name: true } },
      participants: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { dateTime: 'desc' },
  })
}

export async function createMeeting(
  prevState: MeetingFormState,
  formData: FormData
): Promise<MeetingFormState> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const clientId = formData.get('clientId')
  const participantIds = formData.getAll('participantIds') as string[]

  const parsed = MeetingSchema.safeParse({
    title: formData.get('title'),
    type: formData.get('type'),
    clientId: (!clientId || clientId === 'none') ? undefined : clientId,
    dateTime: formData.get('dateTime'),
    meetingLink: formData.get('meetingLink') || '',
    notes: formData.get('notes') || undefined,
    participantIds,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { participantIds: pIds, clientId: cId, meetingLink, ...rest } = parsed.data

  await prisma.meeting.create({
    data: {
      ...rest,
      clientId: cId ?? null,
      meetingLink: meetingLink || null,
      dateTime: new Date(rest.dateTime),
      participants: {
        create: pIds.map((userId) => ({ userId })),
      },
    },
  })

  revalidatePath('/meetings')
  return { message: 'Reunión creada exitosamente' }
}

export async function updateMeeting(
  id: string,
  prevState: MeetingFormState,
  formData: FormData
): Promise<MeetingFormState> {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const clientId = formData.get('clientId')
  const participantIds = formData.getAll('participantIds') as string[]

  const parsed = MeetingSchema.safeParse({
    title: formData.get('title'),
    type: formData.get('type'),
    clientId: (!clientId || clientId === 'none') ? undefined : clientId,
    dateTime: formData.get('dateTime'),
    meetingLink: formData.get('meetingLink') || '',
    notes: formData.get('notes') || undefined,
    participantIds,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { participantIds: pIds, clientId: cId, meetingLink, ...rest } = parsed.data

  await prisma.$transaction([
    prisma.meetingParticipant.deleteMany({ where: { meetingId: id } }),
    prisma.meeting.update({
      where: { id },
      data: {
        ...rest,
        clientId: cId ?? null,
        meetingLink: meetingLink || null,
        dateTime: new Date(rest.dateTime),
        participants: {
          create: pIds.map((userId) => ({ userId })),
        },
      },
    }),
  ])

  revalidatePath('/meetings')
  return { message: 'Reunión actualizada exitosamente' }
}
