import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const name = searchParams.get('name')

    if (token) {
      localStorage.setItem('token', token)
      if (email) localStorage.setItem('userEmail', email)
      if (name) localStorage.setItem('userName', name)

      // Set auth header for current API instance
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      toast.success('Social Login Successful!')
      
      // Redirect to dashboard and force reload to refresh app auth state
      navigate('/dashboard')
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } else {
      toast.error('OAuth2 authentication failed. Token not received.')
      navigate('/login')
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="text-xl font-semibold text-gray-700">Completing Social Authentication...</h2>
        <p className="text-sm text-gray-500">Please wait while we log you in.</p>
      </div>
    </div>
  )
}
