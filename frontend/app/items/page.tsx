"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

interface Item {
  id: string
  name: string
  hsnCode?: string
  unit: string
  basePrice: number
  taxRate: number
  createdAt: string
  updatedAt: string
}

export default function ItemsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    hsnCode: "",
    unit: "",
    basePrice: "",
    taxRate: "",
  })
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await api.get("/items")
      setItems(response.data || [])
    } catch (error) {
      console.error("Failed to fetch items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        name: formData.name,
        hsnCode: formData.hsnCode || undefined,
        unit: formData.unit,
        basePrice: parseFloat(formData.basePrice),
        taxRate: parseFloat(formData.taxRate),
      }
      if (editingItem) {
        await api.put(`/items/${editingItem.id}`, payload)
      } else {
        await api.post("/items", payload)
      }
      setIsDialogOpen(false)
      setFormData({ name: "", hsnCode: "", unit: "", basePrice: "", taxRate: "" })
      setEditingItem(null)
      fetchItems()
    } catch (error) {
      console.error("Failed to save item:", error)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      hsnCode: item.hsnCode || "",
      unit: item.unit,
      basePrice: item.basePrice.toString(),
      taxRate: item.taxRate.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    try {
      await api.delete(`/items/${itemId}`)
      fetchItems()
    } catch (error) {
      console.error("Failed to delete item:", error)
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.hsnCode && item.hsnCode.includes(searchTerm)),
  )

  return (
    <LayoutWrapper>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Items</h1>
            <p className="text-muted-foreground">Manage your inventory items and services</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">
                  {editingItem ? "Edit Item" : "Add New Item"}
                </DialogTitle>
                <DialogDescription>
                  {editingItem ? "Update item details" : "Create a new item for your invoices"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    placeholder="Item Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hsnCode">HSN Code</Label>
                  <Input
                    id="hsnCode"
                    placeholder="HSN Code"
                    value={formData.hsnCode}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    placeholder="e.g., kg, pcs, m"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    placeholder="18"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setFormData({ name: "", hsnCode: "", unit: "", basePrice: "", taxRate: "" })
                      setEditingItem(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {editingItem ? "Update Item" : "Add Item"}
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
                placeholder="Search item name or HSN code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">HSN Code</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Base Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Tax Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                        No items found
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">{item.name}</td>
                        <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                          {item.hsnCode || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{item.unit}</td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          ₹{item.basePrice.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{item.taxRate}%</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:bg-primary/10"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(item.id)}
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
