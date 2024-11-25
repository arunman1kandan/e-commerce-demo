"use client"

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, loading]);

  const simulateStreaming = async (text: string) => {
    const words = text.split(" ");
    setStreamingText("");
    
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setStreamingText((prev) => prev + (i === 0 ? "" : " ") + words[i]);
    }
    
    setMessages((prev) => [...prev, { sender: "AI", text }]);
    setStreamingText("");
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("/api/chat", { prompt: input });
      const aiResponse = response.data.response;
      await simulateStreaming(aiResponse);
    } catch (error) {
      console.error("Error sending message:", error);
      await simulateStreaming("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-center p-4 h-16 bg-white border-b shadow-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-3 hover:bg-slate-100 transition-colors" 
          onClick={() => window.location.href = "/"}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-600" />
          <h1 className="text-lg font-semibold text-slate-800">Chat with AI</h1>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              } items-start space-x-3 animate-fadeIn`}
            >
              {message.sender === "AI" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-semibold">AI</span>
                  </div>
                </div>
              )}
              
              <div className={`group relative max-w-[80%] ${
                message.sender === "user" ? "order-1" : "order-2"
              }`}>
                <Card className={`px-4 py-3 shadow-sm ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}>
                  <ReactMarkdown
                    children={message.text}
                    remarkPlugins={[remarkGfm]}
                    className={`markdown-content prose ${
                      message.sender === "user" ? "prose-invert" : ""
                    } max-w-none`}
                  />
                </Card>
                <div className={`absolute -bottom-5 ${
                  message.sender === "user" ? "right-0" : "left-0"
                } text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {message.sender === "user" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <span className="text-slate-600 text-sm font-semibold">You</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Thinking Animation */}
          {loading && !streamingText && (
            <div className="flex justify-start items-start space-x-3 animate-fadeIn">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">AI</span>
                </div>
              </div>
              <Card className="px-6 py-4 shadow-sm bg-white inline-block">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                </div>
              </Card>
            </div>
          )}

          {/* Streaming Message */}
          {streamingText && (
            <div className="flex justify-start items-start space-x-3 animate-fadeIn">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">AI</span>
                </div>
              </div>
              <Card className="px-4 py-3 shadow-sm bg-white max-w-[80%]">
                <ReactMarkdown
                  children={streamingText}
                  remarkPlugins={[remarkGfm]}
                  className="markdown-content prose max-w-none"
                />
                <div className="inline-block ml-1 w-1 h-4 bg-blue-600 animate-blink"></div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Box */}
      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              className="flex-1 px-4 py-3 pr-20 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              disabled={loading}
            />
            <Button
              className="absolute right-2 px-3 py-2 h-10"
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-slate-400">Press Enter to send</p>
          </div>
        </div>
      </div>
    </div>
  );
}