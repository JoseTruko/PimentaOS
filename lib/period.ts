export type Period = '1m' | '3m' | '6m' | '1y' | 'all'

export function getPeriodRange(period: Period): { start: Date | null; label: string } {
  const now = new Date()
  switch (period) {
    case '1m':
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), label: 'Este mes' }
    case '3m':
      return { start: new Date(now.getFullYear(), now.getMonth() - 2, 1), label: 'Últimos 3 meses' }
    case '6m':
      return { start: new Date(now.getFullYear(), now.getMonth() - 5, 1), label: 'Últimos 6 meses' }
    case '1y':
      return { start: new Date(now.getFullYear(), 0, 1), label: 'Este año' }
    case 'all':
    default:
      return { start: null, label: 'Todo el tiempo' }
  }
}

// How many months to show in the chart based on period
export function getChartMonths(period: Period): number {
  switch (period) {
    case '1m': return 1
    case '3m': return 3
    case '6m': return 6
    case '1y': return 12
    case 'all': return 12
    default: return 6
  }
}
