import { useState } from 'react'
import { useFinance } from '../contexts/FinanceContext'
import { formatCLP, formatCLPNumber, daysRemaining } from '../utils/format'
import { sfToEmoji, PRESET_GOAL_ICONS, PRESET_COLORS } from '../utils/icons'
import { SavingsGoal } from '../types'

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 5.5 L12 18.5 M5.5 12 L18.5 12" />
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  )
}

export default function SavingsPage() {
  const { savingsGoals, addGoal, addToGoal, deleteGoal } = useFinance()
  const [showAdd, setShowAdd] = useState(false)
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const totalSaved = savingsGoals.reduce((s, g) => s + g.current_amount, 0)

  return (
    <>
      <div className="flex-1 no-scrollbar" style={{ overflowY: 'auto', background: 'var(--bg)', paddingBottom: 120 }}>
        <div style={{ padding: '52px 22px 0' }}>

          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 4 }}>Ahorrando juntos</p>
              <p className="font-serif" style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)' }}>Metas</p>
            </div>
            {savingsGoals.length > 0 && (
              <div style={{ textAlign: 'right' }}>
                <p className="eyebrow" style={{ fontSize: 10, marginBottom: 2 }}>Total</p>
                <p className="font-serif tnum" style={{ fontSize: 18, fontWeight: 600, color: 'var(--honey-ink)' }}>
                  {formatCLP(totalSaved)}
                </p>
              </div>
            )}
          </div>

          {savingsGoals.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <span style={{ display: 'block', width: 56, height: 56, borderRadius: '50%', background: 'var(--surface-2)', margin: '0 auto 16px' }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Sin metas de ahorro</p>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.5 }}>
                Crea tu primera meta para empezar<br />a ahorrar hacia tus objetivos
              </p>
              <button
                onClick={() => setShowAdd(true)}
                style={{ border: 0, borderRadius: 999, padding: '14px 28px', background: 'var(--honey)', color: 'var(--on-honey)', fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 24px -6px rgba(201,136,48,0.5)' }}
              >
                Crear meta
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {savingsGoals.map(goal => {
                const pct = goal.target_amount > 0 ? Math.min(goal.current_amount / goal.target_amount, 1) : 0
                const pctDisplay = Math.round(pct * 100)
                const remaining = Math.max(goal.target_amount - goal.current_amount, 0)
                const completed = goal.current_amount >= goal.target_amount
                const days = goal.deadline ? daysRemaining(goal.deadline) : null

                return (
                  <div key={goal.id} className="card-honey" style={{ padding: 20 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, marginBottom: 16 }}>
                      {/* Tonal disc with emoji inside for goals (keeps goal identity) */}
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: goal.color_hex + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: `0 0 0 5px ${goal.color_hex}18` }}>
                        {sfToEmoji(goal.icon)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="font-serif" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>{goal.name}</p>
                        <p style={{ fontSize: 12, color: days !== null && days < 60 ? 'var(--expense)' : 'var(--faint)' }}>
                          {completed ? 'Meta alcanzada' : days !== null ? `${days} días restantes` : 'Sin fecha límite'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="font-serif tnum" style={{ fontSize: 24, fontWeight: 500, color: goal.color_hex }}>{pctDisplay}%</span>
                        <button onClick={() => setConfirmDelete(goal.id)} style={{ width: 28, height: 28, borderRadius: '50%', border: 0, background: '#FDEEE9', color: 'var(--expense)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <TrashIcon />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="hm-track" style={{ height: 9, marginBottom: 16 }}>
                      <span style={{ width: `${pctDisplay}%`, background: goal.color_hex }} />
                    </div>

                    {/* Amounts */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      {[
                        { label: 'Ahorrado', value: goal.current_amount, align: 'left' as const },
                        { label: 'Faltan', value: remaining, align: 'center' as const, color: completed ? 'var(--income)' : 'var(--expense)' },
                        { label: 'Meta', value: goal.target_amount, align: 'right' as const },
                      ].map(x => (
                        <div key={x.label} style={{ flex: 1, textAlign: x.align }}>
                          <p className="eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>{x.label}</p>
                          <p className="font-serif tnum" style={{ fontSize: 13.5, fontWeight: 600, color: x.color ?? 'var(--ink)' }}>
                            ${formatCLPNumber(x.value)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Action */}
                    {completed ? (
                      <div style={{ textAlign: 'center', padding: '12px 0', borderRadius: 999, background: goal.color_hex + '20', color: goal.color_hex, fontSize: 13.5, fontWeight: 700 }}>
                        Lo lograron ✓
                      </div>
                    ) : (
                      <button
                        onClick={() => setDepositGoal(goal)}
                        style={{ width: '100%', padding: '13px 0', borderRadius: 999, border: 0, fontSize: 14, fontFamily: 'var(--sans)', fontWeight: 600, cursor: 'pointer', background: goal.color_hex + '20', color: goal.color_hex }}
                      >
                        Abonar
                      </button>
                    )}
                  </div>
                )
              })}

              {/* Add new goal ghost button */}
              <button
                onClick={() => setShowAdd(true)}
                style={{ width: '100%', padding: '15px 0', borderRadius: 999, border: '1.5px dashed var(--line)', background: 'transparent', color: 'var(--muted)', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                + Nueva meta
              </button>
            </div>
          )}
        </div>
      </div>

      {savingsGoals.length > 0 && (
        <button
          onClick={() => setShowAdd(true)}
          style={{ position: 'fixed', right: 22, bottom: 96, width: 56, height: 56, borderRadius: '50%', border: 0, background: 'var(--honey)', color: 'var(--on-honey)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 10px 28px -8px rgba(201,136,48,0.55)' }}
        >
          <PlusIcon />
        </button>
      )}

      {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} onSave={addGoal} CloseIcon={CloseIcon} />}

      {depositGoal && (
        <DepositModal
          goal={depositGoal}
          onClose={() => setDepositGoal(null)}
          onDeposit={async (amount) => { await addToGoal(depositGoal.id, amount); setDepositGoal(null) }}
          CloseIcon={CloseIcon}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center p-4">
          <div className="card-honey w-full max-w-sm p-6">
            <p className="font-serif" style={{ fontSize: 20, fontWeight: 500, textAlign: 'center', color: 'var(--ink)', marginBottom: 6 }}>¿Eliminar meta?</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginBottom: 22 }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '14px 0', borderRadius: 999, border: 0, background: 'var(--surface-2)', color: 'var(--muted)', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => { deleteGoal(confirmDelete); setConfirmDelete(null) }} style={{ flex: 1, padding: '14px 0', borderRadius: 999, border: 0, background: '#FDEEE9', color: 'var(--expense)', fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function DepositModal({ goal, onClose, onDeposit, CloseIcon }: {
  goal: SavingsGoal; onClose: () => void
  onDeposit: (amount: number) => Promise<void>
  CloseIcon: () => JSX.Element
}) {
  const [amount, setAmount] = useState('')
  const value = parseFloat(amount) || 0
  const rest = Math.max(goal.target_amount - goal.current_amount, 0)
  const quickAmounts = [25000, 50000, 100000]

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center">
      <div className="hm-sheet w-full max-w-sm" style={{ background: 'var(--bg)', borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 14px', borderBottom: '1px solid var(--line-soft)', background: 'var(--surface)', borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: 0, background: 'var(--surface-2)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><CloseIcon /></button>
          <span className="font-serif" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}>Abonar</span>
          <div style={{ width: 34 }} />
        </div>

        <div style={{ padding: '22px 22px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: goal.color_hex + '25', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: `0 0 0 5px ${goal.color_hex}18` }}>
              {sfToEmoji(goal.icon)}
            </div>
            <p className="font-serif" style={{ fontSize: 19, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{goal.name}</p>
            <p style={{ fontSize: 13, color: 'var(--faint)' }}>Faltan {formatCLP(rest)}</p>
          </div>

          <div className="card-honey" style={{ padding: '20px 22px', marginBottom: 14, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span className="font-serif" style={{ fontSize: 24, color: 'var(--faint)' }}>$</span>
              <input className="font-serif tnum" type="number" inputMode="numeric" value={amount} autoFocus onChange={e => setAmount(e.target.value)} placeholder="0"
                style={{ fontSize: 42, fontWeight: 500, textAlign: 'center', width: '66%', background: 'transparent', border: 0, outline: 0, fontFamily: 'var(--serif)', color: 'var(--ink)' }} />
            </div>
            <div style={{ height: 2, marginTop: 6, borderRadius: 2, background: goal.color_hex, opacity: 0.45 }} />
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {quickAmounts.map(q => (
              <button key={q} onClick={() => setAmount(String(q))} style={{ flex: 1, padding: '11px 0', borderRadius: 999, border: 0, background: 'var(--surface-2)', color: 'var(--muted)', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}>
                +{formatCLPNumber(q)}
              </button>
            ))}
          </div>

          <button onClick={() => value > 0 && onDeposit(value)} disabled={value <= 0} style={{ width: '100%', padding: '16px 0', borderRadius: 999, border: 0, fontSize: 15, fontFamily: 'var(--sans)', fontWeight: 700, cursor: value > 0 ? 'pointer' : 'default', background: goal.color_hex, color: 'var(--on-honey)', opacity: value > 0 ? 1 : 0.38 }}>
            Confirmar abono
          </button>
        </div>
      </div>
    </div>
  )
}

function AddGoalModal({ onClose, onSave, CloseIcon }: {
  onClose: () => void
  onSave: (g: { name: string; target_amount: number; current_amount: number; deadline?: string | null; icon: string; color_hex: string }) => Promise<void>
  CloseIcon: () => JSX.Element
}) {
  const [name, setName]         = useState('')
  const [target, setTarget]     = useState('')
  const [current, setCurrent]   = useState('0')
  const [hasDeadline, setHasDeadline] = useState(false)
  const [deadline, setDeadline] = useState('')
  const [icon, setIcon]         = useState('✈️')
  const [color, setColor]       = useState(PRESET_COLORS[0])
  const [saving, setSaving]     = useState(false)

  const isValid = name.trim().length > 0 && parseFloat(target) > 0

  async function handleSave() {
    if (!isValid) return
    setSaving(true)
    await onSave({ name: name.trim(), target_amount: parseFloat(target), current_amount: parseFloat(current) || 0, deadline: hasDeadline && deadline ? new Date(deadline).toISOString() : null, icon, color_hex: color })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center">
      <div className="hm-sheet w-full max-w-sm flex flex-col" style={{ background: 'var(--bg)', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '92vh', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 14px', flexShrink: 0, borderBottom: '1px solid var(--line-soft)', background: 'var(--surface)', borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: 0, background: 'var(--surface-2)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><CloseIcon /></button>
          <span className="font-serif" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}>Nueva meta</span>
          <button onClick={handleSave} disabled={!isValid || saving} style={{ border: 0, background: 'transparent', fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 14, color: isValid ? 'var(--honey-ink)' : 'var(--faint)', cursor: isValid ? 'pointer' : 'default' }}>
            {saving ? '...' : 'Crear'}
          </button>
        </div>

        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Name */}
          <div className="card-honey" style={{ padding: '14px 18px' }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>¿Para qué están ahorrando?</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Vacaciones, Auto..." style={{ width: '100%', background: 'transparent', border: 0, outline: 0, fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)' }} autoFocus />
          </div>

          {/* Amounts */}
          <div className="card-honey" style={{ overflow: 'hidden' }}>
            {[
              { label: 'Meta ($)', val: target, set: setTarget },
              { label: 'Ya ahorré ($)', val: current, set: setCurrent, last: true },
            ].map((f) => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: f.last ? 0 : '1px solid var(--line-soft)' }}>
                <span style={{ fontSize: 13, color: 'var(--muted)', flex: 1 }}>{f.label}</span>
                <input type="number" inputMode="numeric" value={f.val} onChange={e => f.set(e.target.value)} placeholder="0" style={{ background: 'transparent', border: 0, outline: 0, fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)', textAlign: 'right', width: 120 }} />
              </div>
            ))}
          </div>

          {/* Deadline */}
          <div className="card-honey" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: hasDeadline ? '1px solid var(--line-soft)' : 0 }}>
              <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>Fecha límite</span>
              <button onClick={() => setHasDeadline(v => !v)} style={{ width: 44, height: 24, borderRadius: 999, border: 0, position: 'relative', cursor: 'pointer', background: hasDeadline ? 'var(--honey)' : 'var(--surface-2)', transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s', left: hasDeadline ? 22 : 2 }} />
              </button>
            </div>
            {hasDeadline && (
              <div style={{ padding: '12px 18px' }}>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ background: 'transparent', border: 0, outline: 0, fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)' }} />
              </div>
            )}
          </div>

          {/* Icon picker */}
          <div className="card-honey" style={{ padding: 16 }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>Ícono</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {PRESET_GOAL_ICONS.map(ic => (
                <button key={ic} onClick={() => setIcon(ic)} style={{ border: 0, cursor: 'pointer', width: '100%', aspectRatio: '1', borderRadius: 12, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: icon === ic ? color + '30' : 'var(--surface-2)', transition: 'all 0.15s', transform: icon === ic ? 'scale(1.1)' : 'scale(1)' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="card-honey" style={{ padding: 16 }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>Color</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{ width: '100%', aspectRatio: '1', borderRadius: '50%', border: 0, cursor: 'pointer', background: c, boxShadow: color === c ? `0 0 0 3px var(--surface), 0 0 0 5px ${c}` : 'none', transition: 'box-shadow 0.15s' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
