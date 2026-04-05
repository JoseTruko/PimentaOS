'use client'

type MonthData = { month: string; income: number; expenses: number }

export function FinanceChart({ data }: { data: MonthData[] }) {
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
      Sin datos suficientes para mostrar el gráfico
    </div>
  )

  const max = Math.max(...data.flatMap(d => [d.income, d.expenses]), 1)

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className="w-full flex gap-0.5 items-end" style={{ height: '100%' }}>
              <div
                className="flex-1 rounded-t-sm bg-primary/80 transition-all"
                style={{ height: `${(d.income / max) * 100}%`, minHeight: d.income > 0 ? '4px' : '0' }}
                title={`Ingresos: $${d.income.toLocaleString('es')}`}
              />
              <div
                className="flex-1 rounded-t-sm bg-rose-400/70 transition-all"
                style={{ height: `${(d.expenses / max) * 100}%`, minHeight: d.expenses > 0 ? '4px' : '0' }}
                title={`Gastos: $${d.expenses.toLocaleString('es')}`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 justify-between">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-muted-foreground font-medium">
            {d.month}
          </span>
        ))}
      </div>
      <div className="flex gap-4 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-primary/80" />
          <span className="text-xs text-muted-foreground">Ingresos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-rose-400/70" />
          <span className="text-xs text-muted-foreground">Gastos</span>
        </div>
      </div>
    </div>
  )
}
