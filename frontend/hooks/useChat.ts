"use client"

import { useState } from "react"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

const mockResponses = [
  "Based on your location and soil conditions, I'd recommend considering crops like tomatoes, peppers, and leafy greens. These tend to perform well in most climates and have good market demand.",

  "For organic pest control, try companion planting with marigolds and basil. Neem oil spray is also effective against many common pests while being safe for beneficial insects.",

  "Healthy soil is the foundation of successful farming! I recommend regular soil testing, adding organic compost, and practicing crop rotation to maintain soil fertility naturally.",

  "Drip irrigation systems are highly efficient for water conservation. They deliver water directly to plant roots, reducing waste and preventing fungal diseases caused by wet foliage.",

  "Harvest timing depends on the specific crop, but generally, morning hours after dew has dried are ideal. Look for visual cues like color changes and firmness for optimal ripeness.",

  "That's an interesting question about agriculture! Let me help you with some practical advice based on current farming best practices and sustainable agriculture principles.",

  "For fertilizer recommendations, I'd suggest starting with a soil test to determine nutrient needs. Organic options like compost and well-aged manure are excellent for long-term soil health.",

  "Weather patterns significantly impact crop planning. Consider using weather forecasting tools and selecting varieties suited to your local climate conditions for better yields.",
]

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content.trim() }),
      })
      if (!res.ok) throw new Error("Gagal menghubungi backend")
      const data = await res.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "[Tidak ada respons dari backend]",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: err.message || "Terjadi kesalahan saat menghubungi backend.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
  }
}
