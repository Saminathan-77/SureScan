import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Paperclip, Mic, Info } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your medical assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponses = [
        "Based on your symptoms, it could be a common migraine. I recommend rest in a dark, quiet room and staying hydrated.",
        "Brain tumors can present with various symptoms including headaches, seizures, and cognitive changes. It's important to consult with a neurologist for proper evaluation.",
        "MRI scans are one of the best tools for detecting brain abnormalities. They use magnetic fields and radio waves to create detailed images of the brain.",
        "If you're experiencing persistent headaches, it's important to track their frequency, duration, and any triggers you notice.",
        "Treatment options for brain tumors depend on the type, size, and location. They may include surgery, radiation therapy, or chemotherapy.",
        "I understand this can be concerning. Would you like me to provide more information about what to expect during a neurological examination?",
        "Regular follow-up scans are important to monitor any changes. Your doctor will recommend an appropriate schedule based on your specific situation."
      ];

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage: Message = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Medical Assistant
        </h1>
        <p className="text-gray-400">
          Ask questions about symptoms, conditions, or get information about brain health
        </p>
      </div>

      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                        : 'bg-zinc-800 text-white'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        message.sender === 'user' 
                          ? 'bg-blue-700' 
                          : 'bg-purple-700'
                      }`}>
                        {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div>
                        <div className="font-medium">
                          {message.sender === 'user' ? 'You' : 'Medical Assistant'}
                        </div>
                        <div className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center bg-zinc-800 rounded-xl p-2">
              <button className="p-2 text-gray-400 hover:text-white">
                <Paperclip size={20} />
              </button>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your medical question..."
                className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 text-white placeholder-gray-500 px-2"
                rows={1}
              />
              <button className="p-2 text-gray-400 hover:text-white">
                <Mic size={20} />
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={inputText.trim() === ''}
                className={`p-2 rounded-lg ${
                  inputText.trim() === '' 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="hidden lg:block w-64 ml-6 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-4">
          <h3 className="font-semibold mb-4 flex items-center">
            <Info size={16} className="mr-2 text-blue-400" />
            Helpful Tips
          </h3>
          <div className="space-y-4 text-sm text-gray-400">
            <div>
              <p className="font-medium text-gray-300 mb-1">Be Specific</p>
              <p>Describe your symptoms in detail including duration and severity.</p>
            </div>
            <div>
              <p className="font-medium text-gray-300 mb-1">Medical History</p>
              <p>Mention relevant medical history or conditions for more accurate information.</p>
            </div>
            <div>
              <p className="font-medium text-gray-300 mb-1">Emergency</p>
              <p>For medical emergencies, please call emergency services immediately.</p>
            </div>
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-xs text-gray-500">
                This AI assistant provides general information only and is not a substitute for professional medical advice, diagnosis, or treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;