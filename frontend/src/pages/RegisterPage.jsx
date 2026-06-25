import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Eye, EyeOff, Check, X, Shield } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Real-time password complexity validators
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[@$!%*?&#]/.test(password)
  
  const isPasswordStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar
  const doPasswordsMatch = password === confirmPassword && password !== ''

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!isPasswordStrong) {
      toast.error('Please meet all password strength requirements.')
      return
    }
    if (!doPasswordsMatch) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', { name, email, password })
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialAuth = (provider) => {
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider.toLowerCase()}`
  }

  return (
    <div className="pt-32 pb-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg shadow-2xl border-none bg-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Treasurer Registration</CardTitle>
          <p className="text-sm text-center text-muted-foreground">Create a strong dashboard access account</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Social OAuth2 Section */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" type="button" onClick={() => handleSocialAuth('Google')} className="text-xs hover:bg-gray-50 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#ea4335" d="M12 5.04c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 1.68 14.93 1 12 1 7.35 1 3.39 3.65 1.48 7.5l3.87 3C6.31 7.55 8.94 5.04 12 5.04z" />
                <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.62z" />
                <path fill="#fbbc05" d="M5.35 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.48 6.9C.54 8.79 0 10.9 0 13.1s.54 4.31 1.48 6.2l3.87-3.8z" />
                <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.73-2.89c-1.04.7-2.37 1.12-4.23 1.12-3.06 0-5.69-2.51-6.65-5.46L1.48 16.7C3.39 20.35 7.35 23 12 23z" />
              </svg>
              Google
            </Button>
            <Button variant="outline" type="button" onClick={() => handleSocialAuth('GitHub')} className="text-xs hover:bg-gray-50 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </Button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-medium">Or sign up with email</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              <input
                type="text"
                className="w-full border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Saumya Nichat"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                className="w-full border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="treasurer@college.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full border rounded-md p-2.5 pr-10 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full border rounded-md p-2.5 pr-10 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Validation Criteria Checklist */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs space-y-2">
              <p className="font-semibold text-gray-600 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Password strength checklist:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  {hasMinLength ? <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                  <span className={hasMinLength ? 'text-green-700 font-medium' : 'text-gray-500'}>8+ Characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasUppercase ? <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                  <span className={hasUppercase ? 'text-green-700 font-medium' : 'text-gray-500'}>1 Uppercase Letter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasLowercase ? <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                  <span className={hasLowercase ? 'text-green-700 font-medium' : 'text-gray-500'}>1 Lowercase Letter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasNumber ? <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                  <span className={hasNumber ? 'text-green-700 font-medium' : 'text-gray-500'}>1 Numeric Digit</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  {hasSpecialChar ? <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                  <span className={hasSpecialChar ? 'text-green-700 font-medium' : 'text-gray-500'}>1 Special Character (@$!%*?&#)</span>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 font-bold" disabled={loading || !isPasswordStrong || !doPasswordsMatch}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
          <div className="text-center text-sm">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-semibold">Login here</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
