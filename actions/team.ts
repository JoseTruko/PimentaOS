'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { hash } from 'bcryptjs'

const UserSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['admin', 'member']),
})

export type TeamFormState = {
  errors?: Record<string, string[]>
  message?: string
}

export async function createUser(
  prevState: TeamFormState,
  formData: FormData
): Promise<TeamFormState> {
  const session = await verifySession()
  if (!session || session.user.role !== 'admin') throw new Error('No autorizado')

  const parsed = UserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  })

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return { errors: { email: ['Este email ya está en uso'] } }

  const hashedPassword = await hash(parsed.data.password, 12)

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      role: parsed.data.role,
    },
  })

  revalidatePath('/team')
  return { message: 'Usuario creado exitosamente' }
}

export async function deleteUser(id: string): Promise<void> {
  const session = await verifySession()
  if (!session || session.user.role !== 'admin') throw new Error('No autorizado')
  if (id === session.user.id) throw new Error('No puedes eliminarte a ti mismo')

  await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } })
  revalidatePath('/team')
}
