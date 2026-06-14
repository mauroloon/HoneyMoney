import { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, List, RefreshCw, Target, Wallet, LucideIcon } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'

interface TabItem {
  path: string
  Icon: LucideIcon
  label: string
}

const TABS: TabItem[] = [
  { path: '/',             Icon: Home,       label: 'Inicio'      },
  { path: '/transactions', Icon: List,       label: 'Movimientos' },
  { path: '/recurring',    Icon: RefreshCw,  label: 'Pagos'       },
  { path: '/savings',      Icon: Target,     label: 'Metas'       },
  { path: '/wallet',       Icon: Wallet,     label: 'Billetera'   },
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
            <Wallet size={11} className="text-primary" />
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
          {TABS.map(({ path, Icon, label }) => {
            const isActive = path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path)
            return (
              <NavLink
                key={path}
                to={path}
                className="flex-1 flex flex-col items-center gap-0.5 pt-2.5 pb-1.5 nav-tab"
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-all duration-150 ${isActive ? 'text-primary' : 'text-gray-400'}`}
                />
                <span className={`text-[9px] font-semibold tracking-wide transition-colors duration-150 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                  {label}
                </span>
                <div className={`h-0.5 w-4 rounded-full mt-0.5 transition-all duration-200 ${isActive ? 'bg-primary opacity-100' : 'opacity-0'}`} />
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
