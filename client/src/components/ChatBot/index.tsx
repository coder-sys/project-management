"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageCircle, X, AlertCircle } from 'lucide-react';
import { generateChatResponse } from '@/lib/chatUtils';

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

interface ChatBotProps {
  isWidget?: boolean;
}

export default function ChatBot({ isWidget = true }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Hello! I can help you with your projects and tasks. Ask me anything!'
  }]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(!isWidget); // Open by default if not a widget
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateChatResponse(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'error', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }
  const chatBoxContent = (
    <div className={`${isWidget ? 'fixed bottom-4 right-4 w-96 h-[500px]' : 'w-full h-full'} bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col`}>
      <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Project Assistant</h3>
        {isWidget && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.role === 'error'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                  : 'bg-gray-100 dark:bg-gray-700 dark:text-white'
              }`}
            >
              {message.role === 'error' && (
                <AlertCircle className="h-4 w-4 mb-1 inline-block mr-1" />
              )}
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} /> {/* Add this line for auto-scrolling */}
      </div>
      <form onSubmit={handleSubmit} className="p-3 border-t dark:border-gray-700">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Ask about your projects..."
            className="flex-1 resize-none rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            rows={1}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-lg bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
