import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuario admin inicial
  const adminEmail = 'admin@pimentastudio.com'
  const adminPassword = await hash('admin123', 12)

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      }
    })

    console.log('✅ Usuario admin creado:', {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    })
  } else {
    console.log('ℹ️ Usuario admin ya existe')
  }

  // Crear usuario member de ejemplo
  const memberEmail = 'member@pimentastudio.com'
  const memberPassword = await hash('member123', 12)

  const existingMember = await prisma.user.findUnique({
    where: { email: memberEmail }
  })

  if (!existingMember) {
    const member = await prisma.user.create({
      data: {
        name: 'Miembro del Equipo',
        email: memberEmail,
        password: memberPassword,
        role: 'member',
      }
    })

    console.log('✅ Usuario member creado:', {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role
    })
  } else {
    console.log('ℹ️ Usuario member ya existe')
  }

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })