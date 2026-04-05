import { prisma } from '@/lib/prisma'
import { createMeeting } from '@/actions/meetings'
import { MeetingForm } from '@/components/meetings/meeting-form'

export default async function NewMeetingPage() {
  const [users, clients] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.client.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, company: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nueva Reunión</h1>
        <p className="text-muted-foreground text-sm">Programa una reunión y asigna participantes</p>
      </div>
      <MeetingForm action={createMeeting} users={users} clients={clients} />
    </div>
  )
}
