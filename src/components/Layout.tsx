import { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

// Abstract thin-line SVG icons — no typical pictograms
function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round">
      <circle cx="12" cy="12" r="8" />
    </svg>
  )
}
function IconTransactions({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round">
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="3.4" />
    </svg>
  )
}
function IconSavings({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16.5 L10 10.5 L13.5 14 L20 7" />
      <path d="M20 11.5 L20 7 L15.5 7" />
    </svg>
  )
}
function IconWallet({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round">
      <circle cx="9" cy="12" r="4.4" />
      <circle cx="15.5" cy="12" r="4.4" />
    </svg>
  )
}

const TABS = [
  { path: '/',             label: 'Inicio',      Icon: IconHome },
  { path: '/transactions', label: 'Movimientos', Icon: IconTransactions },
  { path: '/savings',      label: 'Metas',       Icon: IconSavings },
  { path: '/wallet',       label: 'Billetera',   Icon: IconWallet },
]

interface Props {
  children: ReactNode
  title?: string
}

export default function Layout({ children }: Props) {
  const location = useLocation()

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto relative" style={{ background: 'var(--bg)' }}>
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>

      {/* Floating pill bottom nav */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pointer-events-none"
        style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
      >
        <nav
          className="pointer-events-auto flex justify-around items-center px-3 py-2.5 rounded-full"
          style={{
            background: 'var(--tab-bg)',
            backdropFilter: 'blur(24px) saturate(200%)',
            WebkitBackdropFilter: 'blur(24px) saturate(200%)',
            border: '1px solid var(--line-soft)',
            boxShadow: '0 2px 8px rgba(120,80,20,0.08), 0 20px 44px -20px rgba(150,100,30,0.30)',
          }}
        >
          {TABS.map(({ path, label, Icon }) => {
            const isActive = path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path)
            return (
              <NavLink
                key={path}
                to={path}
                className="flex flex-col items-center gap-1 px-3 py-1"
                style={{ color: isActive ? 'var(--honey)' : 'var(--faint)', transition: 'color 0.2s ease' }}
              >
                <Icon active={isActive} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: '0.02em', lineHeight: 1 }}>
                  {label}
                </span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
