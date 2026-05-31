import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useFinance } from '../contexts/FinanceContext'
import { formatCLP, formatCLPNumber, daysRemaining } from '../utils/format'
import { sfToEmoji, PRESET_GOAL_ICONS, PRESET_COLORS } from '../utils/icons'
import { SavingsGoal } from '../types'

export default function SavingsPage() {
  const { savingsGoals, addGoal, addToGoal, deleteGoal } = useFinance()
  const [showAdd, setShowAdd] = useState(false)
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="px-4 pt-4 space-y-4">
          {savingsGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-lg font-semibold text-gray-800">Sin metas de ahorro</p>
              <p className="text-sm text-gray-400 mt-2 px-8">Crea tu primera meta para empezar a ahorrar hacia tus objetivos</p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-6 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold text-sm shadow-fab"
              >
                <Plus size={16} /> Crear meta
              </button>
            </div>
          ) : (
            savingsGoals.map(goal => {
              const progress = goal.target_amount > 0 ? Math.min(goal.current_amount / goal.target_amount, 1) : 0
              const pct = Math.round(progress * 100)
              const remaining = Math.max(goal.target_amount - goal.current_amount, 0)
              const completed = goal.current_amount >= goal.target_amount
              const days = goal.deadline ? daysRemaining(goal.deadline) : null

              return (
                <div key={goal.id} className="bg-white rounded-3xl p-5 shadow-card">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: goal.color_hex + '22' }}
                    >
                      <span>{sfToEmoji(goal.icon)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">{goal.name}</p>
                        {completed && <span className="text-primary text-sm">✅</span>}
                      </div>
                      {days !== null && (
                        <p className={`text-xs mt-0.5 ${days < 7 ? 'text-expense' : 'text-gray-400'}`}>
                          {days === 0 ? '¡Hoy es el plazo!' : `${days} días restantes`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black" style={{ color: goal.color_hex }}>{pct}%</span>
                      <button
                        onClick={() => setConfirmDelete(goal.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-expense"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: goal.color_hex }}
                    />
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Ahorrado</p>
                      <p className="text-sm font-bold text-gray-900">${formatCLPNumber(goal.current_amount)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-0.5">Faltan</p>
                      <p className={`text-sm font-bold ${completed ? 'text-primary' : 'text-expense'}`}>
                        ${formatCLPNumber(remaining)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5">Meta</p>
                      <p className="text-sm font-bold text-gray-900">${formatCLPNumber(goal.target_amount)}</p>
                    </div>
                  </div>

                  {/* Action */}
                  {completed ? (
                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold text-primary bg-primary/10">
                      🎉 ¡Meta alcanzada!
                    </div>
                  ) : (
                    <button
                      onClick={() => setDepositGoal(goal)}
                      className="w-full py-2.5 rounded-2xl text-sm font-semibold transition-all"
                      style={{ backgroundColor: goal.color_hex + '22', color: goal.color_hex }}
                    >
                      + Abonar
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* FAB */}
      {savingsGoals.length > 0 && (
        <button
          onClick={() => setShowAdd(true)}
          className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-fab flex items-center justify-center z-10"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Add Goal Modal */}
      {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} onSave={addGoal} />}

      {/* Deposit Modal */}
      {depositGoal && (
        <DepositModal
          goal={depositGoal}
          onClose={() => setDepositGoal(null)}
          onDeposit={async (amount) => { await addToGoal(depositGoal.id, amount); setDepositGoal(null) }}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <p className="font-semibold text-gray-900 text-center mb-1">¿Eliminar meta?</p>
            <p className="text-sm text-gray-500 text-center mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm">Cancelar</button>
              <button onClick={() => { deleteGoal(confirmDelete); setConfirmDelete(null) }} className="flex-1 py-3 rounded-2xl bg-expense text-white font-semibold text-sm">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Deposit Modal ─────────────────────────────────────────
function DepositModal({ goal, onClose, onDeposit }: {
  goal: SavingsGoal
  onClose: () => void
  onDeposit: (amount: number) => Promise<void>
}) {
  const [amount, setAmount] = useState('')
  const value = parseFloat(amount) || 0

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3" style={{ backgroundColor: goal.color_hex + '22' }}>
            <span>{sfToEmoji(goal.icon)}</span>
          </div>
          <p className="font-bold text-gray-900 text-lg">{goal.name}</p>
          <p className="text-sm text-gray-400">Faltan {formatCLP(Math.max(goal.target_amount - goal.current_amount, 0))}</p>
        </div>

        <p className="text-sm font-medium text-gray-700 text-center mb-3">¿Cuánto abonás?</p>
        <div className="flex items-baseline justify-center gap-1 mb-6">
          <span className="text-2xl text-gray-400 font-semibold">$</span>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
            className="text-5xl font-black text-center text-gray-900 w-48"
            style={{ border: 'none', borderBottom: `2px solid ${goal.color_hex}` }}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm">Cancelar</button>
          <button
            onClick={() => value > 0 && onDeposit(value)}
            disabled={value <= 0}
            className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm transition-all"
            style={{ backgroundColor: value > 0 ? goal.color_hex : goal.color_hex + '66' }}
          >
            Abonar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Add Goal Modal ────────────────────────────────────────
function AddGoalModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (g: { name: string; target_amount: number; current_amount: number; deadline?: string | null; icon: string; color_hex: string }) => Promise<void>
}) {
  const [name, setName]         = useState('')
  const [target, setTarget]     = useState('')
  const [current, setCurrent]   = useState('0')
  const [hasDeadline, setHasDeadline] = useState(false)
  const [deadline, setDeadline] = useState('')
  const [icon, setIcon]         = useState('✈️')
  const [color, setColor]       = useState('#00C57A')
  const [saving, setSaving]     = useState(false)

  const isValid = name.trim().length > 0 && parseFloat(target) > 0

  async function handleSave() {
    if (!isValid) return
    setSaving(true)
    await onSave({
      name: name.trim(),
      target_amount: parseFloat(target),
      current_amount: parseFloat(current) || 0,
      deadline: hasDeadline && deadline ? new Date(deadline).toISOString() : null,
      icon,
      color_hex: color,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center">
      <div className="bg-bg-base rounded-t-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-3xl border-b border-gray-100">
          <button onClick={onClose} className="text-gray-500 text-sm">Cancelar</button>
          <span className="font-semibold text-gray-900">Nueva meta</span>
          <button onClick={handleSave} disabled={!isValid || saving} className={`text-sm font-bold ${isValid ? 'text-primary' : 'text-gray-300'}`}>
            {saving ? '...' : 'Crear'}
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Name */}
          <div className="bg-white rounded-2xl px-4 py-3 shadow-card">
            <p className="text-xs text-gray-400 mb-1">¿Para qué estás ahorrando?</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Vacaciones, Auto..." className="w-full text-sm text-gray-900 placeholder-gray-400" />
          </div>

          {/* Amounts */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <span className="text-xs text-gray-500 w-24 flex-shrink-0">Meta ($)</span>
              <input type="number" inputMode="numeric" value={target} onChange={e => setTarget(e.target.value)} placeholder="0" className="flex-1 text-sm text-right text-gray-900 placeholder-gray-400" />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-xs text-gray-500 w-24 flex-shrink-0">Ya ahorré ($)</span>
              <input type="number" inputMode="numeric" value={current} onChange={e => setCurrent(e.target.value)} placeholder="0" className="flex-1 text-sm text-right text-gray-900 placeholder-gray-400" />
            </div>
          </div>

          {/* Deadline */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm text-gray-700">Fecha límite</span>
              <button onClick={() => setHasDeadline(v => !v)} className={`w-11 h-6 rounded-full transition-all relative ${hasDeadline ? 'bg-primary' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${hasDeadline ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            {hasDeadline && (
              <div className="px-4 py-3">
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full text-sm text-gray-700" />
              </div>
            )}
          </div>

          {/* Icon picker */}
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <p className="text-xs text-gray-400 mb-3">Ícono</p>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_GOAL_ICONS.map(i => (
                <button key={i} onClick={() => setIcon(i)} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${icon === i ? 'shadow-sm scale-110' : 'bg-gray-100'}`}
                  style={icon === i ? { backgroundColor: color + '33' } : {}}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <p className="text-xs text-gray-400 mb-3">Color</p>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className="w-9 h-9 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: c }}>
                  {color === c && <span className="text-white text-xs font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
