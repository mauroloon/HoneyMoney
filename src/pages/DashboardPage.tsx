import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../contexts/WalletContext'
import { useFinance } from '../contexts/FinanceContext'
import { formatCLP, formatCLPNumber, formatDate, formatMonthYear, greeting } from '../utils/format'
import AddTransactionModal from '../components/AddTransactionModal'

// Tonal disc — colored circle, no emoji/glyph
function Disc({ color, size = 40, ring = false }: { color: string; size?: number; ring?: boolean }) {
  return (
    <span style={{
      display: 'inline-block', flexShrink: 0,
      width: size, height: size, borderRadius: '50%',
      background: color,
      boxShadow: ring ? `0 0 0 5px ${color}30` : 'none',
    }} />
  )
}

// Inline SVG chevrons for month navigation
function ChevLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M14.5 5 L7.5 12 L14.5 19" />
    </svg>
  )
}
function ChevRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M9.5 5 L16.5 12 L9.5 19" />
    </svg>
  )
}
function InflowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 7 L7 17 M7 10.5 L7 17 L13.5 17" />
    </svg>
  )
}
function OutflowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 L17 7 M10.5 7 L17 7 L17 13.5" />
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 5.5 L12 18.5 M5.5 12 L18.5 12" />
    </svg>
  )
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const { active: wallet } = useWallet()
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

  const balanceColor = monthlyBalance < 0 ? 'var(--expense)' : 'var(--ink)'

  return (
    <>
      <div className="flex-1 no-scrollbar" style={{ overflowY: 'auto', paddingBottom: 120 }}>
        <div style={{ padding: '52px 22px 0' }}>

          {/* Header: greeting + wallet name */}
          <div className="rise" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <p className="eyebrow">{greeting()}</p>
              <p className="font-serif" style={{ fontSize: 22, fontWeight: 500, marginTop: 4, color: 'var(--ink)' }}>
                {wallet?.name ?? profile?.display_name ?? 'Mi billetera'}
              </p>
            </div>
            {/* Abstract pair avatar */}
            <div style={{ display: 'flex' }}>
              {[0, 1].map(i => (
                <span key={i} style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: i === 0 ? 'var(--honey)' : 'var(--surface-2)',
                  border: '2px solid var(--bg)',
                  marginLeft: i ? -10 : 0,
                  display: 'inline-block',
                }} />
              ))}
            </div>
          </div>

          {/* Balance card */}
          <div className="card-honey rise" style={{ padding: 22, marginBottom: 26 }}>
            {/* Month selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: '50%', border: 0, background: 'var(--surface-2)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ChevLeft />
              </button>
              <span className="font-serif" style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', letterSpacing: '0.01em', textTransform: 'capitalize' }}>
                {formatMonthYear(selectedMonth)}
              </span>
              <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: '50%', border: 0, background: 'var(--surface-2)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ChevRight />
              </button>
            </div>

            {/* Balance amount in serif */}
            <div style={{ textAlign: 'center', padding: '6px 0 20px' }}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>Balance del mes</p>
              <p className="font-serif tnum" style={{ fontSize: 48, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, color: balanceColor }}>
                {monthlyBalance < 0 ? '−' : '+'}{formatCLP(Math.abs(monthlyBalance))}
              </p>
            </div>

            {/* Income / Expenses row */}
            <div style={{ display: 'flex', borderTop: '1px solid var(--line-soft)', paddingTop: 16 }}>
              {[
                { label: 'Ingresos', value: monthlyIncome, color: 'var(--income)', Icon: InflowIcon },
                { label: 'Gastos',   value: monthlyExpenses, color: 'var(--expense)', Icon: OutflowIcon },
              ].map((x, i) => (
                <div key={x.label} style={{ flex: 1, paddingLeft: i ? 20 : 0, borderLeft: i ? '1px solid var(--line-soft)' : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: x.color, marginBottom: 6 }}>
                    <x.Icon />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{x.label}</span>
                  </div>
                  <p className="font-serif tnum" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}>
                    {formatCLP(x.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top expenses by category */}
          {expensesByCategory.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>Dónde se fue</p>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
                {expensesByCategory.slice(0, 6).map(({ category, total }) => (
                  <div key={category.id} className="card-honey" style={{ flexShrink: 0, width: 88, padding: '16px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <Disc color={category.color_hex} size={36} ring />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 68 }}>
                        {category.name}
                      </p>
                      <p className="font-serif tnum" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>
                        ${formatCLPNumber(total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent transactions */}
          <section>
            <p className="eyebrow" style={{ marginBottom: 14 }}>Movimientos recientes</p>
            {recentTransactions.length === 0 ? (
              <div className="card-honey" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-2)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ display: 'block', width: 16, height: 16, borderRadius: '50%', background: 'var(--faint)' }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Sin transacciones aún</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>Toca + para registrar tu primer movimiento</p>
              </div>
            ) : (
              <div className="card-honey" style={{ overflow: 'hidden' }}>
                {recentTransactions.map((t, i) => {
                  const cat = categoryById(t.category_id)
                  const isIncome = t.type === 'income'
                  return (
                    <div key={t.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                        <Disc color={cat?.color_hex ?? '#9E7A55'} size={38} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cat?.name ?? 'Sin categoría'}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.note ? `${t.note} · ` : ''}{formatDate(t.date)}
                          </p>
                        </div>
                        <p className="font-serif tnum" style={{ fontSize: 15, fontWeight: 600, flexShrink: 0, color: isIncome ? 'var(--income)' : 'var(--ink)' }}>
                          {isIncome ? '+' : '−'}{formatCLP(t.amount)}
                        </p>
                      </div>
                      {i < recentTransactions.length - 1 && (
                        <div style={{ height: 1, background: 'var(--line-soft)', marginLeft: 70 }} />
                      )}
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
        style={{
          position: 'fixed', right: 22, bottom: 96,
          width: 56, height: 56, borderRadius: '50%', border: 0,
          background: 'var(--honey)', color: 'var(--on-honey)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 10,
          boxShadow: '0 10px 28px -8px rgba(201,136,48,0.55)',
        }}
      >
        <PlusIcon />
      </button>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </>
  )
}
