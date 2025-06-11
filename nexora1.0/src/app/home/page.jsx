"use client";
import React, { useState } from 'react';

const ChatUI = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      const botMessage = { text: data.reply, sender: "bot" };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Error reaching server.", sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl flex flex-col h-[85vh] overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-black px-4 py-3 text-lg font-bold text-center">
          Nexora Campus Copilot
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.sender === "user" ? "bg-blue-100 self-end" : "bg-gray-200 self-start"
              }`}
            >
              <p className="text-black">{msg.text}</p>
            </div>
          ))}
          {loading && <div className="text-sm text-gray-500">Bot is typing...</div>}
        </div>

        {/* Input Area */}
        <div className="border-t p-3 bg-gray-50">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask something..."
              className="flex-1 border rounded-lg px-3 py-2 text-black focus:outline-none focus:ring focus:ring-blue-300"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-black px-4 py-2 rounded-lg text-sm"
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatUI;
