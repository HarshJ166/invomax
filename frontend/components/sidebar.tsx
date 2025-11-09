"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Users, Package, Settings, LogOut } from "lucide-react"
import { authStorage } from "@/lib/auth"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = authStorage.getUser()

  const handleLogout = () => {
    authStorage.clearAuth()
    router.push("/login")
  }

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname?.startsWith(path)
  }

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/invoices",
      label: "Invoices",
      icon: FileText,
    },
    {
      href: "/clients",
      label: "Clients",
      icon: Users,
    },
    {
      href: "/items",
      label: "Items",
      icon: Package,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
          <span className="text-sidebar-primary-foreground font-serif font-bold">i</span>
        </div>
        <div>
          <h1 className="font-serif font-bold text-lg text-sidebar-foreground">invoMax</h1>
          <p className="text-xs text-sidebar-foreground/60">Invoice Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={active ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="px-2 py-3 rounded border border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 font-medium">Logged in as</p>
          <p className="text-sm font-medium truncate text-sidebar-foreground">{user?.email || "Loading..."}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent/20 text-red-400 hover:text-red-300"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  )
}
