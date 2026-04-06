import { getMeetings } from '@/actions/meetings'
import { Badge } from '@/components/ui/badge'
import { NewMeetingButton } from '@/components/meetings/new-meeting-button'
import { DeleteMeetingButton } from '@/components/meetings/delete-meeting-button'
import { MeetingCalendar } from '@/components/meetings/meeting-calendar'
import { prisma } from '@/lib/prisma'
import { Clock, Video, Users } from 'lucide-react'

export default async function MeetingsPage() {
  const [meetings, clients, users] = await Promise.all([
    getMeetings(),
    prisma.client.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const now = new Date()
  const upcoming = meetings.filter((m) => new Date(m.dateTime) >= now)
  const past = meetings.filter((m) => new Date(m.dateTime) < now)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground text-sm mt-1">{meetings.length} reuniones en total</p>
        </div>
        <NewMeetingButton clients={clients} users={users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 overflow-x-auto">
          <MeetingCalendar meetings={meetings.map(m => ({
            id: m.id,
            title: m.title,
            dateTime: m.dateTime.toISOString(),
            type: m.type,
            clientName: m.client?.name,
          }))} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming */}
          <div className="bg-card rounded-xl border">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-foreground">Próximas ({upcoming.length})</h2>
            </div>
            {upcoming.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                Sin reuniones próximas
              </div>
            ) : (
              <div className="divide-y">
                {upcoming.slice(0, 5).map((meeting) => {
                  const date = new Date(meeting.dateTime)
                  return (
                    <div key={meeting.id} className="px-5 py-3 flex gap-3">
                      <div className="text-center shrink-0 w-9">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                          {date.toLocaleString('es', { month: 'short' })}
                        </p>
                        <p className="text-lg font-bold text-foreground leading-tight">{date.getDate()}</p>
                      </div>
                      <div className="border-l pl-3 min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          {date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                          <Badge variant={meeting.type === 'client' ? 'default' : 'secondary'} className="ml-1 text-[10px]">
                            {meeting.type === 'client' ? 'Cliente' : 'Interna'}
                          </Badge>
                        </p>
                        <p className="text-sm font-medium text-foreground truncate">{meeting.title}</p>
                        {meeting.client && (
                          <p className="text-xs text-muted-foreground truncate">{meeting.client.name}</p>
                        )}
                        {meeting.participants.length > 0 && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Users className="h-3 w-3" />
                            {meeting.participants.map(p => p.user.name).join(', ')}
                          </p>
                        )}
                        {meeting.meetingLink && (
                          <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary flex items-center gap-1 mt-0.5 hover:underline">
                            <Video className="h-3 w-3" /> Unirse
                          </a>
                        )}
                      </div>
                      <DeleteMeetingButton id={meeting.id} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Category guide */}
          <div className="bg-card rounded-xl border px-5 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categorías</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Reuniones con cliente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-xs text-muted-foreground">Reuniones internas</span>
              </div>
            </div>
          </div>

          {/* Past meetings */}
          {past.length > 0 && (
            <div className="bg-card rounded-xl border">
              <div className="px-5 py-4 border-b">
                <h2 className="font-semibold text-foreground text-sm">Historial ({past.length})</h2>
              </div>
              <div className="divide-y">
                {past.slice(0, 3).map((meeting) => {
                  const date = new Date(meeting.dateTime)
                  return (
                    <div key={meeting.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground/60 truncate">{meeting.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {date.toLocaleDateString('es', { dateStyle: 'medium' })}
                        </p>
                      </div>
                      <DeleteMeetingButton id={meeting.id} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
