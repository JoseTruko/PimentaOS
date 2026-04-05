'use client'

import { useActionState, useEffect, useRef, useTransition } from 'react'
import { createTask, toggleTask, deleteTask } from '@/actions/tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react'

type Task = { id: string; title: string; done: boolean; order: number }

export function ProjectTasks({ projectId, tasks, progress }: {
  projectId: string
  tasks: Task[]
  progress: number
}) {
  const createTaskWithId = createTask.bind(null, projectId)
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string }, fd: FormData) => await createTaskWithId(fd) ?? {},
    {}
  )
  const formRef = useRef<HTMLFormElement>(null)
  const [toggling, startToggle] = useTransition()
  const [deleting, startDelete] = useTransition()

  useEffect(() => { if (state.success) formRef.current?.reset() }, [state])

  const done = tasks.filter(t => t.done).length

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{done} de {tasks.length} completadas</span>
          <span className="font-semibold text-foreground">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-1">
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sin tareas aún. Agrega la primera abajo.
          </p>
        )}
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2 group py-1">
            <button
              disabled={toggling}
              onClick={() => startToggle(() => toggleTask(task.id, projectId, !task.done))}
              className="text-muted-foreground hover:text-primary transition-colors shrink-0"
            >
              {task.done
                ? <CheckSquare className="h-4 w-4 text-primary" />
                : <Square className="h-4 w-4" />
              }
            </button>
            <span className={`flex-1 text-sm ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </span>
            <button
              disabled={deleting}
              onClick={() => startDelete(() => deleteTask(task.id, projectId))}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add task */}
      <form ref={formRef} action={formAction} className="flex gap-2">
        <Input name="title" placeholder="Nueva tarea..." required className="flex-1" />
        <Button type="submit" size="sm" disabled={pending}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
    </div>
  )
}
