'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { QuoteFormState } from '@/actions/quotes'

type Client = { id: string; name: string; company: string | null }

type Props = {
  action: (prevState: QuoteFormState, formData: FormData) => Promise<QuoteFormState>
  clients: Client[]
}

export function NewQuoteForm({ action, clients }: Props) {
  const [state, formAction, pending] = useActionState(action, {})
  const router = useRouter()

  useEffect(() => {
    if (state.quoteId) {
      router.push(`/quotes/${state.quoteId}`)
    }
  }, [state.quoteId, router])

  return (
    <form action={formAction} className="space-y-5 bg-card rounded-xl border p-6">
      <div className="space-y-2">
        <Label htmlFor="clientId">Cliente *</Label>
        <Select name="clientId" required>
          <SelectTrigger id="clientId" className="h-11">
            <SelectValue placeholder="Selecciona un cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}{c.company ? ` · ${c.company}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors?.clientId && (
          <p className="text-xs text-destructive">{state.errors.clientId[0]}</p>
        )}
      </div>

      <Button type="submit" className="w-full h-11" disabled={pending}>
        {pending ? 'Creando...' : 'Crear Cotización'}
      </Button>
    </form>
  )
}
