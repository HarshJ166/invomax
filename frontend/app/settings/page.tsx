"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Trash2 } from "lucide-react"
import api from "@/lib/api"
import { authStorage } from "@/lib/auth"

interface Company {
  id: string
  name: string
  gstin?: string
  address?: string
  email?: string
  state?: string
  logoUrl?: string
}

export default function SettingsPage() {
  const user = authStorage.getUser()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    gstin: "",
    address: "",
    email: "",
    state: "",
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchCompany()
  }, [])

  const fetchCompany = async () => {
    try {
      const response = await api.get("/companies/me")
      const companyData = response.data
      setCompany(companyData)
      setFormData({
        name: companyData.name || "",
        gstin: companyData.gstin || "",
        address: companyData.address || "",
        email: companyData.email || "",
        state: companyData.state || "",
      })
      setLogoUrl(companyData.logoUrl || null)
    } catch (error) {
      console.error("Failed to fetch company:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      if (formData.gstin) formDataToSend.append("gstin", formData.gstin)
      if (formData.address) formDataToSend.append("address", formData.address)
      if (formData.email) formDataToSend.append("email", formData.email)
      if (formData.state) formDataToSend.append("state", formData.state)
      if (logoFile) {
        formDataToSend.append("logo", logoFile)
      }

      await api.put("/companies/me", formDataToSend)
      await fetchCompany()
      alert("Settings saved successfully")
    } catch (error) {
      console.error("Failed to save settings:", error)
      alert("Failed to save settings")
    }
  }

  return (
    <LayoutWrapper>
      <div className="p-8 max-w-2xl">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account and company settings</p>

        {/* User Information */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="font-serif">User Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={user?.email || ""} readOnly className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">Your email cannot be changed</p>
            </div>
          </CardContent>
        </Card>

        {/* Company Logo */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="font-serif">Company Logo</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {logoUrl ? (
              <div className="relative w-32 h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={logoUrl.startsWith("data:") ? logoUrl : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${logoUrl}`}
                  alt="Logo"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No logo</p>
              </div>
            )}

            <div className="flex gap-2">
              <label htmlFor="logo-upload">
                <Button variant="outline" className="gap-2 bg-transparent cursor-pointer" asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </span>
                </Button>
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              {logoUrl && (
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10 gap-2 bg-transparent"
                  onClick={handleRemoveLogo}
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Recommended size: 200x200px. Formats: PNG, JPG. Max size: 2MB
            </p>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="font-serif">Company Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
