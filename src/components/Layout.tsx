import { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useWallet } from '../contexts/WalletContext'

interface TabItem {
  path: string
  icon: string
  label: string
}

const TABS: TabItem[] = [
  { path: '/',             icon: '🏠', label: 'Inicio'      },
  { path: '/transactions', icon: '📋', label: 'Movimientos' },
  { path: '/recurring',    icon: '🔄', label: 'Pagos'       },
  { path: '/savings',      icon: '🎯', label: 'Metas'       },
  { path: '/wallet',       icon: '💼', label: 'Billetera'   },
]

interface Props {
  children: ReactNode
  title: string
}

export default function Layout({ children, title }: Props) {
  const { active } = useWallet()
  const location = useLocation()

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto bg-bg-base">
      {/* Top bar */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
        <h1 className="font-bold text-gray-900 text-lg">{title}</h1>
        {active && (
          <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1">
            <span className="text-xs">💼</span>
            <span className="text-xs font-semibold text-primary truncate max-w-[100px]">{active.name}</span>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="bg-white border-t border-gray-100 flex-shrink-0 pb-safe">
        <div className="flex">
          {TABS.map(tab => {
            const isActive = tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path)
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all"
              >
                <span className={`text-xl transition-all ${isActive ? 'scale-110' : 'opacity-50'}`}>
                  {tab.icon}
                </span>
                <span className={`text-[9px] font-medium transition-all ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
                {isActive && <div className="w-1 h-1 rounded-full bg-primary" />}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
