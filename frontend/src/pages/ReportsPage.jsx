import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'
import { FileText, FileSpreadsheet, Mail } from 'lucide-react'

export default function ReportsPage() {
  const queryClient = useQueryClient()
  const [reportType, setReportType] = useState('EVENT_ACCOUNT')
  const [accountId, setAccountId] = useState('ALL')
  const [emailLoading, setEmailLoading] = useState(false)

  // Fetch Accounts
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await api.get('/accounts')
      return res.data
    }
  })

  // Fetch Generated Reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await api.get('/reports')
      return res.data
    }
  })

  const triggerDownload = (response, filename) => {
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleDownloadPdf = async () => {
    try {
      toast.info('Generating PDF report...')
      const res = await api.get('/reports/pdf', {
        params: { type: reportType, accountId },
        responseType: 'blob'
      })
      triggerDownload(res, `NSS_Report_${reportType}_${Date.now()}.pdf`)
      toast.success('PDF report downloaded successfully!')
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    } catch (err) {
      toast.error('Failed to generate PDF report.')
    }
  }

  const handleDownloadExcel = async () => {
    try {
      toast.info('Generating Excel export...')
      const res = await api.get('/reports/excel', {
        params: { accountId },
        responseType: 'blob'
      })
      triggerDownload(res, `NSS_Export_${Date.now()}.xlsx`)
      toast.success('Excel downloaded successfully!')
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    } catch (err) {
      toast.error('Failed to generate Excel report.')
    }
  }

  const handleEmailReport = async (format) => {
    setEmailLoading(true)
    const endpoint = format === 'pdf' ? '/reports/email-pdf' : '/reports/email-excel'
    toast.info(`Generating and emailing ${format.toUpperCase()} report...`)
    try {
      await api.post(endpoint, null, {
        params: { type: reportType, accountId }
      })
      toast.success(`${format.toUpperCase()} report sent to your registered email!`)
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    } catch (err) {
      toast.error('Failed to send email.')
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-24 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Report Generator</h1>
        <p className="text-muted-foreground text-sm">Export financial records as iText PDF or Apache POI Excel, or deliver via email</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Generator Controls */}
        <Card className="border-none shadow-md bg-white md:col-span-1">
          <CardHeader>
            <CardTitle>Configure Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <select
                className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={reportType}
                onChange={e => setReportType(e.target.value)}
              >
                <option value="EVENT_ACCOUNT">Event Account Report</option>
                <option value="MONTHLY">Monthly Report</option>
                <option value="ANNUAL">Annual Report</option>
              </select>
            </div>

            {reportType === 'EVENT_ACCOUNT' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Event Account</label>
                <select
                  className="w-full border rounded-md p-2 bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                >
                  <option value="ALL">All Event Accounts</option>
                  {accounts?.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2 border-t pt-4">
              <Button onClick={handleDownloadPdf} className="w-full bg-blue-600 hover:bg-blue-700 justify-start">
                <FileText className="w-4 h-4 mr-2" /> Download PDF Report
              </Button>
              <Button onClick={handleDownloadExcel} variant="outline" className="w-full justify-start text-gray-700">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" /> Download Excel Sheet
              </Button>
              <Button onClick={() => handleEmailReport('pdf')} variant="outline" className="w-full justify-start text-gray-700" disabled={emailLoading}>
                <Mail className="w-4 h-4 mr-2 text-indigo-500" /> Email PDF Report
              </Button>
              <Button onClick={() => handleEmailReport('excel')} variant="outline" className="w-full justify-start text-gray-700" disabled={emailLoading}>
                <Mail className="w-4 h-4 mr-2 text-violet-500" /> Email Excel Sheet
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* History of Generated Reports */}
        <Card className="border-none shadow-md bg-white md:col-span-2">
          <CardHeader>
            <CardTitle>Report Generation Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading history logs...</p>
            ) : reports && reports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                      <th className="p-3">Report Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Generated At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-semibold text-gray-900 break-all">{rep.name}</td>
                        <td className="p-3 text-muted-foreground">
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{rep.type}</span>
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(rep.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No reports logged in database yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
