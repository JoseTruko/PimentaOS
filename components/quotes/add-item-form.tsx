'use client'

import { useActionState, useState } from 'react'
import { addQuoteItem } from '@/actions/quotes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'

export function AddItemForm({ quoteId }: { quoteId: string }) {
  const addItem = addQuoteItem.bind(null, quoteId)
  const [state, formAction, pending] = useActionState(addItem, {})
  const [qty, setQty] = useState('1')
  const [price, setPrice] = useState('0')

  const subtotal = (parseFloat(qty) || 0) * (parseFloat(price) || 0)

  return (
    <form action={formAction} className="bg-muted/40 rounded-xl border p-4 space-y-4">
      <p className="text-sm font-semibold text-foreground">Agregar ítem</p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="description" className="text-xs">Descripción *</Label>
          <Input id="description" name="description" placeholder="Ej: Diseño de logo" required />
          {state.errors?.description && (
            <p className="text-xs text-destructive">{state.errors.description[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="quantity" className="text-xs">Cantidad *</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="unitPrice" className="text-xs">Precio unitario *</Label>
          <Input
            id="unitPrice"
            name="unitPrice"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Subtotal: <span className="font-semibold text-foreground">${subtotal.toLocaleString('es')}</span>
        </p>
        <Button type="submit" size="sm" disabled={pending}>
          <Plus className="mr-1.5 h-4 w-4" />
          {pending ? 'Agregando...' : 'Agregar ítem'}
        </Button>
      </div>
    </form>
  )
}
