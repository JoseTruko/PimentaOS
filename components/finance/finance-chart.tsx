'use client'

type MonthData = { month: string; income: number; expenses: number }

export function FinanceChart({ data }: { data: MonthData[] }) {
  const hasData = data.some(d => d.income > 0 || d.expenses > 0)

  if (!hasData) return (
    <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
      Sin datos suficientes para mostrar el gráfico
    </div>
  )

  const max = Math.max(...data.flatMap(d => [d.income, d.expenses]), 1)

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3 h-44 px-1">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1 h-full justify-end">
            {/* Bars */}
            <div className="flex gap-1 items-end h-full">
              {/* Income bar */}
              <div className="flex-1 flex flex-col justify-end h-full">
                <div
                  className="w-full rounded-t-md bg-primary transition-all duration-500"
                  style={{
                    height: d.income > 0 ? `${Math.max((d.income / max) * 100, 3)}%` : '0%',
                  }}
                  title={`Ingresos: $${d.income.toLocaleString('es')}`}
                />
              </div>
              {/* Expense bar */}
              <div className="flex-1 flex flex-col justify-end h-full">
                <div
                  className="w-full rounded-t-md bg-rose-400 transition-all duration-500"
                  style={{
                    height: d.expenses > 0 ? `${Math.max((d.expenses / max) * 100, 3)}%` : '0%',
                  }}
                  title={`Gastos: $${d.expenses.toLocaleString('es')}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Month labels */}
      <div className="flex gap-3 px-1">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-muted-foreground font-medium">
            {d.month}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-6 justify-center pt-1">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-primary" />
          <span className="text-xs text-muted-foreground">Ingresos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-rose-400" />
          <span className="text-xs text-muted-foreground">Gastos</span>
        </div>
      </div>
    </div>
  )
}
