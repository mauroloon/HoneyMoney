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
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))
  }


  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="px-4 pt-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{greeting()}</p>
              <p className="font-bold text-gray-900 text-xl leading-tight mt-0.5">{profile?.display_name ?? 'Tu resumen'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-fab">
              <span className="text-base font-black text-white">
                {profile?.display_name?.charAt(0).toUpperCase() ?? '$'}
              </span>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-primary rounded-3xl p-5 text-white shadow-fab">
            {/* Month selector */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors">
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs font-semibold capitalize tracking-wide opacity-80">{formatMonthYear(selectedMonth)}</span>
              <button onClick={nextMonth} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>

            <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Balance</p>
            <p className={`text-[2.75rem] font-black leading-none mb-5 tracking-tight ${monthlyBalance < 0 ? 'text-red-200' : 'text-white'}`}>
              {formatCLP(monthlyBalance)}
            </p>

            <div className="flex gap-0 divide-x divide-white/10">
              <div className="flex-1 pr-4">
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1">Ingresos</p>
                <p className="font-bold text-sm text-white">{formatCLP(monthlyIncome)}</p>
              </div>
              <div className="flex-1 pl-4">
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1">Gastos</p>
                <p className="font-bold text-sm text-white">{formatCLP(monthlyExpenses)}</p>
              </div>
            </div>
          </div>

          {/* Top expenses by category */}
          {expensesByCategory.length > 0 && (
            <section>
              <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Gastos por categoría</h2>
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {expensesByCategory.slice(0, 6).map(({ category, total }) => (
                  <div key={category.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white rounded-2xl px-3 py-3 shadow-card w-[78px]">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: category.color_hex + '18' }}
                    >
                      <span>{sfToEmoji(category.icon)}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 text-center leading-tight line-clamp-1 font-medium">{category.name}</span>
                    <span className="text-[11px] font-bold text-gray-900">${formatCLPNumber(total)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent transactions */}
          <section>
            <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Últimas transacciones</h2>
            {recentTransactions.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center shadow-card">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📭</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">Sin transacciones aún</p>
                <p className="text-xs text-gray-400 mt-1">Toca Registrar para tu primer movimiento</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                {recentTransactions.map((t, i) => {
                  const cat = categoryById(t.category_id)
                  return (
                    <div key={t.id}>
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ backgroundColor: (cat?.color_hex ?? '#8E8E93') + '18' }}
                        >
                          <span>{sfToEmoji(cat?.icon ?? '•••')}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{cat?.name ?? 'Sin categoría'}</p>
                          {t.note
                            ? <p className="text-xs text-gray-400 truncate">{t.note}</p>
                            : <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
                          }
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`text-sm font-bold block ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                            {t.type === 'income' ? '+' : '−'}{formatCLP(t.amount)}
                          </span>
                          {t.note && <span className="text-[10px] text-gray-400">{formatDate(t.date)}</span>}
                        </div>
                      </div>
                      {i < recentTransactions.length - 1 && <div className="h-px bg-gray-100 ml-[60px]" />}
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
        className="fixed bottom-24 right-5 flex items-center gap-2 bg-primary text-white px-5 py-3.5 rounded-full shadow-fab font-bold text-sm z-10 active:scale-95 transition-transform duration-100"
      >
        <span className="text-base font-black leading-none">+</span>
        Registrar
      </button>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </>
  )
}
