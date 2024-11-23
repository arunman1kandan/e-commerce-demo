"use client"

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false); // Typing indicator state
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");
    setLoading(true);
    setTyping(true);

    try {
      const response = await axios.post("/api/chat", { prompt: input });
      const aiResponse = response.data.response;

      setMessages((prev) => [...prev, { sender: "AI", text: aiResponse }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-center h-16 bg-white border-b shadow-md">
        <h1 className="text-lg font-bold">Chat with AI</h1>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            } mb-4`}
          >
            {/* Avatar */}
            {message.sender === "AI" && (
              <img
                src="/ai-avatar.png" // Replace with a suitable AI avatar image
                alt="AI Avatar"
                className="w-10 h-10 rounded-full mr-3"
              />
            )}
            {message.sender === "user" && (
              <img
                src="/user-avatar.png" // Replace with a suitable user avatar image
                alt="User Avatar"
                className="w-10 h-10 rounded-full ml-3"
              />
            )}
            {/* Message Bubble */}
            <div
              className={`rounded-lg px-4 py-2 w-full ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              <ReactMarkdown
                children={message.text}
                remarkPlugins={[remarkGfm]} // Enable GitHub Flavored Markdown
                className="markdown-content"
              />
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {typing && (
          <div className="flex items-center mb-4">
            <img
              src="/ai-avatar.png"
              alt="AI Typing"
              className="w-10 h-10 rounded-full mr-3"
            />
            <div className="px-4 py-2 bg-gray-300 rounded-lg max-w-md">
              <span className="animate-pulse">AI is typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input Box */}
      <div className="bg-white border-t shadow-md p-4">
        <div className="flex items-center">
          <input
            type="text"
            className="flex-1 p-2 border rounded-lg mr-2 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            className={`px-4 py-2 rounded-lg text-white ${
              loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={handleSendMessage}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
