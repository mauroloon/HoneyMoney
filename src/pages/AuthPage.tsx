import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const { signIn, signUp, error, loading } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [localError, setLocalError] = useState('')

  const isValid = mode === 'login'
    ? email.includes('@') && password.length >= 6
    : name.trim().length > 0 && email.includes('@') && password.length >= 6 && password === confirm

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLocalError('')
    if (mode === 'login') {
      await signIn(email, password)
    } else {
      if (password !== confirm) { setLocalError('Las contraseñas no coinciden'); return }
      await signUp(name, email, password)
    }
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-3 shadow-fab">
            <span className="text-4xl font-black text-white">$</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">honeyMoney</h1>
          <p className="text-sm text-gray-500 mt-1">Finanzas compartidas en pareja 🍯</p>
        </div>

        {/* Mode tabs */}
        <div className="flex bg-gray-200 rounded-2xl p-1 mb-6">
          {(['login', 'register'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setLocalError('') }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === m ? 'bg-primary text-white shadow-sm' : 'text-gray-500'
              }`}
            >
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-card overflow-hidden mb-4">
          {mode === 'register' && (
            <div className="flex items-center gap-3 px-4 border-b border-gray-100">
              <span className="text-primary text-sm">👤</span>
              <input
                type="text"
                placeholder="Nombre"
                value={name}
                onChange={e => setName(e.target.value)}
                autoCapitalize="words"
                className="flex-1 py-4 text-sm bg-transparent placeholder-gray-400"
              />
            </div>
          )}
          <div className="flex items-center gap-3 px-4 border-b border-gray-100">
            <span className="text-primary text-sm">✉️</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoCapitalize="none"
              autoComplete="email"
              className="flex-1 py-4 text-sm bg-transparent placeholder-gray-400"
            />
          </div>
          <div className={`flex items-center gap-3 px-4 ${mode === 'register' ? 'border-b border-gray-100' : ''}`}>
            <span className="text-primary text-sm">🔒</span>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="flex-1 py-4 text-sm bg-transparent placeholder-gray-400"
            />
          </div>
          {mode === 'register' && (
            <div className="flex items-center gap-3 px-4">
              <span className="text-primary text-sm">🔒</span>
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="flex-1 py-4 text-sm bg-transparent placeholder-gray-400"
              />
            </div>
          )}
        </form>

        {/* Error */}
        {displayError && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-2xl px-4 py-3 mb-4 text-sm">
            <span>⚠️</span>
            <span>{displayError}</span>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className={`w-full py-4 rounded-2xl font-semibold text-white transition-all ${
            isValid && !loading ? 'bg-primary shadow-fab' : 'bg-primary/40'
          }`}
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            mode === 'login' ? 'Entrar' : 'Crear cuenta'
          )}
        </button>
      </div>
    </div>
  )
}
