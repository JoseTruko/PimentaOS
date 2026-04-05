'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { QuoteFormState } from '@/actions/quotes'
import { Plus, Trash2 } from 'lucide-react'

type Client = { id: string; name: string; company: string | null }
type Item = { description: string; quantity: string; unitPrice: string }

type Props = {
  action: (prevState: QuoteFormState, formData: FormData) => Promise<QuoteFormState>
  clients: Client[]
}

export function QuoteForm({ action, clients }: Props) {
  const [state, formAction, pending] = useActionState(action, {})
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: '1', unitPrice: '' }])

  useEffect(() => {
    if (state.message && !state.errors) router.push('/quotes')
  }, [state, router])

  const addItem = () => setItems([...items, { description: '', quantity: '1', unitPrice: '' }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof Item, value: string) => {
    const next = [...items]
    next[i] = { ...next[i], [field]: value }
    setItems(next)
  }

  const total = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.unitPrice) || 0
    return sum + qty * price
  }, 0)

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Título de la cotización</Label>
          <Input id="title" name="title" placeholder="Ej: Desarrollo web corporativo" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientId">Cliente *</Label>
          <Select name="clientId" defaultValue="">
            <SelectTrigger id="clientId" className="w-full">
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}{c.company ? ` — ${c.company}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.clientId && <p className="text-sm text-destructive">{state.errors.clientId[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Estado *</Label>
          <Select name="status" defaultValue="draft">
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="sent">Enviada</SelectItem>
              <SelectItem value="approved">Aprobada</SelectItem>
              <SelectItem value="rejected">Rechazada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Validez y notas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validUntil">Válida hasta</Label>
          <Input id="validUntil" name="validUntil" type="date" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notas internas</Label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            placeholder="Condiciones, aclaraciones, términos..."
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
          />
        </div>
      </div>

      {/* Items */}      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Ítems *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Agregar ítem
          </Button>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted text-xs font-medium text-muted-foreground">
            <span className="col-span-6">Descripción</span>
            <span className="col-span-2 text-right">Cantidad</span>
            <span className="col-span-3 text-right">Precio unit.</span>
            <span className="col-span-1" />
          </div>
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 px-4 py-2 border-t items-center">
              <div className="col-span-6">
                <Input
                  name="item_description"
                  value={item.description}
                  onChange={(e) => updateItem(i, 'description', e.target.value)}
                  placeholder="Descripción del servicio"
                  required
                />
              </div>
              <div className="col-span-2">
                <Input
                  name="item_quantity"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-3">
                <Input
                  name="item_unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(i, 'unitPrice', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="col-span-1 flex justify-end">
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-end px-4 py-3 border-t bg-muted/30">
            <span className="text-sm font-semibold">Total: ${total.toLocaleString('es', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        {state.errors?.items && <p className="text-sm text-destructive">{state.errors.items[0]}</p>}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : 'Crear Cotización'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  )
}
