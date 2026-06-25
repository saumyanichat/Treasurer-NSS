import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Star, Trash2, Edit } from 'lucide-react'

const ACCOUNT_TYPES = [
  { value: 'NSS_CAMP', label: 'NSS Camp' },
  { value: 'SCHOOL_TEACHING', label: 'School Teaching' },
  { value: 'TREE_PLANTATION', label: 'Tree Plantation' },
  { value: 'BLOOD_DONATION', label: 'Blood Donation' },
  { value: 'EVENT_ACTIVITY', label: 'Event Activity' },
  { value: 'OTHER', label: 'Other' },
]

export default function AccountsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  
  // Form fields
  const [name, setName] = useState('')
  const [type, setType] = useState('EVENT_ACTIVITY')
  const [allocatedAmount, setAllocatedAmount] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  // Fetch Accounts
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await api.get('/accounts')
      return res.data
    }
  })

  // Create/Edit Mutation
  const mutation = useMutation({
    mutationFn: async (accountData) => {
      if (editingAccount) {
        return await api.put(`/accounts/${editingAccount.id}`, accountData)
      } else {
        return await api.post('/accounts', accountData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] })
      toast.success(editingAccount ? 'Account updated successfully' : 'Account created successfully')
      closeModal()
    },
    onError: () => {
      toast.error('Failed to save account')
    }
  })

  // Set Default Mutation
  const defaultMutation = useMutation({
    mutationFn: async (id) => {
      return await api.post(`/accounts/${id}/default`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Default account updated')
    }
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/accounts/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] })
      toast.success('Account deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete account. Make sure its transactions are deleted first.')
    }
  })

  const openCreateModal = () => {
    setEditingAccount(null)
    setName('')
    setType('EVENT_ACTIVITY')
    setAllocatedAmount('')
    setIsDefault(false)
    setIsModalOpen(true)
  }

  const openEditModal = (acc) => {
    setEditingAccount(acc)
    setName(acc.name)
    setType(acc.type)
    setAllocatedAmount(acc.allocatedAmount)
    setIsDefault(acc.isDefault)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAccount(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({
      name,
      type,
      allocatedAmount: parseFloat(allocatedAmount),
      isDefault
    })
  }

  if (isLoading) return <div className="p-24 text-center text-lg font-medium">Loading NSS Event Accounts...</div>

  return (
    <div className="container mx-auto px-4 py-24 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Event Accounts & Budgets</h1>
          <p className="text-muted-foreground text-sm">Monitor activity budgets, spent balances, and limits</p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Event Account
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts?.map((acc) => {
          const allocated = parseFloat(acc.allocatedAmount) || 0
          const remaining = parseFloat(acc.balance) || 0
          const spent = allocated - remaining
          const pctUsed = allocated > 0 ? (spent / allocated) * 100 : 0

          let alertClass = 'bg-gray-100 text-gray-800'
          let progressColor = 'bg-blue-600'
          let warningMsg = ''

          if (pctUsed >= 100) {
            alertClass = 'bg-red-100 text-red-800 border border-red-200'
            progressColor = 'bg-red-600'
            warningMsg = 'CRITICAL: Budget Exceeded!'
          } else if (pctUsed >= 90) {
            alertClass = 'bg-orange-100 text-orange-800 border border-orange-200'
            progressColor = 'bg-orange-500'
            warningMsg = 'Warning: 90% budget consumed!'
          } else if (pctUsed >= 80) {
            alertClass = 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            progressColor = 'bg-yellow-500'
            warningMsg = 'Alert: 80% budget consumed!'
          }

          return (
            <Card key={acc.id} className="border-none shadow-md bg-white hover:shadow-lg transition-shadow relative overflow-hidden">
              {acc.isDefault && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-bl-lg font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Default
                </div>
              )}
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {acc.type.replace('_', ' ')}
                </span>
                <CardTitle className="text-xl font-bold text-gray-900 mt-1">{acc.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center py-2 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Allocated</span>
                    <p className="text-sm font-bold text-gray-800">₹{allocated}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Spent</span>
                    <p className="text-sm font-bold text-red-600">₹{spent}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Remaining</span>
                    <p className="text-sm font-bold text-emerald-600">₹{remaining}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-500">Budget Consumption</span>
                    <span className="font-bold text-gray-900">{pctUsed.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${progressColor}`} style={{ width: `${Math.min(pctUsed, 100)}%` }}></div>
                  </div>
                </div>

                {/* Warnings */}
                {warningMsg && (
                  <div className={`text-xs px-3 py-1.5 rounded-md font-bold text-center ${alertClass}`}>
                    {warningMsg}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(acc)} className="text-gray-600 hover:text-blue-600">
                      <Edit className="w-4 h-4" />
                    </Button>
                     <Button variant="ghost" size="sm" onClick={() => { if (window.confirm("Are you sure you want to delete this event account? All related transactions must be deleted first.")) deleteMutation.mutate(acc.id) }} className="text-gray-600 hover:text-red-600" disabled={deleteMutation.isPending}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`default-${acc.id}`}
                      checked={acc.isDefault}
                      onChange={() => defaultMutation.mutate(acc.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      disabled={defaultMutation.isPending}
                    />
                    <label htmlFor={`default-${acc.id}`} className="text-xs font-semibold text-gray-650 cursor-pointer select-none">
                      Default Account
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl border-none">
            <CardHeader>
              <CardTitle>{editingAccount ? 'Edit Event Account' : 'Create Event Account'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account/Event Name</label>
                  <input
                    type="text"
                    className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. NSS Camp 2026"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Type</label>
                  <select
                    className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none"
                    value={type}
                    onChange={e => setType(e.target.value)}
                  >
                    {ACCOUNT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Allocated Budget (₹)</label>
                  <input
                    type="number"
                    className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 50000"
                    value={allocatedAmount}
                    onChange={e => setAllocatedAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={e => setIsDefault(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="text-sm font-medium">Set as Default Account</label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Saving...' : 'Save Account'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
