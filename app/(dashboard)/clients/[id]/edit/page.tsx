import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { updateClient } from '@/actions/clients'
import { ClientForm } from '@/components/clients/client-form'

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [client, users] = await Promise.all([
    prisma.client.findFirst({
      where: { id, deletedAt: null },
    }),
    prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!client) notFound()

  const updateClientWithId = updateClient.bind(null, id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Editar Cliente</h1>
        <p className="text-muted-foreground">{client.name}</p>
      </div>
      <ClientForm action={updateClientWithId} users={users} client={client} />
    </div>
  )
}
