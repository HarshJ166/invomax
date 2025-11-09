"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import api from "@/lib/api"

interface Client {
  id: string
  name: string
  gstin?: string
  billingAddress?: string
  shippingAddress?: string
  state?: string
  createdAt: string
  updatedAt: string
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    gstin: "",
    billingAddress: "",
    shippingAddress: "",
    state: "",
  })
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await api.get("/clients")
      setClients(response.data || [])
    } catch (error) {
      console.error("Failed to fetch clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData)
      } else {
        await api.post("/clients", formData)
      }
      setIsDialogOpen(false)
      setFormData({ name: "", gstin: "", billingAddress: "", shippingAddress: "", state: "" })
      setEditingClient(null)
      fetchClients()
    } catch (error) {
      console.error("Failed to save client:", error)
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      gstin: client.gstin || "",
      billingAddress: client.billingAddress || "",
      shippingAddress: client.shippingAddress || "",
      state: client.state || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return
    try {
      await api.delete(`/clients/${clientId}`)
      fetchClients()
    } catch (error) {
      console.error("Failed to delete client:", error)
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.gstin && client.gstin.includes(searchTerm)),
  )

  return (
    <LayoutWrapper>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Clients</h1>
            <p className="text-muted-foreground">Manage your client information</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-serif">
                  {editingClient ? "Edit Client" : "Add New Client"}
                </DialogTitle>
                <DialogDescription>
                  {editingClient ? "Update client details" : "Fill in the details for your new client"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    placeholder="Client Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    placeholder="GSTIN"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing">Billing Address</Label>
                  <Textarea
                    id="billing"
                    placeholder="Enter billing address"
                    rows={3}
                    value={formData.billingAddress}
                    onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping">Shipping Address</Label>
                  <Textarea
                    id="shipping"
                    placeholder="Enter shipping address"
                    rows={3}
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setFormData({ name: "", gstin: "", billingAddress: "", shippingAddress: "", state: "" })
                      setEditingClient(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {editingClient ? "Update Client" : "Add Client"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search client name or GSTIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">GSTIN</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Billing Address</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">State</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Updated</th>
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
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                        No clients found
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => (
                      <tr key={client.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">{client.name}</td>
                        <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                          {client.gstin || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {client.billingAddress || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{client.state || "-"}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(client.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:bg-primary/10"
                              onClick={() => handleEdit(client)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(client.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
