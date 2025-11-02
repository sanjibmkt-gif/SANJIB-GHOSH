
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Message } from './types';
import { sendMessageToGemini, initializeChat } from './services/geminiService';
import type { Chat } from '@google/genai';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Hello! I can help you draft the perfect auto-reply. Just tell me who contacted you and why.\n\nFor example, you could say:\n- \"My boss called me, but I'm on vacation.\"\n- \"A friend sent a WhatsApp message asking to borrow money.\"\n- \"I missed a call from an unknown number while I was in a meeting.\"",
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = initializeChat();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', text: userInput };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        throw new Error('Chat not initialized');
      }
      const botResponse = await sendMessageToGemini(chatRef.current, userInput);
      const newBotMessage: Message = { role: 'model', text: botResponse };
      setMessages(prevMessages => [...prevMessages, newBotMessage]);
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      const errorMessage: Message = {
        role: 'model',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <header className="bg-gray-800 shadow-md p-4">
        <h1 className="text-xl font-bold text-center text-blue-400">Auto-Reply Assistant</h1>
        <p className="text-center text-sm text-gray-400 mt-1">Powered by Gemini</p>
      </header>
      
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start items-center space-x-3">
            <div className="p-3 rounded-full bg-gray-700 flex items-center justify-center w-12 h-12">
                <LoadingSpinner />
            </div>
            <div className="bg-gray-700 rounded-2xl p-4 max-w-lg">
                <p className="text-gray-400 italic">Thinking...</p>
            </div>
          </div>
        )}
      </main>

      <footer className="p-4 bg-gray-900/80 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default App;