import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import { useFinance } from '../contexts/FinanceContext'
import { formatCLP, formatMonthYear, monthKey } from '../utils/format'
import { sfToEmoji } from '../utils/icons'
import { Budget, Category } from '../types'

// ── Helpers ───────────────────────────────────────────────

function spentColor(pct: number): string {
  if (pct >= 1) return '#FF3B30'
  if (pct >= 0.85) return '#FF9500'
  return '#00C57A'
}

type Recommendation = {
  id: string
  icon: string
  message: string
  accent: string
}

// ── Page ──────────────────────────────────────────────────

export default function BudgetsPage() {
  const {
    budgets,
    currentMonthBudgets,
    expensesByCategory,
    expenseCategories,
    categoryById,
    selectedMonth,
    setSelectedMonth,
    addBudget,
    updateBudget,
    deleteBudget,
    copyBudgetsToMonth,
  } = useFinance()

  const [showAdd, setShowAdd]             = useState(false)
  const [editBudget, setEditBudget]       = useState<Budget | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [copying, setCopying]             = useState(false)

  function prevMonth() {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))
  }
  function nextMonth() {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))
  }

  // month keys
  const currentKey  = monthKey(selectedMonth)
  const prevMonthDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1)
  const nextMonthDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1)
  const prevKey     = monthKey(prevMonthDate)
  const nextKey     = monthKey(nextMonthDate)

  const prevMonthBudgets = budgets.filter(b => b.month === prevKey)
  const nextMonthBudgets = budgets.filter(b => b.month === nextKey)

  async function handleCopyToNext() {
    setCopying(true)
    await copyBudgetsToMonth(currentKey, nextKey)
    setCopying(false)
    setSelectedMonth(nextMonthDate)
  }

  async function handleCopyFromPrev() {
    setCopying(true)
    await copyBudgetsToMonth(prevKey, currentKey)
    setCopying(false)
  }

  // ── Summary totals ──
  const totalBudget = currentMonthBudgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent  = currentMonthBudgets.reduce((s, b) => {
    return s + (expensesByCategory.find(e => e.category.id === b.category_id)?.total ?? 0)
  }, 0)
  const overallPct  = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0
  const available   = Math.max(totalBudget - totalSpent, 0)
  const isOverAll   = totalSpent > totalBudget

  // ── Recommendations ──
  const recommendations = useMemo<Recommendation[]>(() => {
    const recs: Recommendation[] = []

    currentMonthBudgets.forEach(b => {
      const cat   = categoryById(b.category_id)
      if (!cat) return
      const spent = expensesByCategory.find(e => e.category.id === b.category_id)?.total ?? 0
      const pct   = b.amount > 0 ? spent / b.amount : 0

      if (pct > 1) {
        recs.push({
          id: `over-${b.id}`,
          icon: '🚨',
          message: `Excediste el límite en ${cat.name}`,
          accent: '#FF3B30',
        })
      } else if (pct > 0.85) {
        recs.push({
          id: `near-${b.id}`,
          icon: '⚡',
          message: `Casi al límite en ${cat.name} (${Math.round(pct * 100)}%)`,
          accent: '#FF9500',
        })
      }
    })

    // Suggest budgeting high-spend categories that have no budget yet
    const budgetedIds = new Set(currentMonthBudgets.map(b => b.category_id))
    expensesByCategory
      .filter(e => !budgetedIds.has(e.category.id) && e.total > 15000)
      .slice(0, 2)
      .forEach(e => {
        recs.push({
          id: `suggest-${e.category.id}`,
          icon: '💡',
          message: `Presupuesta ${e.category.name} — gastaste ${formatCLP(e.total)}`,
          accent: '#007AFF',
        })
      })

    if (recs.length === 0 && currentMonthBudgets.length > 0) {
      recs.push({
        id: 'ok',
        icon: '✅',
        message: totalSpent === 0 ? 'Presupuesto listo para este mes' : '¡Todo bajo control este mes!',
        accent: '#00C57A',
      })
    }

    return recs
  }, [currentMonthBudgets, expensesByCategory, categoryById, totalSpent])

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-28 md:pb-8">
        <div className="px-4 pt-4 space-y-3 md:px-8 md:pt-6">

          {/* Month navigator */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-card"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-700 capitalize">
              {formatMonthYear(selectedMonth)}
            </span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-card"
            >
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>

          {/* Summary card */}
          {currentMonthBudgets.length > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Total presupuestado</p>
                  <p className="text-[22px] font-black text-gray-900 leading-none">{formatCLP(totalBudget)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-0.5">{isOverAll ? 'Excedido' : 'Disponible'}</p>
                  <p
                    className="text-lg font-bold leading-none"
                    style={{ color: isOverAll ? '#FF3B30' : '#00C57A' }}
                  >
                    {isOverAll ? `−${formatCLP(totalSpent - totalBudget)}` : formatCLP(available)}
                  </p>
                </div>
              </div>

              {/* Global progress bar */}
              <div className="h-2.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(overallPct * 100, 100)}%`,
                    backgroundColor: spentColor(overallPct),
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-800">{formatCLP(totalSpent)}</span> gastado
                </p>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: spentColor(overallPct),
                    backgroundColor: spentColor(overallPct) + '20',
                  }}
                >
                  {Math.round(overallPct * 100)}% usado
                </span>
              </div>

              {/* Copy to next month */}
              <button
                onClick={handleCopyToNext}
                disabled={copying}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gray-50 text-gray-500 text-xs font-semibold transition-all active:bg-gray-100"
              >
                <Copy size={13} />
                {copying
                  ? 'Copiando...'
                  : nextMonthBudgets.length > 0
                  ? `Sobreescribir ppto. de ${formatMonthYear(nextMonthDate)}`
                  : `Copiar a ${formatMonthYear(nextMonthDate)}`}
              </button>
            </div>
          )}

          {/* Recommendations strip */}
          {recommendations.length > 0 && (
            <div className="-mx-4 overflow-x-auto no-scrollbar">
              <div className="flex gap-2 px-4 pb-0.5" style={{ width: 'max-content' }}>
                {recommendations.map(rec => (
                  <div
                    key={rec.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl flex-shrink-0"
                    style={{
                      backgroundColor: rec.accent + '14',
                      border: `1px solid ${rec.accent}30`,
                    }}
                  >
                    <span className="text-sm">{rec.icon}</span>
                    <p
                      className="text-[11px] font-medium"
                      style={{ color: rec.accent, maxWidth: 210 }}
                    >
                      {rec.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {currentMonthBudgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-4xl">📊</span>
              </div>
              <p className="text-[17px] font-semibold text-gray-800">Sin presupuesto aún</p>
              <p className="text-sm text-gray-400 mt-2 px-8 leading-relaxed">
                Crea límites por categoría para saber cuánto pueden gastar este mes
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-6 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold text-sm shadow-fab"
              >
                <Plus size={16} /> Crear presupuesto
              </button>

              {/* Copy from previous month shortcut */}
              {prevMonthBudgets.length > 0 && (
                <button
                  onClick={handleCopyFromPrev}
                  disabled={copying}
                  className="mt-3 flex items-center gap-2 text-sm text-gray-400 font-medium px-4 py-2 rounded-full bg-white shadow-card"
                >
                  <Copy size={13} />
                  {copying
                    ? 'Copiando...'
                    : `Copiar de ${formatMonthYear(prevMonthDate)}`}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {currentMonthBudgets.map(budget => {
                const cat   = categoryById(budget.category_id)
                if (!cat) return null
                const spent = expensesByCategory.find(e => e.category.id === budget.category_id)?.total ?? 0
                const pct   = budget.amount > 0 ? spent / budget.amount : 0
                const color = spentColor(pct)
                const isOver = pct > 1

                return (
                  <div key={budget.id} className="bg-white rounded-2xl p-4 shadow-card">
                    {/* Top row */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
                        style={{ backgroundColor: cat.color_hex + '22' }}
                      >
                        {sfToEmoji(cat.icon)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm truncate">{cat.name}</p>
                          {isOver && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-expense/10 text-expense flex-shrink-0">
                              Excedido
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatCLP(spent)}{' '}
                          <span className="text-gray-300">/ {formatCLP(budget.amount)}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-sm font-bold" style={{ color }}>
                          {Math.round(pct * 100)}%
                        </span>
                        <button
                          onClick={() => setEditBudget(budget)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(budget.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-expense"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(pct * 100, 100)}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>

                    {/* Remaining / Over label */}
                    <p className="text-[11px] mt-1.5 text-right" style={{ color: isOver ? '#FF3B30' : '#8E8E93' }}>
                      {isOver
                        ? `Excedido por ${formatCLP(spent - budget.amount)}`
                        : `Disponible: ${formatCLP(budget.amount - spent)}`}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      {currentMonthBudgets.length > 0 && (
        <button
          onClick={() => setShowAdd(true)}
          className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-fab flex items-center justify-center z-10 md:bottom-8 md:right-8"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Add modal */}
      {showAdd && (
        <AddBudgetModal
          onClose={() => setShowAdd(false)}
          onSave={addBudget}
          selectedMonth={selectedMonth}
          expenseCategories={expenseCategories}
          existingCategoryIds={new Set(currentMonthBudgets.map(b => b.category_id))}
        />
      )}

      {/* Edit modal */}
      {editBudget && (
        <EditBudgetModal
          budget={editBudget}
          category={categoryById(editBudget.category_id)!}
          onClose={() => setEditBudget(null)}
          onSave={async amount => {
            await updateBudget(editBudget.id, amount)
            setEditBudget(null)
          }}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <p className="font-semibold text-gray-900 text-center mb-1">¿Eliminar presupuesto?</p>
            <p className="text-sm text-gray-400 text-center mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => { deleteBudget(confirmDelete); setConfirmDelete(null) }}
                className="flex-1 py-3 rounded-2xl bg-expense text-white font-semibold text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Add Budget Modal ──────────────────────────────────────

function AddBudgetModal({
  onClose,
  onSave,
  selectedMonth,
  expenseCategories,
  existingCategoryIds,
}: {
  onClose: () => void
  onSave: (b: { category_id: string; month: string; amount: number }) => Promise<void>
  selectedMonth: Date
  expenseCategories: Category[]
  existingCategoryIds: Set<string>
}) {
  const available = expenseCategories.filter(c => !existingCategoryIds.has(c.id))
  const [categoryId, setCategoryId] = useState(available[0]?.id ?? '')
  const [amount, setAmount]         = useState('')
  const [saving, setSaving]         = useState(false)

  const isValid = !!categoryId && parseFloat(amount) > 0

  async function handleSave() {
    if (!isValid) return
    setSaving(true)
    await onSave({
      category_id: categoryId,
      month: monthKey(selectedMonth),
      amount: parseFloat(amount),
    })
    setSaving(false)
    onClose()
  }

  if (available.length === 0) {
    return (
      <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="font-semibold text-gray-900 mb-1">Todas las categorías tienen presupuesto</p>
          <p className="text-sm text-gray-400 mb-5">Ya asignaste un límite a todas tus categorías de gasto.</p>
          <button onClick={onClose} className="w-full py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm">
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  const selectedCat = available.find(c => c.id === categoryId)

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center">
      <div className="bg-bg-base rounded-t-3xl w-full max-w-sm max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-3xl border-b border-gray-100">
          <button onClick={onClose} className="text-gray-500 text-sm">Cancelar</button>
          <span className="font-semibold text-gray-900 text-sm">Nuevo presupuesto</span>
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className={`text-sm font-bold ${isValid ? 'text-primary' : 'text-gray-300'}`}
          >
            {saving ? '...' : 'Crear'}
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Category picker */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <p className="text-[11px] text-gray-400 px-4 pt-3 pb-2 font-medium uppercase tracking-wider">
              Categoría
            </p>
            <div className="-mx-0 overflow-x-auto no-scrollbar">
              <div className="flex gap-2 px-4 pb-3" style={{ width: 'max-content' }}>
                {available.map(cat => {
                  const isSelected = cat.id === categoryId
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl transition-all"
                      style={
                        isSelected
                          ? { backgroundColor: cat.color_hex + '20', boxShadow: `0 0 0 1.5px ${cat.color_hex}` }
                          : { backgroundColor: '#F2F2F7' }
                      }
                    >
                      <span className="text-xl">{sfToEmoji(cat.icon)}</span>
                      <span className="text-[10px] font-semibold text-gray-700 whitespace-nowrap max-w-[60px] truncate">
                        {cat.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Amount input */}
          <div className="bg-white rounded-2xl px-4 py-5 shadow-card">
            <p className="text-[11px] text-gray-400 text-center mb-4 font-medium uppercase tracking-wider">
              Monto del presupuesto
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl text-gray-300 font-semibold">$</span>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                autoFocus
                className="text-[42px] font-black text-center text-gray-900 w-48 placeholder-gray-200"
                style={{
                  border: 'none',
                  borderBottom: `2px solid ${selectedCat?.color_hex ?? '#00C57A'}`,
                  background: 'transparent',
                }}
              />
            </div>
          </div>

          {/* Month info */}
          <div className="bg-white rounded-2xl px-4 py-3.5 shadow-card flex items-center justify-between">
            <span className="text-sm text-gray-500">Mes</span>
            <span className="text-sm font-semibold text-gray-800 capitalize">
              {formatMonthYear(selectedMonth)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Edit Budget Modal ─────────────────────────────────────

function EditBudgetModal({
  budget,
  category,
  onClose,
  onSave,
}: {
  budget: Budget
  category: Category
  onClose: () => void
  onSave: (amount: number) => Promise<void>
}) {
  const [amount, setAmount] = useState(String(budget.amount))
  const [saving, setSaving] = useState(false)
  const value = parseFloat(amount) || 0

  async function handleSave() {
    if (value <= 0) return
    setSaving(true)
    await onSave(value)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
        {/* Category header */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3"
            style={{ backgroundColor: category.color_hex + '22' }}
          >
            {sfToEmoji(category.icon)}
          </div>
          <p className="font-bold text-gray-900">{category.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">Editar presupuesto mensual</p>
        </div>

        <div className="flex items-baseline justify-center gap-1 mb-6">
          <span className="text-2xl text-gray-300 font-semibold">$</span>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            autoFocus
            className="text-[42px] font-black text-center text-gray-900 w-48"
            style={{
              border: 'none',
              borderBottom: `2px solid ${category.color_hex}`,
              background: 'transparent',
            }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={value <= 0 || saving}
            className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm transition-all"
            style={{ backgroundColor: value > 0 ? '#00C57A' : '#00C57A55' }}
          >
            {saving ? '...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
