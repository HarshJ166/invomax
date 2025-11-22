"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Package,
  Receipt,
  Trash2,
  CreditCard,
  FileCheck,
  ShoppingCart,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Invoices",
    href: "/invoice-list",
    icon: Receipt,
  },
  {
    title: "Create Invoice",
    href: "/invoice",
    icon: FileText,
  },
  {
    title: "Create Quotation",
    href: "/quotation",
    icon: FileCheck,
  },
  {
    title: "Purchase Entry",
    href: "/purchase-entry",
    icon: ShoppingCart,
  },
  {
    title: "Clients",
    href: "/client",
    icon: Users,
  },
  {
    title: "Companies",
    href: "/companies",
    icon: Building2,
  },
  {
    title: "Items",
    href: "/items",
    icon: Package,
  },
  {
    title: "Dealer Payment",
    href: "/dealer-payment",
    icon: CreditCard,
  },
  {
    title: "Recycle Bin",
    href: "/recycle-bin",
    icon: Trash2,
  },
];

function AppSidebarContent() {
  const pathname = usePathname();

  const isActiveRoute = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Receipt className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Invoice Generator</span>
            <span className="text-xs text-muted-foreground">
              Business Suite
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "transition-all duration-200",
                        isActive &&
                          "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      )}
                    >
                      <Link href={item.href}>
                        <Icon
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isActive && "scale-110"
                          )}
                        />
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2 text-xs text-muted-foreground">
          <p className="font-medium">Keyboard Shortcut</p>
          <p className="mt-1">Press Cmd/Ctrl + B to toggle</p>
        </div>
      </SidebarFooter> */}
    </Sidebar>
  );
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebarContent />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border bg-background px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
