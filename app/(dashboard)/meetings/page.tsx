import Link from 'next/link'
import { getMeetings } from '@/actions/meetings'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ExternalLink, Calendar, Users } from 'lucide-react'

export default async function MeetingsPage() {
  const meetings = await getMeetings()

  const now = new Date()
  const upcoming = meetings.filter((m) => new Date(m.dateTime) >= now)
  const past = meetings.filter((m) => new Date(m.dateTime) < now)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reuniones</h1>
          <p className="text-muted-foreground text-sm">{meetings.length} reuniones</p>
        </div>
        <Button asChild>
          <Link href="/meetings/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Reunión
          </Link>
        </Button>
      </div>

      {meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border text-center">
          <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">Sin reuniones</p>
          <p className="text-xs text-muted-foreground mt-1">Crea tu primera reunión</p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Próximas ({upcoming.length})
              </h2>
              <div className="space-y-2">
                {upcoming.map((m) => (
                  <MeetingCard key={m.id} meeting={m} upcoming />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Pasadas ({past.length})
              </h2>
              <div className="space-y-2">
                {past.map((m) => (
                  <MeetingCard key={m.id} meeting={m} upcoming={false} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

type Meeting = {
  id: string
  title: string
  type: string
  dateTime: Date
  meetingLink: string | null
  notes: string | null
  client: { id: string; name: string } | null
  participants: { user: { id: string; name: string } }[]
}

function MeetingCard({ meeting: m, upcoming }: { meeting: Meeting; upcoming: boolean }) {
  const date = new Date(m.dateTime)

  return (
    <div className={`bg-card rounded-xl border p-4 flex items-start gap-4 ${upcoming ? 'border-primary/20' : ''}`}>
      {/* Date block */}
      <div className={`shrink-0 w-12 text-center rounded-lg py-1.5 ${upcoming ? 'bg-accent' : 'bg-muted'}`}>
        <p className="text-xs text-muted-foreground font-medium">
          {date.toLocaleDateString('es', { month: 'short' }).toUpperCase()}
        </p>
        <p className="text-xl font-bold text-foreground leading-tight">{date.getDate()}</p>
        <p className="text-xs text-muted-foreground">
          {date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-foreground text-sm">{m.title}</p>
            {m.client && (
              <p className="text-xs text-muted-foreground mt-0.5">{m.client.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={m.type === 'client' ? 'default' : 'secondary'} className="text-xs">
              {m.type === 'client' ? 'Cliente' : 'Interna'}
            </Badge>
            {m.meetingLink && (
              <a
                href={m.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {m.notes && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{m.notes}</p>
        )}

        <div className="flex items-center gap-1.5 mt-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {m.participants.map((p) => p.user.name).join(', ')}
          </p>
        </div>
      </div>
    </div>
  )
}
