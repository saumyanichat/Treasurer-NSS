import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword })
      toast.success('Password reset successfully! Please login with your new password.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed. Verify your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-32 pb-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <p className="text-sm text-center text-muted-foreground">Enter your OTP and choose a new password</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="treasurer@college.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">6-Digit OTP</label>
              <input
                type="text"
                className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="123456"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <input
                type="password"
                className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Remember your password? <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
