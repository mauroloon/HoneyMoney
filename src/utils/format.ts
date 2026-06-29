// Formato peso chileno: $1.200.000
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Solo número: 1.200.000
export function formatCLPNumber(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 0,
  }).format(amount)
}

// Parsea "YYYY-MM-DD" (o ISO completo) como fecha LOCAL para evitar el
// desplazamiento UTC: new Date("2026-07-01") == 30 jun 20:00 en UTC-4.
export function parseLocalDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('T')[0].split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Devuelve la fecha de hoy (u otra Date) como "YYYY-MM-DD" en hora local.
export function localDateStr(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Fecha en español: "15 de mayo"
export function formatDate(isoDate: string): string {
  return parseLocalDate(isoDate).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
  })
}

// Mes y año: "Mayo 2025"
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric',
  }).replace(/^\w/, c => c.toUpperCase())
}

// Agrupar transacciones por mes: "Mayo 2025" → [...]
export function groupByMonth(items: { date: string }[]): Record<string, typeof items> {
  const groups: Record<string, typeof items> = {}
  for (const item of items) {
    const key = formatMonthYear(parseLocalDate(item.date))
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  }
  return groups
}

export function isSameMonth(isoDate: string, ref: Date): boolean {
  const d = parseLocalDate(isoDate)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

export function daysRemaining(isoDate: string): number {
  const diff = new Date(isoDate).getTime() - Date.now()
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0)
}

export function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días 👋'
  if (h < 19) return 'Buenas tardes 👋'
  return 'Buenas noches 👋'
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
