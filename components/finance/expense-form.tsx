'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createExpense } from '@/actions/finance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const categoryLabel: Record<string, string> = {
  tools: 'Herramientas', marketing: 'Marketing', salaries: 'Salarios', other: 'Otro',
}

export function ExpenseForm() {
  const [state, formAction, pending] = useActionState(createExpense, {})
  const router = useRouter()

  useEffect(() => {
    if (state.message && !state.errors) router.refresh()
  }, [state, router])

  const today = new Date().toISOString().split('T')[0]

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="description">Descripción *</Label>
          <Input id="description" name="description" placeholder="Ej: Suscripción Figma" required />
          {state.errors?.description && <p className="text-xs text-destructive">{state.errors.description[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <Select name="category" required>
            <SelectTrigger id="category">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabel).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.category && <p className="text-xs text-destructive">{state.errors.category[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Monto *</Label>
          <Input id="amount" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required />
          {state.errors?.amount && <p className="text-xs text-destructive">{state.errors.amount[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Fecha *</Label>
          <Input id="date" name="date" type="date" defaultValue={today} required />
          {state.errors?.date && <p className="text-xs text-destructive">{state.errors.date[0]}</p>}
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Registrando...' : 'Registrar Gasto'}
      </Button>
    </form>
  )
}
