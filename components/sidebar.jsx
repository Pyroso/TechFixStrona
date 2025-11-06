"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { X, LayoutGrid, MapPin, ClipboardList, CheckSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar({ isOpen, onToggle }) {
  const pathname = usePathname()
  const { isWorker, isTechnician } = useAuth()

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutGrid },
    { label: "Map View", href: "/map", icon: MapPin },
    { label: "All Reports", href: "/reports", icon: ClipboardList },
    ...(isWorker ? [{ label: "New Report", href: "/reports/new", icon: Plus }] : []),
    ...(isTechnician ? [{ label: "My Tasks", href: "/tasks", icon: CheckSquare }] : []),
  ]

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={() => onToggle(false)} />}

      <aside
        className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-50 lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0 w-64" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-lg">F</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-sidebar-foreground">FactoryFlow</h1>
              <p className="text-xs text-sidebar-accent-foreground">Error Reporting</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onToggle(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  onClick={() => onToggle(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar-accent/50">
          <p className="text-xs text-sidebar-foreground/70">v1.0 • Factory Monitoring System</p>
        </div>
      </aside>
    </>
  )
}
