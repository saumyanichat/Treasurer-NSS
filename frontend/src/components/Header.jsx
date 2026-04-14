import React from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import { Button } from './ui/button'
import { LayoutDashboard, PenBox } from 'lucide-react'

export default function Header() {
  const { user } = useUser()

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">NSS<span className="text-blue-600">Treasurer</span></span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <SignedOut>
             <SignInButton mode="modal">
               <Button variant="outline">Sign In</Button>
             </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard">
              <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/transaction/create">
              <Button>
                <PenBox className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
