import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, ShieldAlert, Award, Edit, Save, X } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(localStorage.getItem('userName') || 'NSS Treasurer')
  const [email, setEmail] = useState(localStorage.getItem('userEmail') || 'treasurer@college.edu')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email cannot be empty')
      return
    }

    setSaving(true)
    try {
      const res = await api.put('/auth/profile', { name, email })
      const { token, email: updatedEmail, name: updatedName } = res.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('userEmail', updatedEmail)
      localStorage.setItem('userName', updatedName)
      
      setName(updatedName)
      setEmail(updatedEmail)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
      
      // Force reload to update header name
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setName(localStorage.getItem('userName') || 'NSS Treasurer')
    setEmail(localStorage.getItem('userEmail') || 'treasurer@college.edu')
    setIsEditing(false)
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-2xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Treasurer Profile</h1>
          <p className="text-muted-foreground text-sm">Account details and system authorizations</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <Card className="border-none shadow-md bg-white overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 relative">
          <div className="absolute -bottom-10 left-6 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <User className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <CardContent className="pt-14 space-y-6">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 block uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 block uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                  placeholder="e.g. treasurer@college.edu"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2 border-t justify-end">
                <Button type="button" variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
                <p className="text-sm text-muted-foreground">National Service Scheme (NSS)</p>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="font-semibold text-gray-500 block text-xs uppercase">Email Address</span>
                    <span className="text-gray-900 font-medium">{email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <ShieldAlert className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="font-semibold text-gray-500 block text-xs uppercase">Access Role</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold uppercase">TREASURER</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Award className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="font-semibold text-gray-500 block text-xs uppercase">Organization Unit</span>
                    <span className="text-gray-900 font-medium">College NSS Unit</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
