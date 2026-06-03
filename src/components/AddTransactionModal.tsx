import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../contexts/WalletContext'
import { useFinance } from '../contexts/FinanceContext'
import { formatCLP } from '../utils/format'
import { TransactionType, Category } from '../types'

interface Props { onClose: () => void }

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  )
}

export default function AddTransactionModal({ onClose }: Props) {
  const { user } = useAuth()
  const { active: wallet } = useWallet()
  const { incomeCategories, expenseCategories, addTransaction } = useFinance()

  const [type, setType]         = useState<TransactionType>('expense')
  const [amount, setAmount]     = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0])
  const [note, setNote]         = useState('')
  const [saving, setSaving]     = useState(false)

  const categories = type === 'income' ? incomeCategories : expenseCategories
  const numAmount = parseFloat(amount) || 0
  const isValid = numAmount > 0 && category !== null

  async function handleSave() {
    if (!isValid || !wallet || !user) return
    setSaving(true)
    await addTransaction({
      wallet_id: wallet.id,
      user_id: user.id,
      amount: numAmount,
      type,
      category_id: category!.id,
      date: new Date(date + 'T12:00:00').toISOString(),
      note,
    })
    setSaving(false)
    onClose()
  }

  const accentColor = type === 'income' ? 'var(--income)' : 'var(--expense)'

  return (
    <div
      className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="hm-sheet w-full max-w-sm flex flex-col"
        style={{
          background: 'var(--bg)', borderTopLeftRadius: 32, borderTopRightRadius: 32,
          maxHeight: '92vh', overflow: 'hidden',
          boxShadow: '0 -4px 40px rgba(80,48,16,0.20)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px 14px', flexShrink: 0,
          borderBottom: '1px solid var(--line-soft)',
          background: 'var(--surface)',
          borderTopLeftRadius: 32, borderTopRightRadius: 32,
        }}>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: 0, background: 'var(--surface-2)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <CloseIcon />
          </button>
          <span className="font-serif" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}>Nuevo movimiento</span>
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            style={{ border: 0, background: 'transparent', fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 14, color: isValid ? 'var(--honey-ink)' : 'var(--faint)', cursor: isValid ? 'pointer' : 'default' }}
          >
            {saving ? '...' : 'Guardar'}
          </button>
        </div>

        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 22px 28px' }}>
          {/* Type toggle */}
          <div className="seg" style={{ marginTop: 18, marginBottom: 16 }}>
            {(['expense', 'income'] as TransactionType[]).map(t => (
              <button
                key={t}
                data-on={String(type === t)}
                onClick={() => { setType(t); setCategory(null) }}
              >
                {t === 'income' ? 'Ingreso' : 'Gasto'}
              </button>
            ))}
          </div>

          {/* Amount — serif */}
          <div className="card-honey" style={{ padding: '20px 22px', marginBottom: 14, textAlign: 'center' }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>Monto</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span className="font-serif" style={{ fontSize: 28, color: 'var(--faint)' }}>$</span>
              <input
                className="font-serif tnum"
                type="number"
                inputMode="numeric"
                value={amount}
                autoFocus
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                style={{
                  fontSize: 46, fontWeight: 500, textAlign: 'center', width: '70%',
                  background: 'transparent', border: 0, outline: 0,
                  fontFamily: 'var(--serif)', color: 'var(--ink)',
                }}
              />
            </div>
            {numAmount > 0 && (
              <p style={{ fontSize: 12, color: 'var(--faint)', marginTop: 4 }}>{formatCLP(numAmount)}</p>
            )}
            <div style={{ height: 2, marginTop: 8, borderRadius: 2, background: accentColor, opacity: 0.45 }} />
          </div>

          {/* Category — tonal discs */}
          <div className="card-honey" style={{ padding: 18, marginBottom: 14 }}>
            <p className="eyebrow" style={{ marginBottom: 14 }}>Categoría</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {categories.map(cat => {
                const sel = category?.id === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat)}
                    style={{ border: 0, background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}
                  >
                    <span style={{
                      display: 'block', width: 44, height: 44, borderRadius: '50%',
                      background: cat.color_hex,
                      boxShadow: sel ? `0 0 0 3px var(--surface), 0 0 0 5px ${cat.color_hex}` : 'none',
                      opacity: sel ? 1 : 0.72,
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 10.5, color: sel ? 'var(--ink)' : 'var(--faint)', fontWeight: sel ? 600 : 500, textAlign: 'center', lineHeight: 1.2 }}>
                      {cat.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Details */}
          <div className="card-honey" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid var(--line-soft)' }}>
              <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>Fecha</span>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ background: 'transparent', border: 0, outline: 0, fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--honey-ink)', fontWeight: 600, textAlign: 'right' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', gap: 12 }}>
              <span style={{ fontSize: 13.5, color: 'var(--muted)', flexShrink: 0 }}>Nota</span>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Opcional"
                style={{
                  background: 'transparent', border: 0, outline: 0,
                  fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)',
                  textAlign: 'right', flex: 1,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
