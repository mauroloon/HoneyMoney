import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../contexts/WalletContext'
import { useFinance } from '../contexts/FinanceContext'
import { formatCLP, localDateStr } from '../utils/format'
import { sfToEmoji } from '../utils/icons'
import { TransactionType, Category, Transaction } from '../types'

interface Props { onClose: () => void; transaction?: Transaction }

export default function AddTransactionModal({ onClose, transaction }: Props) {
  const { user } = useAuth()
  const { active: wallet } = useWallet()
  const { incomeCategories, expenseCategories, addTransaction, updateTransaction, categoryById } = useFinance()

  const isEditing = !!transaction

  const [type, setType]         = useState<TransactionType>(transaction?.type ?? 'expense')
  const [amount, setAmount]     = useState(transaction ? String(transaction.amount) : '')
  const [category, setCategory] = useState<Category | null>(
    transaction ? (categoryById(transaction.category_id) ?? null) : null
  )
  const [date, setDate]         = useState(
    transaction ? transaction.date.split('T')[0] : localDateStr()
  )
  const [note, setNote]         = useState(transaction?.note ?? '')
  const [saving, setSaving]     = useState(false)

  const categories = type === 'income' ? incomeCategories : expenseCategories
  const numAmount = parseFloat(amount) || 0
  const isValid = numAmount > 0 && category !== null

  async function handleSave() {
    if (!isValid || !wallet || !user) return
    setSaving(true)
    const payload = {
      wallet_id: wallet.id,
      user_id: user.id,
      amount: numAmount,
      type,
      category_id: category!.id,
      date: new Date(date + 'T12:00:00').toISOString(),
      note,
    }
    if (isEditing) {
      await updateTransaction(transaction!.id, payload)
    } else {
      await addTransaction(payload)
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center">
      <div className="bg-bg-base rounded-t-3xl w-full max-w-sm max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-3xl border-b border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="text-gray-500 text-sm">Cancelar</button>
          <span className="font-semibold text-gray-900">{isEditing ? 'Editar movimiento' : 'Nueva transacción'}</span>
          <button onClick={handleSave} disabled={!isValid || saving}
            className={`text-sm font-bold ${isValid ? 'text-primary' : 'text-gray-300'}`}>
            {saving ? '...' : 'Guardar'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Type toggle */}
          <div className="px-4 pt-4">
            <div className="flex bg-gray-200/70 rounded-2xl p-1 gap-1">
              {(['expense', 'income'] as TransactionType[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setType(t); setCategory(null) }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 active:scale-95"
                  style={type === t ? {
                    backgroundColor: t === 'income' ? '#34C759' : '#FF3B30',
                    color: 'white',
                    boxShadow: `0 2px 8px ${t === 'income' ? '#34C75940' : '#FF3B3040'}`,
                  } : { color: '#8E8E93', backgroundColor: 'transparent' }}
                >
                  {t === 'income' ? 'Ingreso' : 'Gasto'}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="px-4 pt-4 pb-2">
            <div className="bg-white rounded-3xl p-4 shadow-card">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Monto</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold" style={{ color: type === 'income' ? '#34C759' : '#FF3B30' }}>$</span>
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
                <p className="text-xs text-gray-500 font-medium mt-1">{formatCLP(numAmount)}</p>
              )}
              <div className="h-0.5 mt-2 rounded-full transition-colors duration-200" style={{ backgroundColor: type === 'income' ? '#34C759' : '#FF3B30' }} />
            </div>
          </div>

          {/* Category */}
          <div className="px-4 pb-3">
            <div className="bg-white rounded-3xl p-4 shadow-card">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Categoría</p>
              <div className="grid grid-cols-4 gap-2">
                {categories.map(cat => {
                  const sel = category?.id === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat)}
                      className="flex flex-col items-center gap-1 relative active:scale-90 transition-transform duration-100"
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-150"
                        style={{
                          backgroundColor: sel ? cat.color_hex : cat.color_hex + '18',
                          boxShadow: sel ? `0 2px 8px ${cat.color_hex}50` : 'none',
                          transform: sel ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        <span>{sfToEmoji(cat.icon)}</span>
                      </div>
                      {sel && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-black"
                          style={{ backgroundColor: cat.color_hex, fontSize: 8 }}>✓</span>
                      )}
                      <span className={`line-clamp-1 text-center w-full transition-colors duration-150 ${sel ? 'font-semibold' : 'text-gray-500'}`}
                        style={{ fontSize: 10, color: sel ? cat.color_hex : undefined }}>
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
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                <span className="text-[13px] font-medium text-gray-500 flex-shrink-0">Fecha</span>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="flex-1 text-sm font-semibold text-primary text-right bg-transparent" />
              </div>
              <div className="flex items-start gap-3 px-4 py-3.5">
                <span className="text-[13px] font-medium text-gray-500 flex-shrink-0 mt-0.5">Nota</span>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Opcional"
                  rows={1} className="flex-1 text-sm text-gray-900 placeholder-gray-400 text-right bg-transparent resize-none font-medium" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
