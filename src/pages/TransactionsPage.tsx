import { useState, useMemo } from 'react'
import { useFinance } from '../contexts/FinanceContext'
import { formatCLP, formatCLPNumber, formatDate, formatMonthYear } from '../utils/format'
import { TransactionType } from '../types'
import AddTransactionModal from '../components/AddTransactionModal'

type Filter = TransactionType | 'all'

function Disc({ color, size = 38 }: { color: string; size?: number }) {
  return (
    <span style={{ display: 'inline-block', flexShrink: 0, width: size, height: size, borderRadius: '50%', background: color }} />
  )
}
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" /><path d="M21 21 L16.65 16.65" />
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 5.5 L12 18.5 M5.5 12 L18.5 12" />
    </svg>
  )
}

export default function TransactionsPage() {
  const { transactions, categoryById, deleteTransaction } = useFinance()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return transactions
      .filter(t => filter === 'all' || t.type === filter)
      .filter(t => {
        if (!search) return true
        const cat = categoryById(t.category_id)
        return (
          cat?.name.toLowerCase().includes(search.toLowerCase()) ||
          t.note.toLowerCase().includes(search.toLowerCase())
        )
      })
  }, [transactions, filter, search, categoryById])

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {}
    for (const t of filtered) {
      const key = formatMonthYear(new Date(t.date))
      if (!map[key]) map[key] = []
      map[key].push(t)
    }
    return Object.entries(map)
  }, [filtered])

  const chips: { label: string; value: Filter }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Ingresos', value: 'income' },
    { label: 'Gastos', value: 'expense' },
  ]

  const chipActive = (v: Filter) =>
    v === 'income' ? 'var(--income)' : v === 'expense' ? 'var(--expense)' : 'var(--honey)'

  async function handleDelete(id: string) {
    await deleteTransaction(id)
    setConfirmDelete(null)
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
        {/* Page title */}
        <div style={{ padding: '52px 22px 0' }}>
          <p className="eyebrow" style={{ marginBottom: 4 }}>Historial</p>
          <p className="font-serif" style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)', marginBottom: 18 }}>Movimientos</p>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', borderRadius: 999, padding: '10px 16px', marginBottom: 12, border: '1px solid var(--line-soft)' }}>
            <span style={{ color: 'var(--faint)', flexShrink: 0 }}><SearchIcon /></span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar categoría o nota"
              style={{ flex: 1, background: 'transparent', border: 0, outline: 0, fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)' }}
            />
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16 }} className="no-scrollbar">
            {chips.map(c => (
              <button
                key={c.value}
                onClick={() => setFilter(c.value)}
                style={{
                  flexShrink: 0, border: 0, borderRadius: 999,
                  padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                  background: filter === c.value ? chipActive(c.value) : 'var(--surface-2)',
                  color: filter === c.value ? 'white' : 'var(--muted)',
                  transition: 'all 0.2s ease',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 no-scrollbar" style={{ overflowY: 'auto', padding: '0 22px', paddingBottom: 120 }}>
          {grouped.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', textAlign: 'center' }}>
              <span style={{ display: 'block', width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-2)', margin: '0 auto 14px' }} />
              <p style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Sin transacciones</p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>{search ? 'Prueba con otro término' : 'Registra tu primer movimiento'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {grouped.map(([month, txs]) => {
                const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
                const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
                return (
                  <div key={month}>
                    {/* Section header */}
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span className="eyebrow" style={{ fontSize: 11 }}>{month}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {income > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--income)' }}>+${formatCLPNumber(income)}</span>}
                        {expense > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--expense)' }}>−${formatCLPNumber(expense)}</span>}
                      </div>
                    </div>

                    {/* Transactions */}
                    <div className="card-honey" style={{ overflow: 'hidden' }}>
                      {txs.map((t, i) => {
                        const cat = categoryById(t.category_id)
                        const isIncome = t.type === 'income'
                        return (
                          <div key={t.id}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px' }}>
                              <Disc color={cat?.color_hex ?? '#9E7A55'} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {cat?.name ?? 'Sin categoría'}
                                </p>
                                <p style={{ fontSize: 12, color: 'var(--faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {t.note ? `${t.note} · ` : ''}{formatDate(t.date)}
                                </p>
                              </div>
                              <p className="font-serif tnum" style={{ fontSize: 15, fontWeight: 600, flexShrink: 0, marginRight: 8, color: isIncome ? 'var(--income)' : 'var(--ink)' }}>
                                {isIncome ? '+' : '−'}{formatCLP(t.amount)}
                              </p>
                              <button
                                onClick={() => setConfirmDelete(t.id)}
                                style={{ width: 28, height: 28, borderRadius: '50%', border: 0, background: '#FDEEE9', color: 'var(--expense)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                              >
                                <TrashIcon />
                              </button>
                            </div>
                            {i < txs.length - 1 && <div style={{ height: 1, background: 'var(--line-soft)', marginLeft: 70 }} />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        style={{
          position: 'fixed', right: 22, bottom: 96,
          width: 56, height: 56, borderRadius: '50%', border: 0,
          background: 'var(--honey)', color: 'var(--on-honey)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 10,
          boxShadow: '0 10px 28px -8px rgba(201,136,48,0.55)',
        }}
      >
        <PlusIcon />
      </button>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center p-4">
          <div className="card-honey w-full max-w-sm p-6">
            <p className="font-serif" style={{ fontSize: 20, fontWeight: 500, textAlign: 'center', color: 'var(--ink)', marginBottom: 6 }}>¿Eliminar?</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginBottom: 22 }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '14px 0', borderRadius: 999, border: 0, background: 'var(--surface-2)', color: 'var(--muted)', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ flex: 1, padding: '14px 0', borderRadius: 999, border: 0, background: '#FDEEE9', color: 'var(--expense)', fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
