import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('Password reset OTP sent successfully to your email!')
      navigate('/reset-password', { state: { email } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Verify your email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-32 pb-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
          <p className="text-sm text-center text-muted-foreground">Request an OTP code to reset your password</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-4">
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
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Reset Code'}
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
