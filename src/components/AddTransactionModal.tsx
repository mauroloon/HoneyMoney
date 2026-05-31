import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../contexts/WalletContext'
import { useFinance } from '../contexts/FinanceContext'
import { formatCLP } from '../utils/format'
import { sfToEmoji } from '../utils/icons'
import { TransactionType, Category } from '../types'

interface Props { onClose: () => void }

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

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center">
      <div className="bg-bg-base rounded-t-3xl w-full max-w-sm max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-3xl border-b border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="text-gray-500 text-sm">Cancelar</button>
          <span className="font-semibold text-gray-900">Nueva transacción</span>
          <button onClick={handleSave} disabled={!isValid || saving}
            className={`text-sm font-bold ${isValid ? 'text-primary' : 'text-gray-300'}`}>
            {saving ? '...' : 'Guardar'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Type toggle */}
          <div className="px-4 pt-4">
            <div className="flex bg-gray-200 rounded-2xl p-1">
              {(['expense', 'income'] as TransactionType[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setType(t); setCategory(null) }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={type === t ? {
                    backgroundColor: t === 'income' ? '#34C759' : '#FF3B30',
                    color: 'white',
                  } : { color: '#8E8E93' }}
                >
                  {t === 'income' ? '↓ Ingreso' : '↑ Gasto'}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="px-4 pt-4 pb-2">
            <div className="bg-white rounded-3xl p-4 shadow-card">
              <p className="text-xs text-gray-400 mb-2">Monto</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl text-gray-400 font-semibold">$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  autoFocus
                  className="flex-1 text-5xl font-black text-gray-900 placeholder-gray-200 bg-transparent"
                />
              </div>
              {numAmount > 0 && (
                <p className="text-xs text-gray-400 mt-1">{formatCLP(numAmount)}</p>
              )}
              <div className="h-0.5 mt-2 rounded-full" style={{ backgroundColor: type === 'income' ? '#34C759' : '#FF3B30' }} />
            </div>
          </div>

          {/* Category */}
          <div className="px-4 pb-3">
            <div className="bg-white rounded-3xl p-4 shadow-card">
              <p className="text-xs text-gray-400 mb-3">🏷️ Categoría</p>
              <div className="grid grid-cols-4 gap-2">
                {categories.map(cat => {
                  const sel = category?.id === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat)}
                      className="flex flex-col items-center gap-1 relative"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all"
                        style={{ backgroundColor: sel ? cat.color_hex : cat.color_hex + '22' }}
                      >
                        <span>{sfToEmoji(cat.icon)}</span>
                      </div>
                      {sel && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold"
                          style={{ backgroundColor: cat.color_hex, fontSize: 9 }}>✓</span>
                      )}
                      <span className="text-xs text-gray-500 line-clamp-1 text-center w-full" style={{ fontSize: 10 }}>
                        {cat.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="px-4 pb-6">
            <div className="bg-white rounded-3xl shadow-card overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <span className="text-sm">📅</span>
                <span className="text-sm text-gray-700 flex-shrink-0">Fecha</span>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="flex-1 text-sm text-primary text-right bg-transparent" />
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-sm mt-0.5">📝</span>
                <span className="text-sm text-gray-700 flex-shrink-0 mt-0.5">Nota</span>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Opcional"
                  rows={1} className="flex-1 text-sm text-gray-900 placeholder-gray-400 text-right bg-transparent resize-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
