import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { LayoutDashboard, PenBox, LogOut, User, DollarSign, FileText } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const userName = localStorage.getItem('userName') || 'NSS Treasurer'
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.clear()
      navigate('/')
      window.location.reload()
    }
  }

  const getInitials = (name) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const initials = getInitials(userName)

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to={token ? "/dashboard" : "/"}>
          <div className="flex items-center gap-2">
            <img 
              src="https://www.adina.edu.in/wp-content/uploads/2023/12/National-Service-Scheme_Preview-removebg-preview.png"
              alt="NSS Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold text-[#1e293b] tracking-tight">NSS<span className="text-blue-600 font-extrabold">Treasurer</span></span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {!token ? (
            <>
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">Register</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/accounts">
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Accounts
                </Button>
              </Link>
              <Link to="/transactions">
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                  <PenBox className="w-4 h-4 mr-2" />
                  Transactions
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                  <FileText className="w-4 h-4 mr-2" />
                  Reports
                </Button>
              </Link>

              {/* User Initials Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center text-sm shadow-md border-2 border-white focus:outline-none transition-colors cursor-pointer"
                >
                  {initials}
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b">
                        <span className="text-[10px] text-gray-400 font-semibold block uppercase">Logged in as</span>
                        <p className="text-sm font-bold text-gray-800 truncate">{userName}</p>
                      </div>
                      <Link 
                        to="/profile" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        View/Edit Profile
                      </Link>
                      <button 
                        onClick={() => { setDropdownOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors border-t mt-1 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
