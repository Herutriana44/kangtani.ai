import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "kangtani.ai - Agricultural Assistant",
  description: "AI-powered agricultural assistant for modern farming solutions",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
          <Navigation />
          <main className="flex-1">{children}</main>
          <footer className="py-4 text-center border-t border-green-100 bg-white/50">
            <p className="text-gray-400 text-sm">Powered by Gemma 3n</p>
          </footer>
        </div>
      </body>
    </html>
  )
}
