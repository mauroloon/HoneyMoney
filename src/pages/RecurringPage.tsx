import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Check, ChevronLeft, ChevronRight, ReceiptText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../contexts/WalletContext'
import { useFinance } from '../contexts/FinanceContext'
import { formatCLP, formatMonthYear, localDateStr } from '../utils/format'
import { sfToEmoji, PRESET_COLORS } from '../utils/icons'
import { RecurringPayment, Category } from '../types'

const RECURRING_ICONS = [
  '💳','🏠','🚗','📺','🎵','🌐','📱','💡','💧','🏋️',
  '🎓','🏥','🛡️','☕','🎮','📦','🎬','🔔','🏪','🧹',
  '🚿','🌿','🐶','🍽️','🎨','📚','✈️','🧴','⚽','🎯',
]

function paidMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export default function RecurringPage() {
  const {
    recurringPayments, recurringLogs,
    addRecurring, updateRecurring, deleteRecurring, toggleRecurringPaid,
    selectedMonth, setSelectedMonth,
  } = useFinance()

  const [showAdd, setShowAdd]               = useState(false)
  const [editPayment, setEditPayment]       = useState<RecurringPayment | null>(null)
  const [confirmDelete, setConfirmDelete]   = useState<string | null>(null)
  const [registerPayment, setRegisterPayment] = useState<RecurringPayment | null>(null)

  const monthKey = paidMonthKey(selectedMonth)

  const paidIds = new Set(
    recurringLogs.filter(l => l.paid_month === monthKey).map(l => l.recurring_payment_id)
  )

  const totalAmount = recurringPayments.reduce((s, p) => s + p.amount, 0)
  const paidAmount  = recurringPayments.filter(p => paidIds.has(p.id)).reduce((s, p) => s + p.amount, 0)
  const paidCount   = recurringPayments.filter(p => paidIds.has(p.id)).length
  const totalCount  = recurringPayments.length
  const progress    = totalAmount > 0 ? paidAmount / totalAmount : 0
  const pending     = totalAmount - paidAmount

  function prevMonth() {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))
  }
  function nextMonth() {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="px-4 pt-4 space-y-3">

          {/* Month navigator */}
          <div className="flex items-center justify-between mb-1">
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
          {totalCount > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Comprometido mensual</p>
                  <p className="text-2xl font-black text-gray-900">{formatCLP(totalAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-0.5">{paidCount} de {totalCount} pagados</p>
                  <p className="text-sm font-bold text-primary">{formatCLP(paidAmount)}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {paidCount === totalCount ? '🎉 ¡Todo al día!' : `Faltan ${formatCLP(pending)}`}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {Math.round(progress * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Empty state */}
          {totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">🔄</div>
              <p className="text-lg font-semibold text-gray-800">Sin pagos mensuales</p>
              <p className="text-sm text-gray-400 mt-2 px-8">
                Agrega tus suscripciones y cuentas que pagas cada mes para llevar el control
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-6 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold text-sm shadow-fab"
              >
                <Plus size={16} /> Agregar pago
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recurringPayments.map(payment => {
                const isPaid = paidIds.has(payment.id)
                return (
                  <div
                    key={payment.id}
                    className={`bg-white rounded-3xl p-4 shadow-card transition-all duration-200 ${isPaid ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon circle — tap to toggle paid */}
                      <button
                        onClick={() => toggleRecurringPaid(payment.id, monthKey)}
                        className="relative w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-200"
                        style={{ backgroundColor: payment.color_hex + '22' }}
                      >
                        <span className={`transition-all duration-200 ${isPaid ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                          {payment.icon}
                        </span>
                        <div
                          className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200 ${isPaid ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                          style={{ backgroundColor: payment.color_hex }}
                        >
                          <Check size={20} className="text-white" strokeWidth={3} />
                        </div>
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm leading-tight ${isPaid ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {payment.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Día {payment.day_of_month} de cada mes
                        </p>
                      </div>

                      {/* Amount + edit/delete */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className={`text-base font-bold ${isPaid ? 'text-gray-400' : 'text-gray-900'}`}>
                          {formatCLP(payment.amount)}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditPayment(payment)}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 active:scale-95"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(payment.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-400 active:scale-95"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action row */}
                    {isPaid ? (
                      <button
                        onClick={() => toggleRecurringPaid(payment.id, monthKey)}
                        className="mt-3 w-full py-2.5 rounded-2xl text-xs font-semibold text-white transition-all duration-200"
                        style={{ backgroundColor: payment.color_hex }}
                      >
                        ✓ Pagado este mes
                      </button>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => toggleRecurringPaid(payment.id, monthKey)}
                          className="flex-1 py-2.5 rounded-2xl text-xs font-semibold bg-gray-100 text-gray-600 transition-all"
                        >
                          Marcar pagado
                        </button>
                        <button
                          onClick={() => setRegisterPayment(payment)}
                          className="flex-1 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                          style={{ backgroundColor: payment.color_hex + '18', color: payment.color_hex }}
                        >
                          <ReceiptText size={12} />
                          Registrar gasto
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      {totalCount > 0 && (
        <button
          onClick={() => setShowAdd(true)}
          className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-fab flex items-center justify-center z-10 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Add / Edit modal */}
      {(showAdd || editPayment) && (
        <RecurringModal
          payment={editPayment}
          onClose={() => { setShowAdd(false); setEditPayment(null) }}
          onSave={async data => {
            if (editPayment) {
              await updateRecurring(editPayment.id, data)
            } else {
              await addRecurring(data)
            }
            setShowAdd(false)
            setEditPayment(null)
          }}
        />
      )}

      {/* Register & pay modal */}
      {registerPayment && (
        <RegisterModal
          payment={registerPayment}
          selectedMonth={selectedMonth}
          monthKey={monthKey}
          onClose={() => setRegisterPayment(null)}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <p className="font-semibold text-gray-900 text-center mb-1">¿Eliminar pago mensual?</p>
            <p className="text-sm text-gray-500 text-center mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => { deleteRecurring(confirmDelete); setConfirmDelete(null) }}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm"
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

// ── Modal registrar gasto + marcar pagado ────────────────

function RegisterModal({ payment, selectedMonth, monthKey, onClose }: {
  payment: RecurringPayment
  selectedMonth: Date
  monthKey: string
  onClose: () => void
}) {
  const { user }          = useAuth()
  const { active: wallet } = useWallet()
  const { expenseCategories, addTransaction, toggleRecurringPaid } = useFinance()

  // Pre-select best matching category by color, then icon, then first available
  const best = expenseCategories.find(c => c.color_hex === payment.color_hex)
    ?? expenseCategories.find(c => c.icon === payment.icon)
    ?? expenseCategories[0]

  const [selectedCat, setSelectedCat] = useState<Category | null>(best ?? null)
  const [saving, setSaving] = useState(false)

  // Use payment's day_of_month clamped to month length
  const lastDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate()
  const txDate  = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), Math.min(payment.day_of_month, lastDay))
  const dateStr = localDateStr(txDate)

  async function handleConfirm() {
    if (!selectedCat || !user || !wallet) return
    setSaving(true)
    await addTransaction({
      wallet_id:   wallet.id,
      user_id:     user.id,
      amount:      payment.amount,
      type:        'expense',
      category_id: selectedCat.id,
      date:        dateStr,
      note:        payment.name,
    })
    await toggleRecurringPaid(payment.id, monthKey)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center">
      <div className="bg-bg-base rounded-t-3xl w-full max-w-sm max-h-[80vh] overflow-y-auto no-scrollbar shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-3xl border-b border-gray-100">
          <button onClick={onClose} className="text-gray-500 text-sm">Cancelar</button>
          <span className="font-semibold text-gray-900 text-sm">Registrar gasto</span>
          <button
            onClick={handleConfirm}
            disabled={!selectedCat || saving}
            className={`text-sm font-bold ${selectedCat && !saving ? 'text-primary' : 'text-gray-300'}`}
          >
            {saving ? '...' : 'Registrar'}
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Payment info */}
          <div className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: payment.color_hex + '22' }}
            >
              {payment.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{payment.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatCLP(payment.amount)} · {dateStr}
              </p>
            </div>
          </div>

          {/* Category picker */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <p className="text-[11px] text-gray-400 px-4 pt-3 pb-2 font-medium uppercase tracking-wider">
              Categoría del gasto
            </p>
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex gap-2 px-4 pb-3" style={{ width: 'max-content' }}>
                {expenseCategories.map(cat => {
                  const isSelected = selectedCat?.id === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCat(cat)}
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

          {/* Confirm summary */}
          {selectedCat && (
            <div
              className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
              style={{ backgroundColor: payment.color_hex + '12' }}
            >
              <span className="text-xs text-gray-600">
                Se registrará en <span className="font-semibold">{selectedCat.name}</span>
              </span>
              <span className="text-sm font-bold" style={{ color: payment.color_hex }}>
                {formatCLP(payment.amount)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Modal de agregar / editar ─────────────────────────────
interface ModalData {
  name: string
  amount: number
  day_of_month: number
  icon: string
  color_hex: string
}

function RecurringModal({ payment, onClose, onSave }: {
  payment: RecurringPayment | null
  onClose: () => void
  onSave: (data: ModalData) => Promise<void>
}) {
  const { transactions, categoryById, recurringPayments } = useFinance()

  const [name, setName]   = useState(payment?.name ?? '')
  const [amount, setAmount] = useState(payment ? String(payment.amount) : '')
  const [day, setDay]     = useState(payment?.day_of_month ?? 1)
  const [icon, setIcon]   = useState(payment?.icon ?? '💳')
  const [color, setColor] = useState(payment?.color_hex ?? '#FF3B30')
  const [saving, setSaving] = useState(false)

  const suggestions = useMemo(() => {
    if (payment) return []
    const existingNames = new Set(recurringPayments.map(r => r.name.trim().toLowerCase()))
    const seen = new Map<string, { transaction: typeof transactions[0]; count: number }>()
    for (const t of transactions) {
      if (t.type !== 'expense' || !t.note.trim()) continue
      const key = t.note.trim().toLowerCase()
      if (existingNames.has(key)) continue
      const entry = seen.get(key)
      if (entry) entry.count++
      else seen.set(key, { transaction: t, count: 1 })
    }
    return Array.from(seen.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)
      .map(e => e.transaction)
  }, [transactions, recurringPayments, payment])

  function applySuggestion(t: typeof transactions[0]) {
    const cat = categoryById(t.category_id)
    setName(t.note.trim())
    setAmount(String(t.amount))
    if (cat) { setIcon(cat.icon); setColor(cat.color_hex) }
  }

  const isValid = name.trim().length > 0 && parseFloat(amount) > 0 && day >= 1 && day <= 31

  async function handleSave() {
    if (!isValid) return
    setSaving(true)
    await onSave({ name: name.trim(), amount: parseFloat(amount), day_of_month: day, icon, color_hex: color })
    setSaving(false)
  }

  function handleDayChange(val: string) {
    const n = parseInt(val)
    if (isNaN(n)) { setDay(1); return }
    setDay(Math.min(31, Math.max(1, n)))
  }

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center">
      <div className="bg-bg-base rounded-t-3xl w-full max-w-sm max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-3xl border-b border-gray-100">
          <button onClick={onClose} className="text-gray-500 text-sm">Cancelar</button>
          <span className="font-semibold text-gray-900">
            {payment ? 'Editar pago' : 'Nuevo pago mensual'}
          </span>
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className={`text-sm font-bold ${isValid && !saving ? 'text-primary' : 'text-gray-300'}`}
          >
            {saving ? '...' : payment ? 'Guardar' : 'Agregar'}
          </button>
        </div>

        <div className="p-4 space-y-3">

          {/* Sugerencias desde transacciones existentes */}
          {suggestions.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-card">
              <p className="text-xs text-gray-400 mb-3">Desde mis gastos</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {suggestions.map(t => {
                  const cat = categoryById(t.category_id)
                  const isSelected = name === t.note.trim() && amount === String(t.amount)
                  return (
                    <button
                      key={t.id}
                      onClick={() => applySuggestion(t)}
                      className="flex-shrink-0 flex flex-col items-center gap-1.5 p-2.5 rounded-2xl w-[72px] transition-all"
                      style={isSelected
                        ? { outline: `2px solid ${cat?.color_hex ?? color}`, outlineOffset: '2px', backgroundColor: (cat?.color_hex ?? color) + '15' }
                        : { backgroundColor: '#F9FAFB' }
                      }
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: (cat?.color_hex ?? '#ccc') + '22' }}
                      >
                        {cat?.icon ?? '💳'}
                      </div>
                      <p className="text-[10px] text-gray-700 font-medium text-center leading-tight w-full truncate">
                        {t.note.trim()}
                      </p>
                      <p className="text-[10px] text-gray-400">{formatCLP(t.amount)}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Preview del ícono seleccionado */}
          <div className="flex items-center justify-center py-2">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-card"
              style={{ backgroundColor: color + '22' }}
            >
              {icon}
            </div>
          </div>

          {/* Nombre */}
          <div className="bg-white rounded-2xl px-4 py-3 shadow-card">
            <p className="text-xs text-gray-400 mb-1">Nombre del pago</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Netflix, Arriendo, Gym..."
              autoFocus
              className="w-full text-sm text-gray-900 placeholder-gray-300 outline-none"
            />
          </div>

          {/* Monto y día */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <span className="text-xs text-gray-500 w-20 flex-shrink-0">Monto ($)</span>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="flex-1 text-sm text-right text-gray-900 placeholder-gray-300 outline-none"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-xs text-gray-500 w-20 flex-shrink-0">Día de cobro</span>
              <div className="flex-1 flex items-center justify-end gap-3">
                <button
                  onClick={() => setDay(d => Math.max(1, d - 1))}
                  className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-lg font-bold flex items-center justify-center"
                >
                  −
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  value={day}
                  onChange={e => handleDayChange(e.target.value)}
                  className="w-10 text-center text-sm font-bold text-gray-900 outline-none"
                />
                <button
                  onClick={() => setDay(d => Math.min(31, d + 1))}
                  className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-lg font-bold flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Selector de ícono */}
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <p className="text-xs text-gray-400 mb-3">Ícono</p>
            <div className="grid grid-cols-6 gap-2">
              {RECURRING_ICONS.map(i => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${icon === i ? 'scale-110 shadow-sm' : 'bg-gray-100'}`}
                  style={icon === i ? { backgroundColor: color + '33' } : {}}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de color */}
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <p className="text-xs text-gray-400 mb-3">Color</p>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <span className="text-white text-xs font-black">✓</span>}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
