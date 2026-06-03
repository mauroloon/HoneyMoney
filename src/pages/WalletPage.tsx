import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Check, LogOut, Plus, Users, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../contexts/WalletContext'
import { Wallet } from '../types'

export default function WalletPage() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { wallets, active, setActive, createWallet, joinWallet, leaveWallet } = useWallet()
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin]     = useState(false)
  const [copied, setCopied]         = useState(false)

  async function handleCopyCode() {
    if (!active) return
    await navigator.clipboard.writeText(active.share_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="px-4 pt-4 space-y-4">
          {/* User card */}
          <div className="bg-white rounded-3xl p-4 shadow-card flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{profile?.display_name}</p>
              <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
            </div>
            <button onClick={signOut} className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <LogOut size={16} className="text-expense" />
            </button>
          </div>

          {/* Active wallet */}
          {active && (
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-5 text-white shadow-fab">
              <p className="text-white/70 text-xs mb-1">Billetera activa</p>
              <p className="text-2xl font-black mb-4">{active.name}</p>

              {/* Share code */}
              <div className="bg-white/15 rounded-2xl p-4">
                <p className="text-white/70 text-xs mb-2">Código para invitar</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black tracking-[0.2em]">{active.share_code}</span>
                  <button onClick={handleCopyCode} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-white/60 text-xs mt-2">Comparte este código con tu pareja para que se una</p>
              </div>

              {/* Members */}
              {active.wallet_members && active.wallet_members.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={14} className="text-white/70" />
                    <p className="text-white/70 text-xs">Miembros ({active.wallet_members.length})</p>
                  </div>
                  <div className="space-y-2">
                    {active.wallet_members.map(m => (
                      <div key={m.id} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs">
                          {m.role === 'owner' ? '👑' : '👤'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {(m.profiles as { display_name?: string; email?: string } | undefined)?.display_name ?? m.user_id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-white/50">{m.role === 'owner' ? 'Propietario' : 'Miembro'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wallet list */}
          {wallets.length > 1 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Mis billeteras</p>
              <div className="space-y-2">
                {wallets.map(w => (
                  <WalletRow
                    key={w.id}
                    wallet={w}
                    isActive={w.id === active?.id}
                    onSelect={() => setActive(w)}
                    onLeave={() => leaveWallet(w.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {wallets.length === 0 && (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">💼</div>
              <p className="font-semibold text-gray-800">Sin billeteras</p>
              <p className="text-sm text-gray-400 mt-1">Crea una billetera o únete a la de tu pareja</p>
            </div>
          )}

          {/* Settings */}
          <div className="bg-white rounded-3xl shadow-card overflow-hidden">
            <button
              onClick={() => navigate('/categories')}
              className="w-full flex items-center gap-3 px-4 py-3.5"
            >
              <span className="text-xl">🏷️</span>
              <span className="flex-1 text-sm font-medium text-gray-900 text-left">Gestionar categorías</span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-2xl font-semibold text-sm shadow-fab"
            >
              <Plus size={18} /> Crear billetera
            </button>
            <button
              onClick={() => setShowJoin(true)}
              className="w-full flex items-center justify-center gap-2 bg-white text-primary border-2 border-primary py-3.5 rounded-2xl font-semibold text-sm"
            >
              🔗 Unirme con código
            </button>
          </div>
        </div>
      </div>

      {showCreate && <CreateWalletModal onClose={() => setShowCreate(false)} onCreate={createWallet} />}
      {showJoin   && <JoinWalletModal   onClose={() => setShowJoin(false)}   onJoin={joinWallet} />}
    </>
  )
}

function WalletRow({ wallet, isActive, onSelect, onLeave }: {
  wallet: Wallet; isActive: boolean; onSelect: () => void; onLeave: () => void
}) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'}`}>
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">💼</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{wallet.name}</p>
        <p className="text-xs text-gray-400">{wallet.share_code}</p>
      </div>
      {isActive ? (
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">Activa</span>
      ) : (
        <div className="flex gap-2">
          <button onClick={onSelect} className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">Activar</button>
          <button onClick={onLeave} className="text-xs font-semibold text-expense bg-red-50 px-3 py-1.5 rounded-full">Salir</button>
        </div>
      )}
    </div>
  )
}

function CreateWalletModal({ onClose, onCreate }: {
  onClose: () => void; onCreate: (name: string) => Promise<Wallet | null>
}) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handle() {
    if (!name.trim()) return
    setLoading(true)
    await onCreate(name.trim())
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
        <p className="font-bold text-gray-900 text-center mb-5">Nueva billetera</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre (ej: Casa, Pareja...)" autoFocus
          className="w-full border-b-2 border-primary pb-2 text-gray-900 placeholder-gray-400 mb-6 text-sm" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm">Cancelar</button>
          <button onClick={handle} disabled={!name.trim() || loading} className={`flex-1 py-3 rounded-2xl text-white font-semibold text-sm ${name.trim() ? 'bg-primary' : 'bg-primary/40'}`}>
            {loading ? '...' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

function JoinWalletModal({ onClose, onJoin }: {
  onClose: () => void; onJoin: (code: string) => Promise<'success' | 'not_found' | 'already_member'>
}) {
  const [code, setCode]   = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handle() {
    if (code.length !== 6) return
    setLoading(true); setError('')
    const result = await onJoin(code)
    setLoading(false)
    if (result === 'success') { onClose(); return }
    if (result === 'not_found') setError('Código no encontrado. Verifica e intenta de nuevo.')
    if (result === 'already_member') setError('Ya eres miembro de esa billetera.')
  }

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
        <p className="font-bold text-gray-900 text-center mb-2">Unirme con código</p>
        <p className="text-sm text-gray-400 text-center mb-5">Pídele el código de 6 caracteres a la persona que creó la billetera</p>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="ABC123"
          autoFocus
          className="w-full text-center text-3xl font-black tracking-[0.3em] border-b-2 border-primary pb-2 text-gray-900 placeholder-gray-300 mb-4"
        />
        {error && <p className="text-xs text-expense text-center mb-4">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm">Cancelar</button>
          <button onClick={handle} disabled={code.length !== 6 || loading} className={`flex-1 py-3 rounded-2xl text-white font-semibold text-sm ${code.length === 6 ? 'bg-primary' : 'bg-primary/40'}`}>
            {loading ? '...' : 'Unirme'}
          </button>
        </div>
      </div>
    </div>
  )
}
