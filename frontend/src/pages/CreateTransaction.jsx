import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'

export default function CreateTransaction() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('EXPENSE')
  const [category, setCategory] = useState('')
  const [accountId, setAccountId] = useState('')

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await api.get('/accounts')
      return res.data
    }
  })

  const mutation = useMutation({
    mutationFn: async (newTx) => {
      return await api.post('/transactions', newTx)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['account'] })
      toast.success('Transaction added successfully')
      navigate('/dashboard')
    },
    onError: () => {
      toast.error('Failed to add transaction')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({
      type,
      amount: parseFloat(amount),
      description,
      category,
      accountId,
      date: new Date().toISOString(),
      isRecurring: false
    })
  }

  const handleReceiptScan = () => {
    toast.info('Receipt scan logic (Gemini) would trigger here.')
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex justify-center">
            <Button variant="outline" onClick={handleReceiptScan} className="w-full h-24 border-dashed bg-blue-50/50 hover:bg-blue-50 text-blue-600">
              <Upload className="mr-2 h-6 w-6" />
              Scan Receipt with AI
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Account</label>
              <select 
                className="w-full border rounded-md p-2 bg-background"
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                required
              >
                <option value="">Select Account</option>
                {accounts?.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select 
                  className="w-full border rounded-md p-2 bg-background"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full border rounded-md p-2 bg-background"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <input 
                type="text" 
                className="w-full border rounded-md p-2 bg-background"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <input 
                type="text" 
                className="w-full border rounded-md p-2 bg-background"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Transaction'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
