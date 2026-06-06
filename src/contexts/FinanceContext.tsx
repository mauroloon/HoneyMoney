import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { Category, Transaction, SavingsGoal, TransactionInsert, CategoryInsert, SavingsGoalInsert, RecurringPayment, RecurringPaymentLog, RecurringPaymentInsert } from '../types'
import { useAuth } from './AuthContext'
import { useWallet } from './WalletContext'
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '../utils/icons'
import { isSameMonth } from '../utils/format'

interface FinanceState {
  transactions: Transaction[]
  categories: Category[]
  savingsGoals: SavingsGoal[]
  recurringPayments: RecurringPayment[]
  recurringLogs: RecurringPaymentLog[]
  loading: boolean
  selectedMonth: Date
  setSelectedMonth: (d: Date) => void

  // Computed
  monthlyIncome: number
  monthlyExpenses: number
  monthlyBalance: number
  incomeCategories: Category[]
  expenseCategories: Category[]
  categoryById: (id: string) => Category | undefined
  expensesByCategory: { category: Category; total: number }[]
  recentTransactions: Transaction[]

  // Actions
  addTransaction: (t: TransactionInsert) => Promise<void>
  updateTransaction: (id: string, updates: Partial<TransactionInsert>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  addCategory: (c: Omit<CategoryInsert, 'wallet_id'>) => Promise<void>
  updateCategory: (id: string, updates: Partial<Omit<CategoryInsert, 'wallet_id'>>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addGoal: (g: Omit<SavingsGoalInsert, 'wallet_id'>) => Promise<void>
  addToGoal: (id: string, amount: number) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  addRecurring: (r: Omit<RecurringPaymentInsert, 'wallet_id'>) => Promise<void>
  updateRecurring: (id: string, updates: Partial<Omit<RecurringPaymentInsert, 'wallet_id'>>) => Promise<void>
  deleteRecurring: (id: string) => Promise<void>
  toggleRecurringPaid: (id: string, month: string) => Promise<void>
  reload: () => Promise<void>
}

const FinanceContext = createContext<FinanceState>(null!)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { active: wallet } = useWallet()

  const [transactions, setTransactions]       = useState<Transaction[]>([])
  const [categories, setCategories]           = useState<Category[]>([])
  const [savingsGoals, setSavingsGoals]       = useState<SavingsGoal[]>([])
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([])
  const [recurringLogs, setRecurringLogs]     = useState<RecurringPaymentLog[]>([])
  const [loading, setLoading]                 = useState(false)
  const [selectedMonth, setSelectedMonth]     = useState(new Date())

  const reload = useCallback(async () => {
    if (!wallet) return
    setLoading(true)
    const [t, c, g, r] = await Promise.all([
      supabase.from('transactions').select('*').eq('wallet_id', wallet.id).order('date', { ascending: false }),
      supabase.from('categories').select('*').eq('wallet_id', wallet.id),
      supabase.from('savings_goals').select('*').eq('wallet_id', wallet.id),
      supabase.from('recurring_payments').select('*').eq('wallet_id', wallet.id).eq('is_active', true).order('day_of_month'),
    ])
    if (c.data?.length === 0) await insertDefaultCategories(wallet.id)
    else setCategories(c.data ?? [])
    setTransactions(t.data ?? [])
    setSavingsGoals(g.data ?? [])
    const payments = r.data ?? []
    setRecurringPayments(payments)
    if (payments.length > 0) {
      const { data: logs } = await supabase
        .from('recurring_payment_logs')
        .select('*')
        .in('recurring_payment_id', payments.map(p => p.id))
      setRecurringLogs(logs ?? [])
    } else {
      setRecurringLogs([])
    }
    setLoading(false)
  }, [wallet])

  useEffect(() => {
    if (wallet) reload()
    else { setTransactions([]); setCategories([]); setSavingsGoals([]); setRecurringPayments([]); setRecurringLogs([]) }
  }, [wallet, reload])

  // ── Realtime ──────────────────────────────────────────
  useEffect(() => {
    if (!wallet) return
    const channel = supabase.realtime.channel(`wallet-${wallet.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `wallet_id=eq.${wallet.id}` }, () => reload())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals', filter: `wallet_id=eq.${wallet.id}` }, () => reload())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recurring_payments', filter: `wallet_id=eq.${wallet.id}` }, () => reload())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [wallet, reload])

  async function insertDefaultCategories(walletId: string) {
    const inserts = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES].map(c => ({ ...c, wallet_id: walletId }))
    const { data } = await supabase.from('categories').insert(inserts).select()
    setCategories(data ?? [])
  }

  // ── Computed ──────────────────────────────────────────
  const monthly = transactions.filter(t => isSameMonth(t.date, selectedMonth))
  const monthlyIncome   = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthlyExpenses = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const monthlyBalance  = monthlyIncome - monthlyExpenses

  const incomeCategories  = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')
  const categoryById = (id: string) => categories.find(c => c.id === id)

  const expensesByCategory = (() => {
    const map: Record<string, number> = {}
    monthly.filter(t => t.type === 'expense').forEach(t => { map[t.category_id] = (map[t.category_id] ?? 0) + t.amount })
    return Object.entries(map)
      .map(([id, total]) => ({ category: categoryById(id)!, total }))
      .filter(x => x.category)
      .sort((a, b) => b.total - a.total)
  })()

  const recentTransactions = transactions.slice(0, 5)

  // ── Actions ───────────────────────────────────────────
  async function addTransaction(t: TransactionInsert) {
    const { data } = await supabase.from('transactions').insert(t).select().single()
    if (data) setTransactions(prev => [data, ...prev])
  }

  async function updateTransaction(id: string, updates: Partial<TransactionInsert>) {
    const { data, error } = await supabase.from('transactions').update(updates).eq('id', id).select().single()
    if (error) throw error
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
  }

  async function deleteTransaction(id: string) {
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  async function addCategory(c: Omit<CategoryInsert, 'wallet_id'>) {
    if (!wallet) return
    const { data } = await supabase.from('categories').insert({ ...c, wallet_id: wallet.id }).select().single()
    if (data) setCategories(prev => [...prev, data])
  }

  async function updateCategory(id: string, updates: Partial<Omit<CategoryInsert, 'wallet_id'>>) {
    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single()
    if (error) throw error
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }

  async function deleteCategory(id: string) {
    await supabase.from('categories').delete().eq('id', id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  async function addGoal(g: Omit<SavingsGoalInsert, 'wallet_id'>) {
    if (!wallet) return
    const { data } = await supabase.from('savings_goals').insert({ ...g, wallet_id: wallet.id }).select().single()
    if (data) setSavingsGoals(prev => [...prev, data])
  }

  async function addToGoal(id: string, amount: number) {
    const goal = savingsGoals.find(g => g.id === id)
    if (!goal) return
    const newAmount = goal.current_amount + amount
    await supabase.from('savings_goals').update({ current_amount: newAmount }).eq('id', id)
    setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, current_amount: newAmount } : g))
  }

  async function deleteGoal(id: string) {
    await supabase.from('savings_goals').delete().eq('id', id)
    setSavingsGoals(prev => prev.filter(g => g.id !== id))
  }

  async function addRecurring(r: Omit<RecurringPaymentInsert, 'wallet_id'>) {
    if (!wallet) return
    const { data } = await supabase.from('recurring_payments').insert({ ...r, wallet_id: wallet.id }).select().single()
    if (data) setRecurringPayments(prev => [...prev, data].sort((a, b) => a.day_of_month - b.day_of_month))
  }

  async function updateRecurring(id: string, updates: Partial<Omit<RecurringPaymentInsert, 'wallet_id'>>) {
    const { data, error } = await supabase.from('recurring_payments').update(updates).eq('id', id).select().single()
    if (error) throw error
    setRecurringPayments(prev => prev.map(r => r.id === id ? { ...r, ...data } : r).sort((a, b) => a.day_of_month - b.day_of_month))
  }

  async function deleteRecurring(id: string) {
    await supabase.from('recurring_payments').update({ is_active: false }).eq('id', id)
    setRecurringPayments(prev => prev.filter(r => r.id !== id))
    setRecurringLogs(prev => prev.filter(l => l.recurring_payment_id !== id))
  }

  async function toggleRecurringPaid(id: string, month: string) {
    const existing = recurringLogs.find(l => l.recurring_payment_id === id && l.paid_month === month)
    if (existing) {
      await supabase.from('recurring_payment_logs').delete().eq('id', existing.id)
      setRecurringLogs(prev => prev.filter(l => l.id !== existing.id))
    } else {
      const { data } = await supabase.from('recurring_payment_logs').insert({ recurring_payment_id: id, paid_month: month }).select().single()
      if (data) setRecurringLogs(prev => [...prev, data])
    }
  }

  return (
    <FinanceContext.Provider value={{
      transactions, categories, savingsGoals, recurringPayments, recurringLogs, loading,
      selectedMonth, setSelectedMonth,
      monthlyIncome, monthlyExpenses, monthlyBalance,
      incomeCategories, expenseCategories, categoryById,
      expensesByCategory, recentTransactions,
      addTransaction, updateTransaction, deleteTransaction,
      addCategory, updateCategory, deleteCategory,
      addGoal, addToGoal, deleteGoal,
      addRecurring, updateRecurring, deleteRecurring, toggleRecurringPaid,
      reload,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => useContext(FinanceContext)
