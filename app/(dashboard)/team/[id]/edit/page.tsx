import { notFound, forbidden } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { updateUser } from '@/actions/team'
import { UserForm } from '@/components/team/user-form'
import { verifySession } from '@/lib/dal'

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (session?.user.role !== 'admin') forbidden()

  const { id } = await params
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, name: true, email: true, role: true },
  })

  if (!user) notFound()

  const updateUserWithId = updateUser.bind(null, id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Editar Usuario</h1>
        <p className="text-muted-foreground text-sm">{user.name}</p>
      </div>
      <UserForm action={updateUserWithId} user={user} />
    </div>
  )
}
