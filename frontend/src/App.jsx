import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import AccountDetail from './pages/AccountDetail'
import CreateTransaction from './pages/CreateTransaction'
import LandingPage from './pages/LandingPage'
import { useAuthToken } from './hooks/useAuthToken'

function App() {
  useAuthToken()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/account/:id" element={<AccountDetail />} />
          <Route path="/transaction/create" element={<CreateTransaction />} />
        </Routes>
      </main>
      <Toaster richColors />
    </div>
  )
}

export default App
