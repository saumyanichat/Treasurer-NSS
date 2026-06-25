import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { Plus, ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Activity, Calendar } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function Dashboard() {
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary')
      return res.data
    }
  })

  if (isLoading) {
    return <div className="p-24 text-center text-lg font-medium">Loading Dashboard statistics...</div>
  }

  if (error) {
    return <div className="p-24 text-center text-red-600 font-medium">Error loading dashboard details. Verify your connection.</div>
  }

  // Parse category breakdown for Recharts
  const pieData = Object.entries(summary.categoryBreakdown || {}).map(([name, value]) => ({
    name,
    value: parseFloat(value)
  }))

  return (
    <div className="container mx-auto px-4 py-24 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">NSS Treasury Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of college activities, budgets, and expenses</p>
        </div>
        <div className="flex gap-4">
          <Link to="/accounts">
            <Button variant="outline">Manage Accounts</Button>
          </Link>
          <Link to="/transaction/create">
            <Button className="bg-blue-600 hover:bg-blue-700">Add Transaction</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-gray-500">Current Balance</CardTitle>
            <Wallet className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹{summary.currentBalance}</div>
            <p className="text-xs text-muted-foreground">Cumulative sum of all event accounts</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-gray-500">Total Income</CardTitle>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">₹{summary.totalIncome}</div>
            <p className="text-xs text-muted-foreground">All college funding & sponsorships</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-gray-500">Total Expenses</CardTitle>
            <ArrowDownRight className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{summary.totalExpense}</div>
            <p className="text-xs text-muted-foreground">Event management spent total</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-gray-500">Active Accounts</CardTitle>
            <DollarSign className="w-4 h-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{summary.activeAccounts}</div>
            <p className="text-xs text-muted-foreground">Allocated event projects</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-gray-500">Total Logs</CardTitle>
            <Activity className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{summary.transactionCount}</div>
            <p className="text-xs text-muted-foreground">Logged records count</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Expense Category Pie */}
        <Card className="border-none shadow-md md:col-span-1 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie data={pieData} innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground">No expense categories to display.</p>
            )}
          </CardContent>
        </Card>

        {/* Income vs Expense Bar */}
        <Card className="border-none shadow-md md:col-span-1 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Income vs Expense</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.incomeVsExpense}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend Line */}
        <Card className="border-none shadow-md md:col-span-1 lg:col-span-1 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Monthly Expense Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {summary.monthlyTrend && summary.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.monthlyTrend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground pt-24">No transaction history to plot trend.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="border-none shadow-md md:col-span-2 bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
            <Link to="/transactions" className="text-xs text-blue-600 hover:underline">View All</Link>
          </CardHeader>
          <CardContent>
            {summary.recentTransactions && summary.recentTransactions.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {summary.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center py-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{tx.title}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">{tx.category}</span>
                        <span>{new Date(tx.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className={`font-bold text-lg ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent transactions recorded.</p>
            )}
          </CardContent>
        </Card>

        {/* Categories Summary Side Box */}
        <Card className="border-none shadow-md md:col-span-1 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="space-y-4">
                {pieData.sort((a, b) => b.value - a.value).map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">₹{cat.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No spending categories listed.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
