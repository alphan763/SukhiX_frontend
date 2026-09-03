import React, { useState } from 'react';
import { sendChatMessage, HealthDataPayload } from '../services/api';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

interface ChatProps {
  currentHealthData?: HealthDataPayload;
}

export const AIChat: React.FC<ChatProps> = ({ currentHealthData }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'assistant', text: 'Hello! How can I assist you with your health and wellness today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const data = await sendChatMessage({
        message: userMessage,
        health_context: currentHealthData,
      });

      setMessages(prev => [...prev, { sender: 'assistant', text: data.response }]);
    } catch (err: any) {
      setError(err.message || 'Unable to get a response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg max-w-[80%] text-sm ${
              m.sender === 'user'
                ? 'ml-auto bg-blue-600 text-white rounded-br-none'
                : 'mr-auto bg-gray-100 text-gray-800 rounded-bl-none'
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="text-xs text-gray-400 italic">AI is thinking...</div>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-500 my-2 px-1">{error}</div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a health or lifestyle question..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};