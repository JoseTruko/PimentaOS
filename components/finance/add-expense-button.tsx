'use client'

import { useActionState, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createExpense } from '@/actions/finance'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AddExpenseButton() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createExpense, {})
  const router = useRouter()

  useEffect(() => {
    if (state.message && !state.errors) {
      setOpen(false)
      router.refresh()
    }
  }, [state, router])

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Gasto
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl border p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Registrar Gasto</h2>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label>Descripción *</Label>
            <Input name="description" placeholder="Ej: Suscripción Adobe" required />
            {state.errors?.description && <p className="text-xs text-destructive">{state.errors.description[0]}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Monto *</Label>
              <Input name="amount" type="number" min="0" step="0.01" placeholder="0.00" required />
              {state.errors?.amount && <p className="text-xs text-destructive">{state.errors.amount[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select name="category" defaultValue="other">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tools">Herramientas</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="salaries">Salarios</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fecha *</Label>
            <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? 'Guardando...' : 'Registrar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
