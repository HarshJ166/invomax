"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import Link from "next/link"
import { Plus, FileText, DollarSign, Clock, CheckCircle } from "lucide-react"
import api from "@/lib/api"

interface Invoice {
  id: string
  invoiceNo: string
  client: { name: string }
  date: string
  totalAmount: number
  status: string
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    pending: 0,
    paid: 0,
  })
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [invoicesRes] = await Promise.all([
        api.get("/invoices"),
      ])

      const result = invoicesRes.data || {}
      const invoices: Invoice[] = Array.isArray(result.data) ? result.data : []
      const totalInvoices = invoices.length
      const totalRevenue = invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
      const pending = invoices.filter((inv) => inv.status === "sent" || inv.status === "draft").length
      const paid = invoices.filter((inv) => inv.status === "paid").length

      setStats({ totalInvoices, totalRevenue, pending, paid })
      setRecentInvoices(invoices.slice(0, 5))
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statsData = [
    {
      label: "Total Invoices",
      value: stats.totalInvoices.toLocaleString(),
      icon: FileText,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Pending",
      value: stats.pending.toString(),
      icon: Clock,
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      label: "Paid",
      value: stats.paid.toString(),
      icon: CheckCircle,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ]

  const revenueData = [
    { month: "Jan", revenue: 0 },
    { month: "Feb", revenue: 0 },
    { month: "Mar", revenue: 0 },
    { month: "Apr", revenue: 0 },
    { month: "May", revenue: 0 },
    { month: "Jun", revenue: 0 },
  ]

  const statusData = [
    { name: "Draft", value: recentInvoices.filter((inv) => inv.status === "draft").length, color: "#e5e7eb" },
    { name: "Sent", value: recentInvoices.filter((inv) => inv.status === "sent").length, color: "#fbbf24" },
    { name: "Paid", value: recentInvoices.filter((inv) => inv.status === "paid").length, color: "#10b981" },
    { name: "Cancelled", value: recentInvoices.filter((inv) => inv.status === "cancelled").length, color: "#ef4444" },
  ]

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

  return (
    <LayoutWrapper>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your invoice overview.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/invoices/new">
            <Button className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold gap-2">
              <Plus className="w-5 h-5" />
              Create Invoice
            </Button>
          </Link>
          <Link href="/clients">
            <Button variant="outline" className="w-full h-20 text-base font-semibold gap-2 bg-transparent">
              <Plus className="w-5 h-5" />
              Add Client
            </Button>
          </Link>
          <Link href="/items">
            <Button variant="outline" className="w-full h-20 text-base font-semibold gap-2 bg-transparent">
              <Plus className="w-5 h-5" />
              Add Item
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold font-serif text-foreground">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-serif">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="font-serif">Recent Invoices</CardTitle>
            <Link href="/invoices">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : recentInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                        No invoices found
                      </td>
                    </tr>
                  ) : (
                    recentInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                            {invoice.invoiceNo}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {typeof invoice.client === 'object' ? invoice.client.name : invoice.client}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">
                          ₹{invoice.totalAmount?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))
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
