'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Meeting = {
  id: string
  title: string
  dateTime: string
  type: string
  clientName?: string
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export function MeetingCalendar({ meetings }: { meetings: Meeting[] }) {
  const today = new Date()
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = current.getFullYear()
  const month = current.getMonth()

  const firstDay = new Date(year, month, 1)
  // Monday-based: 0=Mon ... 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  const getMeetingsForDay = (day: number) =>
    meetings.filter((m) => {
      const d = new Date(m.dateTime)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })

  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div>
          <h2 className="text-lg font-bold text-foreground">{MONTHS[month]} {year}</h2>
          <p className="text-xs text-muted-foreground">Vista mensual</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrent(new Date(year, month - 1, 1))}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrent(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="px-3 h-8 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => setCurrent(new Date(year, month + 1, 1))}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const dayMeetings = day ? getMeetingsForDay(day) : []
          return (
            <div
              key={i}
              className={`min-h-[80px] p-1.5 border-b border-r last:border-r-0 ${
                !day ? 'bg-muted/20' : ''
              } ${i % 7 === 0 ? 'border-l-0' : ''}`}
            >
              {day && (
                <>
                  <span className={`text-xs font-medium inline-flex h-5 w-5 items-center justify-center rounded-full ${
                    isToday(day)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground'
                  }`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayMeetings.slice(0, 2).map((m) => (
                      <div
                        key={m.id}
                        className={`text-[10px] font-medium px-1 py-0.5 rounded truncate ${
                          m.type === 'client'
                            ? 'bg-primary/15 text-primary'
                            : 'bg-blue-500/15 text-blue-600'
                        }`}
                        title={m.title}
                      >
                        {m.title}
                      </div>
                    ))}
                    {dayMeetings.length > 2 && (
                      <p className="text-[10px] text-muted-foreground pl-1">+{dayMeetings.length - 2} más</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
