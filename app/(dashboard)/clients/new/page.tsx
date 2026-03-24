import { prisma } from '@/lib/prisma'
import { createClient } from '@/actions/clients'
import { ClientForm } from '@/components/clients/client-form'

export default async function NewClientPage() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Nuevo Cliente</h1>
        <p className="text-muted-foreground">Completa los datos del nuevo cliente</p>
      </div>
      <ClientForm action={createClient} users={users} />
    </div>
  )
}
