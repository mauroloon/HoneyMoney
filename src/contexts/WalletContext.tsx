import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { Wallet } from '../types'
import { useAuth } from './AuthContext'
import { generateShareCode } from '../utils/format'

interface WalletState {
  wallets: Wallet[]
  active: Wallet | null
  loading: boolean
  error: string | null
  setActive: (w: Wallet) => void
  createWallet: (name: string) => Promise<Wallet | null>
  joinWallet: (code: string) => Promise<'success' | 'not_found' | 'already_member'>
  leaveWallet: (walletId: string) => Promise<void>
  reload: () => Promise<void>
}

const WalletContext = createContext<WalletState>(null!)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [active, setActiveState] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) load()
    else { setWallets([]); setActiveState(null) }
  }, [user])

  async function load() {
    setLoading(true)
    // Get wallet IDs the user is a member of
    const { data: memberships } = await supabase
      .from('wallet_members')
      .select('wallet_id')
      .eq('user_id', user!.id)

    if (!memberships?.length) { setWallets([]); setActiveState(null); setLoading(false); return }

    const walletIds = memberships.map(m => m.wallet_id)
    const { data: ws } = await supabase
      .from('wallets')
      .select('*, wallet_members(*, profiles(display_name, email))')
      .in('id', walletIds)

    const list = ws ?? []
    setWallets(list)

    // Restore last active wallet
    const lastId = localStorage.getItem('hm_active_wallet')
    const found = list.find(w => w.id === lastId) ?? list[0] ?? null
    setActiveState(found)
    setLoading(false)
  }

  function setActive(w: Wallet) {
    setActiveState(w)
    localStorage.setItem('hm_active_wallet', w.id)
  }

  async function createWallet(name: string): Promise<Wallet | null> {
    if (!user || !profile) return null
    const code = generateShareCode()
    const { data: wallet, error: err } = await supabase
      .from('wallets')
      .insert({ name, owner_id: user.id, share_code: code })
      .select()
      .single()
    if (err || !wallet) { setError('No se pudo crear la billetera'); return null }

    await supabase.from('wallet_members').insert({
      wallet_id: wallet.id,
      user_id: user.id,
      role: 'owner',
    })
    await load()
    return wallet
  }

  async function joinWallet(code: string): Promise<'success' | 'not_found' | 'already_member'> {
    const upper = code.toUpperCase().trim()
    if (wallets.some(w => w.share_code === upper)) return 'already_member'

    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('share_code', upper)
      .single()

    if (!wallet) return 'not_found'

    const { error: err } = await supabase.from('wallet_members').insert({
      wallet_id: wallet.id,
      user_id: user!.id,
      role: 'member',
    })
    if (err) return 'not_found'

    await load()
    return 'success'
  }

  async function leaveWallet(walletId: string) {
    await supabase
      .from('wallet_members')
      .delete()
      .eq('wallet_id', walletId)
      .eq('user_id', user!.id)
    await load()
  }

  return (
    <WalletContext.Provider value={{ wallets, active, loading, error, setActive, createWallet, joinWallet, leaveWallet, reload: load }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
