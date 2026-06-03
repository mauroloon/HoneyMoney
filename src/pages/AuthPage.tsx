import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'

type Mode = 'login' | 'register'

function Field({ label, borderless, ...props }: { label: string; borderless?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: 'block', borderBottom: borderless ? '0' : '1px solid var(--line)', padding: '13px 0 12px' }}>
      <span className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>{label}</span>
      <input
        style={{ width: '100%', background: 'transparent', border: 0, outline: 0, fontFamily: 'var(--sans)', color: 'var(--ink)', fontSize: 16 }}
        {...props}
      />
    </label>
  )
}

export default function AuthPage() {
  const { signIn, signUp, error, loading } = useAuth()
  const [mode, setMode]         = useState<Mode>('login')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [localError, setLocalError] = useState('')

  const isValid = mode === 'login'
    ? email.includes('@') && password.length >= 6
    : name.trim().length > 0 && email.includes('@') && password.length >= 6 && password === confirm

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
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
    <div style={{ minHeight: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
      <div className="w-full max-w-sm rise">
        {/* Abstract emblem: ring + honey disc */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid var(--honey)', opacity: 0.55 }} />
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--honey)', display: 'block' }} />
          </div>
        </div>

        {/* Logotype */}
        <h1 className="font-serif" style={{ textAlign: 'center', fontSize: 42, fontWeight: 400, letterSpacing: '-0.02em', margin: '0 0 10px', lineHeight: 1 }}>
          <span style={{ fontStyle: 'italic', color: 'var(--honey-ink)' }}>honey</span>
          <span style={{ fontWeight: 500, color: 'var(--ink)' }}>Money</span>
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, marginBottom: 30, lineHeight: 1.5 }}>
          Las finanzas de los dos, en un solo lugar.
        </p>

        {/* Mode toggle */}
        <div className="seg" style={{ marginBottom: 16 }}>
          {(['login', 'register'] as Mode[]).map(m => (
            <button key={m} data-on={String(mode === m)} onClick={() => { setMode(m); setLocalError('') }}>
              {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="card-honey" style={{ padding: '4px 20px 14px', marginBottom: 16 }}>
          {mode === 'register' && (
            <Field label="Nombre" type="text" placeholder="¿Cómo te llamas?" value={name} onChange={e => setName(e.target.value)} autoCapitalize="words" />
          )}
          <Field label="Correo" type="email" placeholder="hola@correo.cl" value={email} onChange={e => setEmail(e.target.value)} autoCapitalize="none" autoComplete="email" />
          <Field label="Contraseña" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} borderless={mode === 'login'} />
          {mode === 'register' && (
            <Field label="Confirmar contraseña" type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" borderless />
          )}
        </div>

        {/* Error */}
        {displayError && (
          <div style={{ background: '#FDEEE9', color: 'var(--expense)', borderRadius: 16, padding: '12px 16px', marginBottom: 14, fontSize: 13, lineHeight: 1.4 }}>
            {displayError}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          style={{
            width: '100%', padding: '17px 0', borderRadius: 999, border: 0,
            fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 15.5,
            cursor: isValid ? 'pointer' : 'default',
            background: 'var(--honey)', color: 'var(--on-honey)',
            opacity: isValid && !loading ? 1 : 0.4,
            transition: 'opacity 0.2s ease',
            boxShadow: isValid ? '0 8px 24px -6px rgba(201,136,48,0.5)' : 'none',
          }}
        >
          {loading ? '...' : mode === 'login' ? 'Entrar' : 'Empezar juntos'}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--faint)', fontSize: 12, marginTop: 22, lineHeight: 1.6 }}>
          Al continuar aceptas los Términos y la<br />Política de Privacidad de honeyMoney.
        </p>
      </div>
    </div>
  )
}
