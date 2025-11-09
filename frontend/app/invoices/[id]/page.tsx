"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Edit, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"

interface InvoiceItem {
  id: string
  name: string
  hsnCode?: string
  quantity: number
  rate: number
  taxRate: number
  amount: number
  taxAmount: number
  total: number
}

interface Invoice {
  id: string
  invoiceNo: string
  date: string
  status: string
  totalAmount: number
  taxAmount: number
  client: {
    name: string
    gstin?: string
    billingAddress?: string
    state?: string
  }
  company: {
    name: string
    gstin?: string
    address?: string
    state?: string
  }
  items: InvoiceItem[]
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice()
    }
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${invoiceId}`)
      setInvoice(response.data)
    } catch (error) {
      console.error("Failed to fetch invoice:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status: string) => {
    try {
      await api.patch(`/invoices/${invoiceId}`, { status })
      await fetchInvoice()
    } catch (error) {
      console.error("Failed to update invoice status:", error)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${invoice?.invoiceNo || 'invoice'}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error("Failed to download PDF:", error)
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

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="p-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </LayoutWrapper>
    )
  }

  if (!invoice) {
    return (
      <LayoutWrapper>
        <div className="p-8">
          <p className="text-muted-foreground">Invoice not found</p>
        </div>
      </LayoutWrapper>
    )
  }
  return (
    <LayoutWrapper>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/invoices">
              <Button variant="ghost" className="mb-4">
                ← Back to Invoices
              </Button>
            </Link>
            <h1 className="font-serif text-4xl font-bold text-foreground">{invoice.invoiceNo}</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            {invoice.status === "draft" && (
              <Link href={`/invoices/${invoiceId}/edit`}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground font-semibold mb-1">STATUS</p>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Badge>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground font-semibold mb-1">INVOICE DATE</p>
              <p className="text-lg font-semibold text-foreground">
                {new Date(invoice.date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground font-semibold mb-1">AMOUNT</p>
              <p className="text-lg font-serif font-bold text-foreground">
                ₹{invoice.totalAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground font-semibold mb-1">TAX</p>
              <p className="text-lg font-semibold text-foreground">
                ₹{invoice.taxAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="font-serif text-base">From</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="font-semibold text-foreground">{invoice.company.name}</p>
              {invoice.company.gstin && (
                <p className="text-sm text-muted-foreground">GSTIN: {invoice.company.gstin}</p>
              )}
              {invoice.company.address && (
                <p className="text-sm text-muted-foreground mt-2">{invoice.company.address}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="font-serif text-base">Bill To</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="font-semibold text-foreground">{invoice.client.name}</p>
              {invoice.client.gstin && (
                <p className="text-sm text-muted-foreground">GSTIN: {invoice.client.gstin}</p>
              )}
              {invoice.client.billingAddress && (
                <p className="text-sm text-muted-foreground mt-2">{invoice.client.billingAddress}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card className="border-0 shadow-sm mb-8">
          <CardHeader className="border-b">
            <CardTitle className="font-serif">Invoice Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">HSN Code</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Rate</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Tax</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4 text-sm text-foreground">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{item.hsnCode || "-"}</td>
                      <td className="px-6 py-4 text-sm text-right text-foreground">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-right text-foreground">
                        ₹{item.rate.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-foreground">
                        ₹{item.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-muted-foreground">
                        {item.taxRate}%
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-foreground">
                        ₹{item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="flex justify-end mb-8">
          <Card className="w-full md:w-80 border-0 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold">
                  ₹{(invoice.totalAmount - invoice.taxAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-semibold">₹{invoice.taxAmount.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-serif font-bold">
                <span>Total:</span>
                <span>₹{invoice.totalAmount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        {invoice.status === "draft" && (
          <div className="flex gap-3 flex-wrap">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={() => handleStatusUpdate("sent")}
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Sent
            </Button>
          </div>
        )}
        {invoice.status === "sent" && (
          <div className="flex gap-3 flex-wrap">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
              onClick={() => handleStatusUpdate("paid")}
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Paid
            </Button>
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => handleStatusUpdate("cancelled")}
            >
              <XCircle className="w-4 h-4" />
              Cancel Invoice
            </Button>
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}
