"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Send, Mic, Upload, Leaf } from "lucide-react"
import { useChat } from "@/hooks/useChat"

export default function ChatbotPage() {
  const { messages, input, setInput, sendMessage, isLoading } = useChat()
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Chat Panel */}
      <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <h1 className="text-white text-lg font-semibold">Agricultural Assistant</h1>
          <p className="text-green-100 text-sm">Ask me anything about farming, crops, and agriculture!</p>
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
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-green-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === "user" ? "text-green-100" : "text-gray-400"}`}>
                    {message.timestamp}
                  </p>
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
              className={`p-2 rounded-full transition-colors ${
                isRecording
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
