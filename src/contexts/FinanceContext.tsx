import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { Category, Transaction, SavingsGoal, TransactionInsert, CategoryInsert, SavingsGoalInsert } from '../types'
import { useAuth } from './AuthContext'
import { useWallet } from './WalletContext'
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '../utils/icons'
import { isSameMonth } from '../utils/format'

interface FinanceState {
  transactions: Transaction[]
  categories: Category[]
  savingsGoals: SavingsGoal[]
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
  deleteTransaction: (id: string) => Promise<void>
  addCategory: (c: Omit<CategoryInsert, 'wallet_id'>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addGoal: (g: Omit<SavingsGoalInsert, 'wallet_id'>) => Promise<void>
  addToGoal: (id: string, amount: number) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  reload: () => Promise<void>
}

const FinanceContext = createContext<FinanceState>(null!)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { active: wallet } = useWallet()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories]     = useState<Category[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading]           = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const reload = useCallback(async () => {
    if (!wallet) return
    setLoading(true)
    const [t, c, g] = await Promise.all([
      supabase.from('transactions').select('*').eq('wallet_id', wallet.id).order('date', { ascending: false }),
      supabase.from('categories').select('*').eq('wallet_id', wallet.id),
      supabase.from('savings_goals').select('*').eq('wallet_id', wallet.id),
    ])
    if (c.data?.length === 0) await insertDefaultCategories(wallet.id)
    else setCategories(c.data ?? [])
    setTransactions(t.data ?? [])
    setSavingsGoals(g.data ?? [])
    setLoading(false)
  }, [wallet])

  useEffect(() => {
    if (wallet) reload()
    else { setTransactions([]); setCategories([]); setSavingsGoals([]) }
  }, [wallet, reload])

  // ── Realtime ──────────────────────────────────────────
  useEffect(() => {
    if (!wallet) return
    const channel = supabase.realtime.channel(`wallet-${wallet.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `wallet_id=eq.${wallet.id}` }, () => reload())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals', filter: `wallet_id=eq.${wallet.id}` }, () => reload())
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

  async function deleteTransaction(id: string) {
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  async function addCategory(c: Omit<CategoryInsert, 'wallet_id'>) {
    if (!wallet) return
    const { data } = await supabase.from('categories').insert({ ...c, wallet_id: wallet.id }).select().single()
    if (data) setCategories(prev => [...prev, data])
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

  return (
    <FinanceContext.Provider value={{
      transactions, categories, savingsGoals, loading,
      selectedMonth, setSelectedMonth,
      monthlyIncome, monthlyExpenses, monthlyBalance,
      incomeCategories, expenseCategories, categoryById,
      expensesByCategory, recentTransactions,
      addTransaction, deleteTransaction,
      addCategory, deleteCategory,
      addGoal, addToGoal, deleteGoal, reload,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => useContext(FinanceContext)
