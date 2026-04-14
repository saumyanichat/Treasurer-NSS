import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function AccountDetail() {
  const { id } = useParams()

  const { data: account, isLoading } = useQuery({
    queryKey: ['account', id],
    queryFn: async () => {
      const res = await api.get(`/accounts/${id}`)
      return res.data
    }
  })

  if (isLoading) return <div className="p-24 text-center">Loading account details...</div>
  if (!account) return <div className="p-24 text-center">Account not found</div>

  return (
    <div className="container mx-auto px-4 py-24 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{account.name}</h1>
          <p className="text-muted-foreground">{account.type} Account</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">${account.balance}</div>
          <p className="text-muted-foreground">Current Balance</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {account.transactions && account.transactions.length > 0 ? (
            <div className="space-y-4">
              {account.transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{tx.description || tx.category}</p>
                    <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}${tx.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
