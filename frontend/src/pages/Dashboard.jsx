import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { Plus } from 'lucide-react'

export default function Dashboard() {
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await api.get('/accounts')
      return res.data
    }
  })

  const { data: budget, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget'],
    queryFn: async () => {
      try {
        const res = await api.get('/budget')
        return res.data
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return null
        }
        throw error
      }
    }
  })

  // Basic layout and UI
  return (
    <div className="container mx-auto px-4 py-24 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/transaction/create">
          <Button>Create Transaction</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accountsLoading ? (
          <p>Loading accounts...</p>
        ) : accounts && accounts.length > 0 ? (
          accounts.map(account => (
            <Link to={`/account/${account.id}`} key={account.id}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{account.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${account.balance}</div>
                  <p className="text-xs text-muted-foreground">{account.type}</p>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="col-span-full border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
              <p className="text-muted-foreground">No accounts found.</p>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Budget Section */}
      <h2 className="text-2xl font-bold mt-8">Budget</h2>
      {budgetLoading ? (
        <p>Loading budget...</p>
      ) : budget ? (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${budget.amount}</div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No budget set up.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
