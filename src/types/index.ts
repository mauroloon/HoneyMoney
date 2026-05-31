export type TransactionType = 'income' | 'expense'
export type MemberRole = 'owner' | 'member'

export interface UserProfile {
  id: string
  display_name: string
  email: string
  created_at?: string
}

export interface Wallet {
  id: string
  name: string
  owner_id: string
  share_code: string
  created_at: string
  wallet_members?: WalletMember[]
}

export interface WalletMember {
  id: string
  wallet_id: string
  user_id: string
  display_name?: string
  email?: string
  role: MemberRole
  joined_at: string
  profiles?: UserProfile
}

export interface Category {
  id: string
  wallet_id: string
  name: string
  icon: string        // emoji or SF Symbol name (mapped on display)
  color_hex: string
  type: TransactionType
  created_at?: string
}

export interface Transaction {
  id: string
  wallet_id: string
  user_id: string
  amount: number
  type: TransactionType
  category_id: string
  date: string        // ISO string
  note: string
  created_at?: string
}

export interface SavingsGoal {
  id: string
  wallet_id: string
  name: string
  target_amount: number
  current_amount: number
  deadline?: string | null
  icon: string
  color_hex: string
  created_at?: string
}

// ── Inserts ──────────────────────────────────────────────

export interface TransactionInsert {
  wallet_id: string
  user_id: string
  amount: number
  type: TransactionType
  category_id: string
  date: string
  note: string
}

export interface CategoryInsert {
  wallet_id: string
  name: string
  icon: string
  color_hex: string
  type: TransactionType
}

export interface SavingsGoalInsert {
  wallet_id: string
  name: string
  target_amount: number
  current_amount: number
  deadline?: string | null
  icon: string
  color_hex: string
}
