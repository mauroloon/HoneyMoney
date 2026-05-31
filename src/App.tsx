import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { WalletProvider, useWallet } from './contexts/WalletContext'
import { FinanceProvider } from './contexts/FinanceContext'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import NoWalletPage from './pages/NoWalletPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import SavingsPage from './pages/SavingsPage'
import WalletPage from './pages/WalletPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WalletProvider>
          <InnerApp />
        </WalletProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

function InnerApp() {
  const { user, loading: authLoading } = useAuth()
  const { active, loading: walletLoading } = useWallet()

  // Loading splash
  if (authLoading || walletLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-3xl font-black text-primary">$</span>
          </div>
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Not logged in → auth screen
  if (!user) return <AuthPage />

  // Logged in but no wallet → onboarding
  if (!active) return <NoWalletPage />

  // Main app
  return (
    <FinanceProvider>
      <Routes>
        <Route path="/"             element={<Layout title="Inicio">         <DashboardPage />    </Layout>} />
        <Route path="/transactions" element={<Layout title="Movimientos">    <TransactionsPage /> </Layout>} />
        <Route path="/savings"      element={<Layout title="Metas de ahorro"><SavingsPage />      </Layout>} />
        <Route path="/wallet"       element={<Layout title="Mi billetera">   <WalletPage />       </Layout>} />
      </Routes>
    </FinanceProvider>
  )
}
