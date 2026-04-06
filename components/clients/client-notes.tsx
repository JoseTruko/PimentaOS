'use client'

import { useActionState, useRef, useEffect } from 'react'
import { createClientNote, deleteClientNote } from '@/actions/client-notes'
import { Button } from '@/components/ui/button'
import { Trash2, Send, StickyNote } from 'lucide-react'

type Note = {
  id: string
  content: string
  createdAt: Date
  user: { id: string; name: string }
}

type Props = {
  clientId: string
  notes: Note[]
  currentUserId: string
  currentUserRole: string
}

export function ClientNotes({ clientId, notes, currentUserId, currentUserRole }: Props) {
  const createNoteWithId = createClientNote.bind(null, clientId)
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean }, formData: FormData) => {
      return await createNoteWithId(formData) ?? {}
    },
    {} as { error?: string; success?: boolean }
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state])

  return (
    <div className="space-y-4">
      {/* Input */}
      <form ref={formRef} action={formAction} className="flex gap-2">
        <textarea
          name="content"
          rows={2}
          placeholder="Agregar una nota sobre este cliente..."
          className="flex-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
          required
        />
        <Button type="submit" size="icon" disabled={pending} className="self-end shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </form>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <StickyNote className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Sin notas aún</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            Registra llamadas, acuerdos o cualquier interacción importante
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="flex gap-3 group">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">
                  {note.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{note.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleDateString('es', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{note.content}</p>
              </div>
              {(note.user.id === currentUserId || currentUserRole === 'admin') && (
                <form
                  action={async () => {
                    await deleteClientNote(note.id, clientId)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <button
                    type="submit"
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    title="Eliminar nota"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
