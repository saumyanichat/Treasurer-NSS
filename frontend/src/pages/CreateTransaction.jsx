import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Upload, Sparkles, FileUp, ArrowLeft } from 'lucide-react'

const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Printing', 'Stationery', 'Decoration', 'Accommodation', 'Event Management', 'Miscellaneous']
const INCOME_CATEGORIES = ['College Funding', 'Donations', 'Sponsorship', 'Other']

export default function CreateTransaction() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Form Fields State
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('EXPENSE')
  const [category, setCategory] = useState('Food')
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16))
  const [description, setDescription] = useState('')
  const [receiptFile, setReceiptFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [generatingDesc, setGeneratingDesc] = useState(false)

  // Fetch Accounts
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await api.get('/accounts')
      return res.data
    }
  })

  // Mutation to Save Transaction
  const mutation = useMutation({
    mutationFn: async (txData) => {
      return await api.post('/transactions', txData)
    },
    onSuccess: async (res) => {
      const savedTx = res.data
      
      // If receipt is selected, upload it
      if (receiptFile) {
        const formData = new FormData()
        formData.append('file', receiptFile)
        try {
          await api.post(`/transactions/${savedTx.id}/receipt`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          toast.success('Receipt uploaded successfully')
        } catch (uploadError) {
          toast.error('Transaction saved, but receipt upload failed.')
        }
      }

      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] })
      toast.success('Transaction added successfully')
      navigate('/dashboard')
    },
    onError: () => {
      toast.error('Failed to add transaction')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!accountId) {
      toast.error('Please select an account')
      return
    }
    mutation.mutate({
      title,
      description,
      amount: parseFloat(amount),
      type,
      category,
      accountId,
      date: new Date(date).toISOString()
    })
  }

  const triggerScan = async () => {
    if (!receiptFile) {
      toast.warning('Please select a receipt document first!')
      return
    }
    setScanning(true)
    const toastId = toast.loading('AI is scanning and parsing your receipt...')

    try {
      const formData = new FormData()
      formData.append('file', receiptFile)

      const res = await api.post('/ai/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const data = res.data
      if (data.amount) setAmount(data.amount.toString())
      if (data.vendorName) setTitle(`Receipt: ${data.vendorName}`)
      if (data.categorySuggestion) {
        const matched = EXPENSE_CATEGORIES.find(c => c.toLowerCase() === data.categorySuggestion.toLowerCase())
        if (matched) setCategory(matched)
      }
      
      // Auto set type to EXPENSE for receipts
      setType('EXPENSE')

      if (data.date) {
        try {
          const d = new Date(data.date)
          if (!isNaN(d.getTime())) {
            const year = d.getFullYear()
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            const hours = String(d.getHours()).padStart(2, '0')
            const minutes = String(d.getMinutes()).padStart(2, '0')
            setDate(`${year}-${month}-${day}T${hours}:${minutes}`)
          }
        } catch (dateErr) {
          setDate(new Date().toISOString().substring(0, 16))
        }
      }

      toast.success('Receipt scanned and details populated successfully!', { id: toastId })

      // Auto generate description based on scanned info
      try {
        const descRes = await api.get('/ai/generate-description', {
          params: {
            category: data.categorySuggestion || category || 'Food',
            amount: data.amount ? parseFloat(data.amount) : null,
            type: 'EXPENSE',
            vendorName: data.vendorName || 'NSS activity'
          }
        })
        if (descRes.data?.description) {
          setDescription(descRes.data.description)
        }
      } catch (descErr) {
        setDescription(`Expense at ${data.vendorName || 'NSS activity'}`)
      }
    } catch (err) {
      toast.error('AI Scanning failed. Please enter details manually.', { id: toastId })
    } finally {
      setScanning(false)
    }
  }

  const handleAiGenerateDescription = async () => {
    if (!category) {
      toast.warning('Please select or input a category first!')
      return
    }
    setGeneratingDesc(true)
    const toastId = toast.loading('Generating description using Gemini AI...')
    try {
      const res = await api.get('/ai/generate-description', {
        params: {
          category,
          amount: amount ? parseFloat(amount) : null,
          type,
          vendorName: title || 'NSS Activity'
        }
      })
      if (res.data?.description) {
        setDescription(res.data.description)
        toast.success('Description generated!', { id: toastId })
      } else {
        toast.error('Could not generate description', { id: toastId })
      }
    } catch (err) {
      toast.error('AI generation failed.', { id: toastId })
    } finally {
      setGeneratingDesc(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-600 hover:text-blue-600">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Record Transaction</h1>
      </div>

      <Card className="border-none shadow-md bg-white">
        <CardContent className="pt-6">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Account</label>
                <select 
                  className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select 
                  className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={type}
                  onChange={e => {
                    setType(e.target.value)
                    setCategory(e.target.value === 'EXPENSE' ? 'Food' : 'College Funding')
                  }}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input 
                  type="text" 
                  className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="e.g. Travel tickets to camp"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="e.g. 1250"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                  className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {type === 'EXPENSE'
                    ? EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    : INCOME_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
                  }
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Description</label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold p-0 h-auto flex items-center gap-1"
                  onClick={handleAiGenerateDescription}
                  disabled={generatingDesc}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                  {generatingDesc ? 'Generating...' : 'Auto-generate description'}
                </Button>
              </div>
              <textarea 
                rows="2"
                className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Details about expense (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2 border-t pt-3">
              <label className="text-sm font-medium flex items-center gap-1">
                <FileUp className="w-4 h-4 text-gray-500" />
                Receipt Document (Optional)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={e => setReceiptFile(e.target.files[0])}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {receiptFile && (
                <div className="flex items-center gap-3 mt-2 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-800 truncate">Selected: {receiptFile.name}</p>
                    <p className="text-[10px] text-gray-400">Ready to upload or scan</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={triggerScan}
                    className="bg-blue-600 border-none hover:bg-blue-700 text-white font-bold text-xs shrink-0 py-1.5 h-auto flex items-center gap-1"
                    disabled={scanning}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                    {scanning ? 'Scanning...' : 'Scan & Autofill Form'}
                  </Button>
                </div>
              )}
            </div>
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Transaction'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
