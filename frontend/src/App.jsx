import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import AccountDetail from './pages/AccountDetail'
import CreateTransaction from './pages/CreateTransaction'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AccountsPage from './pages/AccountsPage'
import TransactionsPage from './pages/TransactionsPage'
import ReportsPage from './pages/ReportsPage'
import ProfilePage from './pages/ProfilePage'
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler'

function App() {
  const isAuthenticated = !!localStorage.getItem('token')

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/accounts" element={isAuthenticated ? <AccountsPage /> : <Navigate to="/login" />} />
          <Route path="/account/:id" element={isAuthenticated ? <AccountDetail /> : <Navigate to="/login" />} />
          <Route path="/transactions" element={isAuthenticated ? <TransactionsPage /> : <Navigate to="/login" />} />
          <Route path="/transaction/create" element={isAuthenticated ? <CreateTransaction /> : <Navigate to="/login" />} />
          <Route path="/reports" element={isAuthenticated ? <ReportsPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>
      </main>
      <Toaster richColors />
    </div>
  )
}

export default App
