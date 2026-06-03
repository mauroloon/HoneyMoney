import { useState, useMemo } from 'react'
import { Trash2, Search, Plus, Pencil, ArrowUpDown } from 'lucide-react'
import { useFinance } from '../contexts/FinanceContext'
import { formatCLP, formatCLPNumber, formatDate, formatMonthYear } from '../utils/format'
import { sfToEmoji } from '../utils/icons'
import { TransactionType, Transaction } from '../types'
import AddTransactionModal from '../components/AddTransactionModal'

type Filter = TransactionType | 'all'
type SortOrder = 'desc' | 'asc'

export default function TransactionsPage() {
  const { transactions, categoryById, deleteTransaction } = useFinance()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showAdd, setShowAdd] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
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
      .sort((a, b) => sortOrder === 'desc'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date)
      )
  }, [transactions, filter, search, sortOrder, categoryById])

  // Group by month
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
    { label: '↓ Ingresos', value: 'income' },
    { label: '↑ Gastos', value: 'expense' },
  ]

  const chipColor = (v: Filter) => v === 'income' ? '#34C759' : v === 'expense' ? '#FF3B30' : '#00C57A'

  async function handleDelete(id: string) {
    await deleteTransaction(id)
    setConfirmDelete(null)
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2.5 shadow-card">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar categoría o nota"
              className="flex-1 text-sm text-gray-900 placeholder-gray-400 bg-transparent"
            />
          </div>
        </div>

        {/* Filter chips + sort */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar items-center">
          {chips.map(c => (
            <button
              key={c.value}
              onClick={() => setFilter(c.value)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={filter === c.value
                ? { backgroundColor: chipColor(c.value), color: 'white' }
                : { backgroundColor: '#E5E5EA', color: '#3C3C43' }
              }
            >
              {c.label}
            </button>
          ))}
          <button
            onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
            className="flex-shrink-0 ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{ backgroundColor: '#E5E5EA', color: '#3C3C43' }}
            title={sortOrder === 'desc' ? 'Más reciente primero' : 'Más antiguo primero'}
          >
            <ArrowUpDown size={13} />
            <span className="text-xs">{sortOrder === 'desc' ? 'Reciente' : 'Antiguo'}</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24 space-y-4">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-medium text-gray-700">Sin transacciones</p>
              <p className="text-sm text-gray-400 mt-1">{search ? 'Prueba con otro término' : 'Registra tu primer movimiento'}</p>
            </div>
          ) : (
            grouped.map(([month, txs]) => {
              const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
              const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
              return (
                <div key={month}>
                  {/* Section header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{month}</span>
                    <div className="flex gap-2 text-xs">
                      {income > 0 && <span className="text-income font-medium">+${formatCLPNumber(income)}</span>}
                      {expense > 0 && <span className="text-expense font-medium">-${formatCLPNumber(expense)}</span>}
                    </div>
                  </div>

                  {/* Transactions */}
                  <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                    {txs.map((t, i) => {
                      const cat = categoryById(t.category_id)
                      return (
                        <div key={t.id}>
                          <div className="flex items-center gap-3 px-4 py-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                              style={{ backgroundColor: (cat?.color_hex ?? '#8E8E93') + '22' }}
                            >
                              <span>{sfToEmoji(cat?.icon ?? '•••')}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{cat?.name ?? 'Sin categoría'}</p>
                              {t.note && <p className="text-xs text-gray-400 truncate">{t.note}</p>}
                              <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
                            </div>
                            <span className={`text-sm font-bold flex-shrink-0 mr-2 ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                              {t.type === 'income' ? '+' : '-'}{formatCLP(t.amount)}
                            </span>
                            <button
                              onClick={() => setEditingTransaction(t)}
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 flex-shrink-0"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(t.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-expense flex-shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          {i < txs.length - 1 && <div className="h-px bg-gray-100 ml-16" />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-fab flex items-center justify-center z-10"
      >
        <Plus size={24} />
      </button>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
      {editingTransaction && (
        <AddTransactionModal transaction={editingTransaction} onClose={() => setEditingTransaction(null)} />
      )}

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <p className="font-semibold text-gray-900 text-center mb-1">¿Eliminar transacción?</p>
            <p className="text-sm text-gray-500 text-center mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm">
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-3 rounded-2xl bg-expense text-white font-semibold text-sm">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
