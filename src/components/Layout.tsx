import { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, List, RefreshCw, Target, Wallet, BarChart2, LucideIcon } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'

interface TabItem {
  path: string
  Icon: LucideIcon
  label: string      // mobile bottom nav (short)
  fullLabel: string  // desktop sidebar (full)
}

const TABS: TabItem[] = [
  { path: '/',             Icon: Home,       label: 'Inicio',      fullLabel: 'Inicio'        },
  { path: '/transactions', Icon: List,       label: 'Gastos',      fullLabel: 'Movimientos'   },
  { path: '/budgets',      Icon: BarChart2,  label: 'Ppto.',       fullLabel: 'Presupuesto'   },
  { path: '/recurring',    Icon: RefreshCw,  label: 'Pagos',       fullLabel: 'Pagos'         },
  { path: '/savings',      Icon: Target,     label: 'Metas',       fullLabel: 'Metas'         },
  { path: '/wallet',       Icon: Wallet,     label: 'Billetera',   fullLabel: 'Billetera'     },
]

interface Props {
  children: ReactNode
  title: string
}

export default function Layout({ children, title }: Props) {
  const { active } = useWallet()
  const location = useLocation()

  function isActive(path: string) {
    return path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  }

  return (
    <div className="flex flex-col h-full bg-bg-base md:flex-row md:h-screen md:overflow-hidden">

      {/* ── Desktop Sidebar ────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 flex-shrink-0 h-full">

        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-black text-white leading-none">$</span>
            </div>
            <span className="font-bold text-gray-900 text-[15px] leading-none">honeyMoney</span>
          </div>
          {active && (
            <div className="flex items-center gap-2 bg-primary/8 rounded-xl px-3 py-2">
              <Wallet size={12} className="text-primary flex-shrink-0" />
              <span className="text-xs font-semibold text-primary truncate">{active.name}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {TABS.map(({ path, Icon, fullLabel }) => {
            const active = isActive(path)
            return (
              <NavLink
                key={path}
                to={path}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                ].join(' ')}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 1.8}
                  className="flex-shrink-0"
                />
                {fullLabel}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-300 text-center font-medium">
            honeyMoney · {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      {/* ── Content column ────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden max-w-[430px] mx-auto w-full md:max-w-none md:mx-0">

        {/* Top bar */}
        <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 flex-shrink-0 md:px-8 md:py-4">
          <h1 className="font-bold text-gray-900 text-lg md:text-xl">{title}</h1>
          {/* Wallet pill — only on mobile (sidebar shows it on desktop) */}
          {active && (
            <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1 md:hidden">
              <Wallet size={11} className="text-primary" />
              <span className="text-xs font-semibold text-primary truncate max-w-[100px]">{active.name}</span>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </main>

        {/* Bottom nav — mobile only */}
        <nav className="bg-white border-t border-gray-100 flex-shrink-0 pb-safe md:hidden">
          <div className="flex">
            {TABS.map(({ path, Icon, label }) => {
              const active = isActive(path)
              return (
                <NavLink
                  key={path}
                  to={path}
                  className="flex-1 flex flex-col items-center gap-0.5 pt-2.5 pb-1.5 nav-tab"
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={`transition-all duration-150 ${active ? 'text-primary' : 'text-gray-400'}`}
                  />
                  <span className={`text-[9px] font-semibold tracking-wide transition-colors duration-150 ${active ? 'text-primary' : 'text-gray-400'}`}>
                    {label}
                  </span>
                  <div className={`h-0.5 w-4 rounded-full mt-0.5 transition-all duration-200 ${active ? 'bg-primary opacity-100' : 'opacity-0'}`} />
                </NavLink>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
