'use client';

import { useState, useRef, useEffect } from 'react';
import { queryAIAssistant, getAIAssistantStatus } from '@/app/actions/ai';
import type { Language } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatInterfaceProps {
  telegramId: string;
  language?: Language;
}

export function AIChatInterface({
  telegramId,
  language = 'en'
}: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAIStatus();
    // Add welcome message
    addWelcomeMessage();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAIStatus = async () => {
    const result = await getAIAssistantStatus(telegramId);
    if (result.success && result.data) {
      setIsAvailable(result.data.available);
      if (!result.data.available) {
        setError(result.data.message);
      }
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessages = {
      en: "Hello! I'm your AI shopping assistant. Ask me anything about our products, prices, or shops!",
      am: "ሰላም! እኔ የእርስዎ AI የግዢ ረዳት ነኝ። ስለ ምርቶቻችን፣ ዋጋዎች ወይም ሱቆች ማንኛውንም ነገር ይጠይቁኝ!",
      om: "Nagaa! Ani gargaaraa bittaa AI kee ti. Waa'ee oomisha keenya, gatii, ykn suuqota waan kamiyyuu na gaafadhu!"
    };

    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: welcomeMessages[language],
        timestamp: new Date()
      }
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading || !isAvailable) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await queryAIAssistant(telegramId, userMessage.content);

      if (result.success && result.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data.answer,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setError(result.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Error querying AI:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAvailable) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-medium mb-2">
          AI Assistant Unavailable
        </p>
        <p className="text-sm text-yellow-700">
          {error || 'The AI assistant is currently not configured.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold">AI Shopping Assistant</h3>
        <p className="text-xs opacity-90">
          Ask me about products, prices, and availability
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user'
                    ? 'text-blue-100'
                    : 'text-gray-500'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"
      >
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'am'
                ? 'ጥያቄዎን እዚህ ይጻፉ...'
                : language === 'om'
                ? 'Gaaffii kee asitti barreessi...'
                : 'Type your question here...'
            }
            disabled={isLoading}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px]"
          >
            {isLoading ? (
              <span className="inline-block animate-spin">⟳</span>
            ) : (
              '→'
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {language === 'am'
            ? 'በአማርኛ፣ በአፋን ኦሮሞ ወይም በእንግሊዝኛ ይጠይቁ'
            : language === 'om'
            ? 'Afaan Amaaraa, Afaan Oromoo ykn Ingiliffaan gaafadhu'
            : 'Ask in Amharic, Afaan Oromo, or English'}
        </p>
      </form>
    </div>
  );
}
