'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { hash } from 'bcryptjs'

const UserSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'member']),
})

const CreateUserSchema = UserSchema.extend({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type TeamFormState = {
  errors?: Record<string, string[]>
  message?: string
}

async function requireAdmin() {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')
  if (session.user.role !== 'admin') throw new Error('Solo administradores pueden gestionar el equipo')
  return session
}

export async function getUsers() {
  const session = await verifySession()
  if (!session) throw new Error('No autorizado')

  return prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createUser(
  prevState: TeamFormState,
  formData: FormData
): Promise<TeamFormState> {
  await requireAdmin()

  const parsed = CreateUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    return { errors: { email: ['Este email ya está registrado'] } }
  }

  const hashedPassword = await hash(parsed.data.password, 12)

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      password: hashedPassword,
    },
  })

  revalidatePath('/team')
  return { message: 'Usuario creado exitosamente' }
}

export async function updateUser(
  id: string,
  prevState: TeamFormState,
  formData: FormData
): Promise<TeamFormState> {
  await requireAdmin()

  const parsed = UserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const existing = await prisma.user.findFirst({
    where: { email: parsed.data.email, NOT: { id } },
  })
  if (existing) {
    return { errors: { email: ['Este email ya está en uso'] } }
  }

  await prisma.user.update({ where: { id }, data: parsed.data })
  revalidatePath('/team')
  return { message: 'Usuario actualizado exitosamente' }
}
