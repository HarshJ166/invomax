"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 w-full min-h-screen bg-background">
        {children}
        <Toaster />
      </main>
    </div>
  )
}
