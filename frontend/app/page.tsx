"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Mic, Upload, Leaf, Wifi, WifiOff, AlertCircle, Settings, X } from "lucide-react"
import { useChat } from "@/hooks/useChat"

export default function ChatbotPage() {
  const {
    messages,
    input,
    setInput,
    sendMessage,
    sendMessageWithRetry,
    isLoading,
    connectionStatus,
    lastError,
    testConnection,
    backendUrl,
    debugMode
  } = useChat()

  const [isRecording, setIsRecording] = useState(false)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Test connection on component mount
  useEffect(() => {
    testConnection()
  }, [testConnection])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      sendMessage(`[File uploaded: ${file.name}]`)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false)
        sendMessage("What's the best fertilizer for tomatoes?")
      }, 2000)
    }
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-500" />
      default:
        return <Wifi className="h-4 w-4 text-gray-400" />
    }
  }

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Backend Connected'
      case 'disconnected':
        return 'Backend Disconnected'
      default:
        return 'Checking Connection...'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Debug Information</h3>
            <button
              onClick={() => setShowDebugPanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Backend URL:</strong> {backendUrl}</p>
              <p><strong>Debug Mode:</strong> {debugMode ? 'Enabled' : 'Disabled'}</p>
              <p><strong>Connection Status:</strong>
                <span className={`ml-2 inline-flex items-center ${connectionStatus === 'connected' ? 'text-green-600' : connectionStatus === 'disconnected' ? 'text-red-600' : 'text-gray-600'}`}>
                  {getConnectionIcon()}
                  <span className="ml-1">{getConnectionText()}</span>
                </span>
              </p>
            </div>

            <div>
              <button
                onClick={testConnection}
                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                Test Connection
              </button>

              {lastError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                  <strong>Last Error:</strong> {lastError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-white text-lg font-semibold">Agricultural Assistant</h1>
              <p className="text-green-100 text-sm">Ask me anything about farming, crops, and agriculture!</p>
            </div>

            {/* Connection Status & Debug Toggle */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-white text-xs">
                {getConnectionIcon()}
                <span className="ml-1 hidden sm:inline">{getConnectionText()}</span>
              </div>

              <button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="p-1 text-green-100 hover:text-white hover:bg-green-700 rounded"
                title="Toggle Debug Panel"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Leaf className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Welcome to kangtani.ai!</p>
              <p className="text-gray-400 text-sm mt-2">
                Start a conversation about agriculture, farming, or crop management.
              </p>

              {/* Show connection status if disconnected */}
              {connectionStatus === 'disconnected' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-700">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Backend tidak terhubung. Coba refresh halaman atau periksa koneksi.</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${message.role === "user"
                      ? "bg-green-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
                    }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === "user" ? "text-green-100" : "text-gray-400"}`}>
                    {message.timestamp}
                  </p>

                  {/* Show metadata for debugging */}
                  {debugMode && message.metadata && (
                    <div className="mt-2 text-xs opacity-75">
                      {message.metadata.requestId && (
                        <p>ID: {message.metadata.requestId}</p>
                      )}
                      {message.metadata.processingTime && (
                        <p>Time: {message.metadata.processingTime.toFixed(2)}s</p>
                      )}
                      {message.metadata.error && (
                        <p className="text-red-500">Error: {message.metadata.error}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100 px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 p-4 bg-white">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleFileUpload}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
              title="Upload file"
            >
              <Upload className="h-5 w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />

            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 rounded-full transition-colors ${isRecording
                  ? "text-red-600 bg-red-50 animate-pulse"
                  : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                }`}
              title={isRecording ? "Recording..." : "Voice input"}
            >
              <Mic className="h-5 w-5" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about crops, farming techniques, pest control..."
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-white bg-green-600 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Connection warning */}
          {connectionStatus === 'disconnected' && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-xs">
              <div className="flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>Backend tidak terhubung. Pesan mungkin tidak terkirim.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm mb-3">Try asking about:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "Best crops for my region",
            "Organic pest control",
            "Soil health tips",
            "Irrigation systems",
            "Harvest timing",
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="px-3 py-1 text-sm bg-white text-green-700 border border-green-200 rounded-full hover:bg-green-50 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
