import { createUser } from '@/actions/team'
import { UserForm } from '@/components/team/user-form'
import { verifySession } from '@/lib/dal'
import { forbidden } from 'next/navigation'

export default async function NewUserPage() {
  const session = await verifySession()
  if (session?.user.role !== 'admin') forbidden()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nuevo Usuario</h1>
        <p className="text-muted-foreground text-sm">Agrega un miembro al equipo</p>
      </div>
      <UserForm action={createUser} />
    </div>
  )
}
