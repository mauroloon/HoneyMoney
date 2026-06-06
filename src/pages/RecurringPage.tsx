import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useFinance } from '../contexts/FinanceContext'
import { formatCLP, formatMonthYear } from '../utils/format'
import { PRESET_COLORS } from '../utils/icons'
import { RecurringPayment } from '../types'

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

  const [showAdd, setShowAdd]         = useState(false)
  const [editPayment, setEditPayment] = useState<RecurringPayment | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const now = new Date()
  const isCurrentMonth = selectedMonth.getFullYear() === now.getFullYear() && selectedMonth.getMonth() === now.getMonth()
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
    if (!isCurrentMonth) setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))
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
              disabled={isCurrentMonth}
              className={`w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-card transition-opacity ${isCurrentMonth ? 'opacity-25' : ''}`}
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

                    {/* Paid toggle pill */}
                    <button
                      onClick={() => toggleRecurringPaid(payment.id, monthKey)}
                      className={`mt-3 w-full py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                        isPaid
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                      style={isPaid ? { backgroundColor: payment.color_hex } : {}}
                    >
                      {isPaid ? '✓ Pagado este mes' : 'Marcar como pagado'}
                    </button>
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
  const [name, setName]   = useState(payment?.name ?? '')
  const [amount, setAmount] = useState(payment ? String(payment.amount) : '')
  const [day, setDay]     = useState(payment?.day_of_month ?? 1)
  const [icon, setIcon]   = useState(payment?.icon ?? '💳')
  const [color, setColor] = useState(payment?.color_hex ?? '#FF3B30')
  const [saving, setSaving] = useState(false)

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
