import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, FileUp, Sparkles, Trash2, Edit, FileText } from 'lucide-react'

const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Printing', 'Stationery', 'Decoration', 'Accommodation', 'Event Management', 'Miscellaneous']
const INCOME_CATEGORIES = ['College Funding', 'Donations', 'Sponsorship', 'Other']

export default function TransactionsPage() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTx, setEditingTx] = useState(null)

  // Filters State
  const [search, setSearch] = useState('')
  const [accountIdFilter, setAccountIdFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('date')
  const [direction, setDirection] = useState('DESC')
  const [page, setPage] = useState(0)

  // Form Fields State
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('EXPENSE')
  const [category, setCategory] = useState('')
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [receiptFile, setReceiptFile] = useState(null)
  const [aiScanning, setAiScanning] = useState(false)
  const [generatingDesc, setGeneratingDesc] = useState(false)

  // Fetch Accounts (for filter & form dropdown)
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await api.get('/accounts')
      return res.data
    }
  })

  // Fetch Filtered Transactions
  const { data: txPage, isLoading } = useQuery({
    queryKey: ['transactions', page, accountIdFilter, categoryFilter, search, sortBy, direction],
    queryFn: async () => {
      const params = {
        page,
        size: 8,
        accountId: accountIdFilter === 'ALL' ? '' : accountIdFilter,
        category: categoryFilter === 'ALL' ? '' : categoryFilter,
        search,
        sortBy,
        direction
      }
      const res = await api.get('/transactions', { params })
      return res.data
    }
  })

  // Mutation to Save Transaction
  const saveMutation = useMutation({
    mutationFn: async (txData) => {
      if (editingTx) {
        return await api.put(`/transactions/${editingTx.id}`, txData)
      } else {
        return await api.post('/transactions', txData)
      }
    },
    onSuccess: async (res) => {
      const savedTx = res.data
      
      // If there is a receipt file, upload it now
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

      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] })
      toast.success(editingTx ? 'Transaction updated successfully' : 'Transaction added successfully')
      closeForm()
    },
    onError: () => {
      toast.error('Failed to save transaction')
    }
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/transactions/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] })
      toast.success('Transaction deleted')
    }
  })

  const openAddForm = () => {
    setEditingTx(null)
    setTitle('')
    setAmount('')
    setType('EXPENSE')
    setCategory('Food')
    setAccountId(accounts && accounts.length > 0 ? accounts[0].id : '')
    setDate(new Date().toISOString().substring(0, 16))
    setDescription('')
    setReceiptFile(null)
    setIsFormOpen(true)
  }

  const openEditForm = (tx) => {
    setEditingTx(tx)
    setTitle(tx.title)
    setAmount(tx.amount)
    setType(tx.type)
    setCategory(tx.category)
    setAccountId(tx.account.id)
    setDate(new Date(tx.date).toISOString().substring(0, 16))
    setDescription(tx.description || '')
    setReceiptFile(null)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingTx(null)
    setReceiptFile(null)
  }

  const triggerScan = async () => {
    if (!receiptFile) {
      toast.warning('Please select a receipt document first!')
      return
    }

    setAiScanning(true)
    const formData = new FormData()
    formData.append('file', receiptFile)

    const toastId = toast.loading('Gemini AI is parsing your receipt, please wait...')
    try {
      const res = await api.post('/ai/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const data = res.data

      // Autofill fields
      if (data.amount) setAmount(data.amount.toString())
      if (data.vendorName) setTitle(`Receipt: ${data.vendorName}`)
      if (data.categorySuggestion) {
        // Match suggestion with expense categories
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
          } else {
            setDate(new Date().toISOString().substring(0, 16))
          }
        } catch (dateErr) {
          setDate(new Date().toISOString().substring(0, 16))
        }
      } else {
        setDate(new Date().toISOString().substring(0, 16))
      }
      
      toast.success('AI Scanning completed!', { id: toastId })

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
      setAiScanning(false)
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!accountId) {
      toast.error('Please select an account')
      return
    }
    saveMutation.mutate({
      title,
      description,
      amount: parseFloat(amount),
      type,
      category,
      accountId,
      date: new Date(date).toISOString()
    })
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setDirection(direction === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(field)
      setDirection('DESC')
    }
    setPage(0)
  }

  return (
    <div className="container mx-auto px-4 py-24 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Financial Transactions</h1>
          <p className="text-muted-foreground text-sm">Register income and expenses, search entries, and manage receipts</p>
        </div>
        <Button onClick={openAddForm} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Filter and Search Panel */}
      <Card className="border-none shadow-md bg-white">
        <CardContent className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              className="pl-9 w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <select
              value={accountIdFilter}
              onChange={e => { setAccountIdFilter(e.target.value); setPage(0) }}
              className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="ALL">All Accounts</option>
              {accounts?.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(0) }}
              className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="ALL">All Categories</option>
              <option disabled>-- Expenses --</option>
              {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              <option disabled>-- Income --</option>
              {INCOME_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <select
              value={`${sortBy}-${direction}`}
              onChange={e => {
                const [field, dir] = e.target.value.split('-')
                setSortBy(field)
                setDirection(dir)
                setPage(0)
              }}
              className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="date-DESC">Date: Newest First</option>
              <option value="date-ASC">Date: Oldest First</option>
              <option value="amount-DESC">Amount: High to Low</option>
              <option value="amount-ASC">Amount: Low to High</option>
            </select>
          </div>

          <Button variant="outline" className="text-sm" onClick={() => {
            setSearch('')
            setAccountIdFilter('ALL')
            setCategoryFilter('ALL')
            setSortBy('date')
            setDirection('DESC')
            setPage(0)
          }}>
            Reset Filters
          </Button>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-none shadow-md bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                  <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('title')}>Title</th>
                  <th className="p-4">Account</th>
                  <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('category')}>Category</th>
                  <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('date')}>Date</th>
                  <th className="p-4">Receipt</th>
                  <th className="p-4 cursor-pointer hover:bg-gray-100 text-right" onClick={() => handleSort('amount')}>Amount</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-muted-foreground">Loading transactions data...</td>
                  </tr>
                ) : txPage?.content?.length > 0 ? (
                  txPage.content.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-semibold text-gray-900">
                        {tx.title}
                        {tx.description && <p className="text-xs text-gray-500 font-normal mt-0.5">{tx.description}</p>}
                      </td>
                      <td className="p-4 text-muted-foreground">{tx.account?.name}</td>
                      <td className="p-4 text-muted-foreground">{tx.category}</td>
                      <td className="p-4 text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="p-4">
                        {tx.receiptUrl ? (
                          <a href={`http://localhost:8080${tx.receiptUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center text-xs gap-1 font-medium">
                            <FileText className="w-3 h-3" /> View
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">No Receipt</span>
                        )}
                      </td>
                      <td className={`p-4 text-right font-bold text-base ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amount}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditForm(tx)} className="text-gray-600 hover:text-blue-600">
                            <Edit className="w-4 h-4" />
                          </Button>
                           <Button variant="ghost" size="sm" onClick={() => { if (window.confirm("Are you sure you want to delete this transaction?")) deleteMutation.mutate(tx.id) }} className="text-gray-600 hover:text-red-600" disabled={deleteMutation.isPending}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-muted-foreground">No transactions matching criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {txPage && txPage.totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50/50">
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {txPage.totalPages} ({txPage.totalElements} records)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(txPage.totalPages - 1, p + 1))} disabled={page === txPage.totalPages - 1}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Entry Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg bg-white shadow-2xl border-none">
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle>{editingTx ? 'Edit Transaction' : 'Record Transaction'}</CardTitle>
            </CardHeader>
            <CardContent>
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
                        disabled={aiScanning}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                        {aiScanning ? 'Scanning...' : 'Scan & Autofill Form'}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Saving...' : 'Save Transaction'}
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
