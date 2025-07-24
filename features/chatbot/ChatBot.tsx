'use client'

import { useState } from 'react'
import { Message, useChat } from 'ai/react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Send, X, MessageSquare, Loader2 } from 'lucide-react'
import BoatCard from './BoatCard'

// Utility function for class names
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface ChatBotProps {
  className?: string
  initialOpen?: boolean
}

// Type for boat data returned from the API
interface BoatResult {
  id: string
  name: string
  category: string
  lengthFt: number
  capacity: number
  features: string[]
  mainImage?: string
  price: number | string
  description?: string
}

export default function ChatBot({ className, initialOpen = false }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chatbot',
    maxSteps: 5
  })

  // Extract boat results from a single message
  const extractBoatsFromMessage = (message: Message) => {
    const boats: any[] = []
    
    if (message.role === 'assistant' && message.toolInvocations) {
      message.toolInvocations.forEach(invocation => {
        if (invocation.toolName === 'searchBoats' && 'result' in invocation && invocation.result) {
          const result = invocation.result as any
          if (result.boats && Array.isArray(result.boats)) {
            // Transform the boat data to match BoatCard expectations
            const transformedBoats = result.boats.map((boat: any) => ({
              ...boat,
              locationLabel: result.location || 'Location not specified',
              displayTitle: boat.name,
              minPrice: typeof boat.price === 'number' ? boat.price : null
            }))
            boats.push(...transformedBoats)
          }
        }
      })
    }
    
    return boats
  }

  // Extract boat results from all messages (for legacy compatibility)
  const extractBoatsFromMessages = () => {
    const boats: any[] = []
    
    messages.forEach(message => {
      boats.push(...extractBoatsFromMessage(message))
    })
    
    return boats
  }

  const boats = extractBoatsFromMessages()

  return (
    <>
      {/* Chat Toggle Button */}
              <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className={cn(
            "fixed bottom-6 right-6 z-50 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300",
            "bg-primary hover:bg-primary/90",
            "border-2 border-primary/20 backdrop-blur-sm",
            "w-16 h-16 p-0 group",
            className
          )}
          aria-label="Open chat assistant"
        >
          <MessageSquare 
            className="w-7 h-7 text-white transition-transform group-hover:scale-110" 
          />
        </Button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md h-[600px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-primary p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">KOS Yachts Assistant</h3>
                  <p className="text-primary-foreground/80 text-sm">Find your perfect boat charter</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full w-8 h-8 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

                        {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Hi! I'm here to help</p>
                  <p className="text-sm">Tell me where you'd like to charter a boat and I'll find perfect options for you.</p>
                </div>
              )}

                            {messages.map((message: Message, index: number) => {
                // Check if this message has boat results
                const messageBoats = extractBoatsFromMessage(message)
                const hasBoats = messageBoats.length > 0
                
                return (
                  <div key={`${message.id}-${index}`} className="space-y-3">
                    {/* AI Message */}
                    <div
                      className={cn(
                        "flex w-full",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                          message.role === 'user'
                            ? 'bg-primary text-white ml-4'
                            : 'bg-gray-100 text-gray-900 mr-4'
                        )}
                      >
                        {message.content}
                      </div>
                    </div>
                    
                                            {/* Boat Cards - Full Width Below Message */}
                        {hasBoats && (
                          <div className="w-full space-y-3">
                            {messageBoats.map((boat: any, boatIndex: number) => (
                              <BoatCard
                                key={`${boat.id}-${index}-${boatIndex}`}
                                boat={boat}
                              />
                            ))}
                          </div>
                        )}
                  </div>
                )
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-900 mr-4 flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Searching for boats...
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                                  <Input
                    value={input}
                    placeholder="Ask about boat charters..."
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="flex-1 rounded-full border-gray-300 focus:border-primary focus:ring-primary"
                  />
                                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading || !input.trim()}
                    className="rounded-full bg-primary hover:bg-primary/90 px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
} 