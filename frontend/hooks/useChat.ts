"use client"

import { useState, useCallback } from "react"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  metadata?: {
    requestId?: string
    processingTime?: number
    error?: string
    backendUrl?: string
  }
}

// Debug configuration
const DEBUG_MODE = process.env.NODE_ENV === 'development' || true // Always enable for debugging
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

// Debug logger
const debugLog = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    console.log(`[Kangtani Debug] ${message}`, data || '')
  }
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
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown')
  const [lastError, setLastError] = useState<string | null>(null)

  // Test backend connection
  const testConnection = useCallback(async () => {
    debugLog('Testing backend connection...')
    try {
      const startTime = Date.now()
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(5000)
      })
      const endTime = Date.now()
      const responseTime = endTime - startTime

      debugLog(`Backend health check response time: ${responseTime}ms`)
      debugLog(`Backend health check status: ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        debugLog('Backend health check successful:', data)
        setConnectionStatus('connected')
        setLastError(null)
        return { success: true, data, responseTime }
      } else {
        const errorText = await response.text()
        debugLog('Backend health check failed:', { status: response.status, error: errorText })
        setConnectionStatus('disconnected')
        setLastError(`Backend health check failed: ${response.status} - ${errorText}`)
        return { success: false, error: errorText, status: response.status }
      }
    } catch (error: any) {
      debugLog('Backend connection test error:', error)
      setConnectionStatus('disconnected')
      const errorMessage = error.name === 'AbortError' ? 'Connection timeout' : error.message
      setLastError(`Connection failed: ${errorMessage}`)
      return { success: false, error: errorMessage }
    }
  }, [])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    debugLog('Sending message:', content)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      metadata: {
        backendUrl: BACKEND_URL
      }
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setLastError(null)

    try {
      debugLog('Preparing fetch request to:', `${BACKEND_URL}/chat`)

      const requestBody = { message: content.trim() }
      debugLog('Request body:', requestBody)

      const startTime = Date.now()

      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Timestamp": new Date().toISOString(),
          "X-Client-Version": "1.0.0"
        },
        body: JSON.stringify(requestBody),
        // Add timeout
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })

      const endTime = Date.now()
      const responseTime = endTime - startTime

      debugLog(`Response received in ${responseTime}ms`)
      debugLog('Response status:', res.status)
      debugLog('Response headers:', Object.fromEntries(res.headers.entries()))

      if (!res.ok) {
        const errorText = await res.text()
        debugLog('Response error:', { status: res.status, error: errorText })
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }

      const data = await res.json()
      debugLog('Response data:', data)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "[Tidak ada respons dari backend]",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        metadata: {
          requestId: data.request_id,
          processingTime: data.processing_time,
          backendUrl: BACKEND_URL
        }
      }

      setMessages((prev) => [...prev, assistantMessage])
      setConnectionStatus('connected')

      debugLog('Message sent successfully')

    } catch (err: any) {
      debugLog('Error sending message:', err)

      const errorMessage = err.name === 'AbortError'
        ? 'Request timeout - backend tidak merespons dalam 30 detik'
        : err.message || "Terjadi kesalahan saat menghubungi backend."

      setLastError(errorMessage)
      setConnectionStatus('disconnected')

      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `❌ Error: ${errorMessage}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        metadata: {
          error: errorMessage,
          backendUrl: BACKEND_URL
        }
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Log detailed error information
      console.error('[Kangtani Error] Failed to send message:', {
        error: err,
        message: content,
        backendUrl: BACKEND_URL,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        online: navigator.onLine
      })

    } finally {
      setIsLoading(false)
    }
  }

  // Enhanced error handling with retry logic
  const sendMessageWithRetry = async (content: string, maxRetries: number = 2) => {
    debugLog(`Sending message with retry (max: ${maxRetries})`)

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await sendMessage(content)
        return // Success, exit retry loop
      } catch (error: any) {
        debugLog(`Attempt ${attempt} failed:`, error)

        if (attempt === maxRetries) {
          // Final attempt failed, show error
          const errorMessage = `Gagal setelah ${maxRetries} percobaan: ${error.message}`
          setLastError(errorMessage)

          const assistantMessage: Message = {
            id: (Date.now() + 3).toString(),
            role: "assistant",
            content: `❌ ${errorMessage}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            metadata: {
              error: errorMessage,
              backendUrl: BACKEND_URL,
              attempts: maxRetries
            }
          }

          setMessages((prev) => [...prev, assistantMessage])
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }
  }

  return {
    messages,
    input,
    setInput,
    sendMessage,
    sendMessageWithRetry,
    isLoading,
    connectionStatus,
    lastError,
    testConnection,
    backendUrl: BACKEND_URL,
    debugMode: DEBUG_MODE
  }
}
