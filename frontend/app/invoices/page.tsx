"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"

interface Invoice {
  id: string
  invoiceNo: string
  client: { name: string } | string
  date: string
  totalAmount: number
  status: string
}

export default function InvoicesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await api.get("/invoices")
      const result = response.data || {}
      const invoices: Invoice[] = Array.isArray(result.data) ? result.data : []
      setInvoices(invoices)
    } catch (error) {
      console.error("Failed to fetch invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return
    try {
      await api.delete(`/invoices/${invoiceId}`)
      fetchInvoices()
    } catch (error) {
      console.error("Failed to delete invoice:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const clientName = typeof invoice.client === 'object' ? invoice.client.name : invoice.client
    const matchesSearch =
      invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <LayoutWrapper>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Invoices</h1>
            <p className="text-muted-foreground">Manage and track all your invoices</p>
          </div>
          <Link href="/invoices/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-72">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoice or client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Invoice No.</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                        No invoices found
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => {
                      const clientName = typeof invoice.client === 'object' ? invoice.client.name : invoice.client
                      return (
                        <tr key={invoice.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <Link href={`/invoices/${invoice.id}`} className="font-serif font-semibold text-foreground hover:underline">
                              {invoice.invoiceNo}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">{clientName}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(invoice.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-foreground">
                            ₹{invoice.totalAmount?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Link href={`/invoices/${invoice.id}`}>
                                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              {invoice.status.toLowerCase() === "draft" && (
                                <Link href={`/invoices/${invoice.id}/edit`}>
                                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Link>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(invoice.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
