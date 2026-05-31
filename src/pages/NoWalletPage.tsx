import { useState } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { useAuth } from '../contexts/AuthContext'
import { Wallet } from '../types'

export default function NoWalletPage() {
  const { signOut } = useAuth()
  const { createWallet, joinWallet } = useWallet()
  const [mode, setMode]   = useState<'choose' | 'create' | 'join'>('choose')
  const [name, setName]   = useState('')
  const [code, setCode]   = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    await createWallet(name.trim())
    setLoading(false)
  }

  async function handleJoin() {
    if (code.length !== 6) return
    setLoading(true); setError('')
    const result = await joinWallet(code)
    setLoading(false)
    if (result === 'not_found') setError('Código no encontrado.')
    if (result === 'already_member') setError('Ya eres miembro de esa billetera.')
  }

  if (mode === 'create') return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <button onClick={() => setMode('choose')} className="self-start mb-6 text-primary text-sm font-medium">← Volver</button>
      <div className="text-5xl mb-4">💼</div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Nueva billetera</h2>
      <p className="text-sm text-gray-500 text-center mb-8">Dale un nombre a tu billetera compartida</p>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Casa, Pareja, Familia"
        className="w-full max-w-sm border-b-2 border-primary pb-2 text-gray-900 text-lg text-center placeholder-gray-300 mb-8 bg-transparent" autoFocus />
      <button onClick={handleCreate} disabled={!name.trim() || loading}
        className={`w-full max-w-sm py-4 rounded-2xl text-white font-semibold shadow-fab ${name.trim() ? 'bg-primary' : 'bg-primary/40'}`}>
        {loading ? 'Creando...' : 'Crear billetera'}
      </button>
    </div>
  )

  if (mode === 'join') return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <button onClick={() => setMode('choose')} className="self-start mb-6 text-primary text-sm font-medium">← Volver</button>
      <div className="text-5xl mb-4">🔗</div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Unirme con código</h2>
      <p className="text-sm text-gray-500 text-center mb-8">Ingresa el código de 6 caracteres que te compartieron</p>
      <input value={code} onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))} placeholder="ABC123"
        className="w-full max-w-sm text-center text-4xl font-black tracking-[0.3em] border-b-2 border-primary pb-2 text-gray-900 placeholder-gray-300 mb-4 bg-transparent" autoFocus />
      {error && <p className="text-sm text-expense mb-4">{error}</p>}
      <button onClick={handleJoin} disabled={code.length !== 6 || loading}
        className={`w-full max-w-sm py-4 rounded-2xl text-white font-semibold shadow-fab ${code.length === 6 ? 'bg-primary' : 'bg-primary/40'}`}>
        {loading ? 'Buscando...' : 'Unirme'}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6 text-center">
      <div className="text-7xl mb-4">🍯</div>
      <h2 className="text-3xl font-black text-gray-900 mb-2">honeyMoney</h2>
      <p className="text-gray-500 mb-10">Necesitas una billetera para empezar</p>
      <div className="w-full max-w-sm space-y-3">
        <button onClick={() => setMode('create')}
          className="w-full py-4 rounded-2xl bg-primary text-white font-semibold shadow-fab flex items-center justify-center gap-2">
          💼 Crear billetera nueva
        </button>
        <button onClick={() => setMode('join')}
          className="w-full py-4 rounded-2xl bg-white text-primary border-2 border-primary font-semibold flex items-center justify-center gap-2">
          🔗 Unirme con código
        </button>
        <button onClick={signOut} className="w-full py-3 text-gray-400 text-sm">
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
