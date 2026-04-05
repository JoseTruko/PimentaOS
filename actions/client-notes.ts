'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'

const NoteSchema = z.object({
  content: z.string().min(1, 'La nota no puede estar vacía'),
})

export async function createClientNote(clientId: string, formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  const parsed = NoteSchema.safeParse({ content: formData.get('content') })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors.content?.[0] }

  await prisma.clientNote.create({
    data: {
      clientId,
      userId: session.user.id,
      content: parsed.data.content,
    },
  })

  revalidatePath(`/clients/${clientId}`)
  return { success: true }
}

export async function deleteClientNote(noteId: string, clientId: string) {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  // Solo el autor o admin puede borrar
  const note = await prisma.clientNote.findUnique({ where: { id: noteId } })
  if (!note) return
  if (note.userId !== session.user.id && session.user.role !== 'admin') {
    throw new Error('No autorizado')
  }

  await prisma.clientNote.delete({ where: { id: noteId } })
  revalidatePath(`/clients/${clientId}`)
}
