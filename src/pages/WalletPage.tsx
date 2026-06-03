import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../contexts/WalletContext'
import { Wallet } from '../types'

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 L9 17 L4 12" />
    </svg>
  )
}
function LogOutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17 L21 12 L16 7" />
      <path d="M21 12H9" />
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 5 L12 19 M5 12 L19 12" />
    </svg>
  )
}
function LinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L11.75 5.65" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L14.25 18.35" />
    </svg>
  )
}

export default function WalletPage() {
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
      <div className="flex-1 no-scrollbar" style={{ overflowY: 'auto', paddingBottom: 120 }}>
        <div style={{ padding: '52px 22px 0' }}>

          {/* Page header */}
          <div style={{ marginBottom: 24 }}>
            <p className="eyebrow" style={{ marginBottom: 4 }}>Tu cuenta</p>
            <p className="font-serif" style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)' }}>Billetera</p>
          </div>

          {/* User card */}
          <div className="card-honey rise" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', marginBottom: 14 }}>
            {/* Abstract person disc */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
              background: 'var(--honey)', opacity: 0.85,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--on-honey)" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.display_name}
              </p>
              <p style={{ fontSize: 12, color: 'var(--faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.email}
              </p>
            </div>
            <button
              onClick={signOut}
              style={{ width: 34, height: 34, borderRadius: '50%', border: 0, background: '#FDEEE9', color: 'var(--expense)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <LogOutIcon />
            </button>
          </div>

          {/* Active wallet */}
          {active && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ background: 'var(--honey)', borderRadius: 24, padding: 22, boxShadow: '0 10px 32px -8px rgba(201,136,48,0.40)' }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(51,32,14,0.6)', marginBottom: 4 }}>
                  Billetera activa
                </p>
                <p className="font-serif" style={{ fontSize: 22, fontWeight: 500, color: 'var(--on-honey)', marginBottom: 18, letterSpacing: '-0.01em' }}>
                  {active.name}
                </p>

                {/* Share code */}
                <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 16, padding: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(51,32,14,0.55)', marginBottom: 10 }}>
                    Código para invitar
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="font-serif tnum" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '0.18em', color: 'var(--on-honey)' }}>
                      {active.share_code}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      style={{ width: 38, height: 38, borderRadius: '50%', border: 0, background: 'rgba(255,255,255,0.25)', color: 'var(--on-honey)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      {copied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                  </div>
                  <p style={{ fontSize: 11.5, color: 'rgba(51,32,14,0.5)', marginTop: 8, lineHeight: 1.4 }}>
                    Comparte este código con tu pareja para que se una
                  </p>
                </div>

                {/* Members */}
                {active.wallet_members && active.wallet_members.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(51,32,14,0.55)', marginBottom: 10 }}>
                      Miembros ({active.wallet_members.length})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {active.wallet_members.map(m => {
                        const isOwner = m.role === 'owner'
                        return (
                          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 14px' }}>
                            <span style={{ width: 28, height: 28, borderRadius: '50%', background: isOwner ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--on-honey)" strokeWidth="1.8" strokeLinecap="round">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                              </svg>
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--on-honey)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {(m.profiles as { display_name?: string; email?: string } | undefined)?.display_name ?? m.user_id.slice(0, 8)}
                              </p>
                              <p style={{ fontSize: 11, color: 'rgba(51,32,14,0.5)' }}>{isOwner ? 'Propietario' : 'Miembro'}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wallet list */}
          {wallets.length > 1 && (
            <div style={{ marginBottom: 14 }}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>Mis billeteras</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <span style={{ display: 'block', width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-2)', margin: '0 auto 14px' }} />
              <p style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Sin billeteras</p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>Crea una billetera o únete a la de tu pareja</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => setShowCreate(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0', borderRadius: 999, border: 0, background: 'var(--honey)', color: 'var(--on-honey)', fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 8px 24px -6px rgba(201,136,48,0.45)' }}
            >
              <PlusIcon /> Crear billetera
            </button>
            <button
              onClick={() => setShowJoin(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px 0', borderRadius: 999, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--honey-ink)', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14.5, cursor: 'pointer' }}
            >
              <LinkIcon /> Unirme con código
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 18, border: `1.5px solid ${isActive ? 'var(--honey)' : 'var(--line-soft)'}`, background: isActive ? 'rgba(201,136,48,0.06)' : 'var(--surface)' }}>
      <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--surface-2)', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-4 0v2" />
        </svg>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wallet.name}</p>
        <p style={{ fontSize: 11.5, color: 'var(--faint)', fontFamily: 'var(--sans)', letterSpacing: '0.05em' }}>{wallet.share_code}</p>
      </div>
      {isActive ? (
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--honey-ink)', background: 'rgba(201,136,48,0.14)', padding: '4px 10px', borderRadius: 999 }}>Activa</span>
      ) : (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onSelect} style={{ fontSize: 12, fontWeight: 600, color: 'var(--honey-ink)', background: 'rgba(201,136,48,0.14)', padding: '5px 12px', borderRadius: 999, border: 0, cursor: 'pointer' }}>Activar</button>
          <button onClick={onLeave} style={{ fontSize: 12, fontWeight: 600, color: 'var(--expense)', background: '#FDEEE9', padding: '5px 12px', borderRadius: 999, border: 0, cursor: 'pointer' }}>Salir</button>
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
      <div className="card-honey w-full max-w-sm p-6">
        <p className="font-serif" style={{ fontSize: 20, fontWeight: 500, textAlign: 'center', color: 'var(--ink)', marginBottom: 20 }}>Nueva billetera</p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre (ej: Hogar, Viaje...)"
          autoFocus
          style={{ width: '100%', background: 'transparent', border: 0, borderBottom: '1.5px solid var(--honey)', outline: 0, fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)', paddingBottom: 8, marginBottom: 24 }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px 0', borderRadius: 999, border: 0, background: 'var(--surface-2)', color: 'var(--muted)', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button
            onClick={handle}
            disabled={!name.trim() || loading}
            style={{ flex: 1, padding: '14px 0', borderRadius: 999, border: 0, background: 'var(--honey)', color: 'var(--on-honey)', fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 14, cursor: name.trim() ? 'pointer' : 'default', opacity: name.trim() ? 1 : 0.45 }}
          >
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
      <div className="card-honey w-full max-w-sm p-6">
        <p className="font-serif" style={{ fontSize: 20, fontWeight: 500, textAlign: 'center', color: 'var(--ink)', marginBottom: 6 }}>Unirme con código</p>
        <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
          Pídele el código de 6 caracteres a la persona que creó la billetera
        </p>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="ABC123"
          autoFocus
          style={{ width: '100%', background: 'transparent', border: 0, borderBottom: '1.5px solid var(--honey)', outline: 0, fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 500, letterSpacing: '0.22em', color: 'var(--ink)', textAlign: 'center', paddingBottom: 8, marginBottom: 8 }}
        />
        {error && <p style={{ fontSize: 12.5, color: 'var(--expense)', textAlign: 'center', marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px 0', borderRadius: 999, border: 0, background: 'var(--surface-2)', color: 'var(--muted)', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button
            onClick={handle}
            disabled={code.length !== 6 || loading}
            style={{ flex: 1, padding: '14px 0', borderRadius: 999, border: 0, background: 'var(--honey)', color: 'var(--on-honey)', fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 14, cursor: code.length === 6 ? 'pointer' : 'default', opacity: code.length === 6 ? 1 : 0.45 }}
          >
            {loading ? '...' : 'Unirme'}
          </button>
        </div>
      </div>
    </div>
  )
}
