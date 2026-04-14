import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function LandingPage() {
  return (
    <div className="pt-24 min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          Simplify Your NSS Finances
        </h1>
        <p className="text-xl text-gray-600">
          Manage budgets, track expenses, and automate insights with AI. The ultimate treasury solution for your committee.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link to="/dashboard">
            <Button size="lg" className="text-lg px-8 bg-blue-600 hover:bg-blue-700">Get Started</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl px-4 w-full">
        <Card className="border-none shadow-lg">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 font-bold text-xl">1</div>
            <h3 className="text-xl font-semibold">Track Every Penny</h3>
            <p className="text-gray-500">Record income and expenses effortlessly to maintain an up-to-date balance.</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600 font-bold text-xl">2</div>
            <h3 className="text-xl font-semibold">AI Receipt Parser</h3>
            <p className="text-gray-500">Upload your bills and let Gemini automatically extract the amount and details.</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600 font-bold text-xl">3</div>
            <h3 className="text-xl font-semibold">Budget Alerts</h3>
            <p className="text-gray-500">Stay on track with automated budget checks and receive email notifications.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
