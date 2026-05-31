import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useFinance } from '../contexts/FinanceContext'
import { formatCLP, formatCLPNumber, formatDate, formatMonthYear, greeting } from '../utils/format'
import { sfToEmoji } from '../utils/icons'
import AddTransactionModal from '../components/AddTransactionModal'

export default function DashboardPage() {
  const { profile } = useAuth()
  const {
    monthlyIncome, monthlyExpenses, monthlyBalance,
    expensesByCategory, recentTransactions,
    categoryById, selectedMonth, setSelectedMonth,
  } = useFinance()
  const [showAdd, setShowAdd] = useState(false)

  function prevMonth() {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))
  }
  function nextMonth() {
    const next = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1)
    if (next <= new Date()) setSelectedMonth(next)
  }

  const isCurrentMonth = (() => {
    const now = new Date()
    return selectedMonth.getFullYear() === now.getFullYear() && selectedMonth.getMonth() === now.getMonth()
  })()

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="px-4 pt-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{greeting()}</p>
              <p className="text-xs text-gray-500">{profile?.display_name ?? 'Tu resumen financiero'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-black text-primary">$</span>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-5 text-white shadow-fab">
            {/* Month selector */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium capitalize">{formatMonthYear(selectedMonth)}</span>
              <button onClick={nextMonth} disabled={isCurrentMonth} className={`w-7 h-7 rounded-full bg-white/20 flex items-center justify-center ${isCurrentMonth ? 'opacity-30' : ''}`}>
                <ChevronRight size={16} />
              </button>
            </div>

            <p className="text-white/70 text-xs mb-1">Balance del mes</p>
            <p className={`text-4xl font-black mb-4 ${monthlyBalance < 0 ? 'text-red-200' : 'text-white'}`}>
              {formatCLP(monthlyBalance)}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/15 rounded-2xl p-3">
                <p className="text-white/70 text-xs mb-1">↓ Ingresos</p>
                <p className="font-bold text-sm">{formatCLP(monthlyIncome)}</p>
              </div>
              <div className="bg-white/15 rounded-2xl p-3">
                <p className="text-white/70 text-xs mb-1">↑ Gastos</p>
                <p className="font-bold text-sm">{formatCLP(monthlyExpenses)}</p>
              </div>
            </div>
          </div>

          {/* Top expenses by category */}
          {expensesByCategory.length > 0 && (
            <section>
              <h2 className="font-semibold text-gray-900 mb-3">Gastos por categoría</h2>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {expensesByCategory.slice(0, 6).map(({ category, total }) => (
                  <div key={category.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white rounded-2xl px-3 py-3 shadow-card w-[80px]">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: category.color_hex + '22' }}
                    >
                      <span>{sfToEmoji(category.icon)}</span>
                    </div>
                    <span className="text-xs text-gray-500 text-center leading-tight line-clamp-1">{category.name}</span>
                    <span className="text-xs font-bold text-gray-900">${formatCLPNumber(total)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent transactions */}
          <section>
            <h2 className="font-semibold text-gray-900 mb-3">Últimas transacciones</h2>
            {recentTransactions.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center shadow-card">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm font-medium text-gray-700">Sin transacciones aún</p>
                <p className="text-xs text-gray-400 mt-1">Toca + para registrar tu primer movimiento</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                {recentTransactions.map((t, i) => {
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
                        <span className={`text-sm font-bold flex-shrink-0 ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCLP(t.amount)}
                        </span>
                      </div>
                      {i < recentTransactions.length - 1 && <div className="h-px bg-gray-100 ml-16" />}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-5 flex items-center gap-2 bg-primary text-white px-5 py-3.5 rounded-full shadow-fab font-semibold text-sm z-10"
      >
        <span className="text-lg leading-none">+</span>
        Registrar
      </button>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </>
  )
}
