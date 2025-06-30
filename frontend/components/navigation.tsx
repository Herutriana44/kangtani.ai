"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Leaf, MessageSquare, BarChart3, User } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Chatbot",
      href: "/",
      icon: MessageSquare,
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
    },
    {
      name: "About",
      href: "/about",
      icon: User,
    },
  ]

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold text-green-800">kangtani.ai</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-green-100 text-green-800 border-2 border-green-200"
                      : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center p-2 rounded-lg text-xs transition-all duration-200 ${
                    isActive ? "bg-green-100 text-green-800" : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
