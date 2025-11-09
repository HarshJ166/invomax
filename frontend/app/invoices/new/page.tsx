"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function CreateInvoicePage() {
  const [items, setItems] = useState([{ id: 1, name: "", hsnCode: "", quantity: 1, rate: 0, taxRate: 18 }])

  const clients = [
    { id: 1, name: "Tech Corp" },
    { id: 2, name: "Design Co" },
    { id: 3, name: "Startup Inc" },
  ]

  const availableItems = [
    { id: 1, name: "Web Development", hsnCode: "62011906", basePrice: 5000 },
    { id: 2, name: "UI Design", hsnCode: "62011906", basePrice: 3000 },
    { id: 3, name: "Consulting", hsnCode: "62011906", basePrice: 2000 },
  ]

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: "", hsnCode: "", quantity: 1, rate: 0, taxRate: 18 }])
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const amount = item.quantity * item.rate
      const tax = (amount * item.taxRate) / 100
      return sum + amount + tax
    }, 0)
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  }

  const calculateTax = () => {
    return items.reduce((sum, item) => {
      const amount = item.quantity * item.rate
      return sum + (amount * item.taxRate) / 100
    }, 0)
  }

  return (
    <LayoutWrapper>
      <div className="p-8">
        <div className="mb-8">
          <Link href="/invoices">
            <Button variant="ghost" className="mb-4">
              ← Back to Invoices
            </Button>
          </Link>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Create Invoice</h1>
          <p className="text-muted-foreground">Generate a new invoice for your client</p>
        </div>

        <form className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="font-serif">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Invoice Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceNo">Invoice Number</Label>
                  <Input value="INV-001" readOnly className="bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="font-serif">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>eWay Bill No.</Label>
                  <Input placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Note</Label>
                  <Input placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Mode/Terms of Payment</Label>
                  <Input placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Supplier Ref</Label>
                  <Input placeholder="Optional" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <CardTitle className="font-serif">Invoice Items</CardTitle>
              <Button type="button" onClick={addItem} size="sm" variant="outline" gap="gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                    <div className="space-y-2">
                      <Label className="text-xs">Item</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableItems.map((availItem) => (
                            <SelectItem key={availItem.id} value={availItem.id.toString()}>
                              {availItem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">HSN Code</Label>
                      <Input value={item.hsnCode} readOnly className="bg-muted text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].quantity = Number.parseInt(e.target.value) || 1
                          setItems(newItems)
                        }}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Rate</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].rate = Number.parseFloat(e.target.value) || 0
                          setItems(newItems)
                        }}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Tax %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.taxRate}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].taxRate = Number.parseFloat(e.target.value) || 0
                          setItems(newItems)
                        }}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Amount</Label>
                      <div className="px-3 py-2 border rounded-md bg-muted text-xs font-medium">
                        ₹{(item.quantity * item.rate).toFixed(2)}
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax:</span>
                      <span className="font-semibold">₹{calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-serif font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="font-serif">Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea placeholder="Add any notes or special instructions..." rows={4} />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Link href="/invoices">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Create Invoice</Button>
          </div>
        </form>
      </div>
    </LayoutWrapper>
  )
}
