// @AI-IGNORE - Duplicate file. Use components/ChatBot.tsx instead.
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: "Hi! I'm your course guide. Ask me about any domain like AI, Music, Fitness, Data Science, and more!",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const videosByDomain: { [key: string]: string[] } = {
    'artificial intelligence': [
      'Machine Learning Fundamentals',
      'Neural Networks & Deep Learning',
      'TensorFlow & PyTorch Guide',
      'AI for Beginners'
    ],
    'data science': [
      'Python for Data Analysis',
      'Pandas & Data Manipulation',
      'Data Visualization Masterclass'
    ],
    'fitness': [
      'Full Body Workout at Home',
      'Yoga for Beginners',
      'Home Training Basics'
    ],
    'music': [
      'Guitar for Absolute Beginners',
      'Piano Fundamentals',
      'Music Theory Basics'
    ],
    'language learning': [
      'Spanish Basics',
      'English Grammar Essentials',
      'French Language Course'
    ],
    'meditation': [
      'Mindfulness Meditation',
      'Guided Deep Relaxation',
      'Stress Relief Techniques'
    ],
    'business': [
      'Business Management 101',
      'Marketing Strategy Guide',
      'Entrepreneurship Basics'
    ],
    'personal development': [
      'Goal Setting Masterclass',
      'Productivity & Time Management',
      'Personal Growth Fundamentals'
    ],
  };

  const domainAliases: { [key: string]: string } = {
    'ai': 'artificial intelligence',
    'ml': 'artificial intelligence',
    'machine learning': 'artificial intelligence',
    'ds': 'data science',
    'data': 'data science',
    'fit': 'fitness',
    'workout': 'fitness',
    'gym': 'fitness',
    'guitar': 'music',
    'piano': 'music',
    'lang': 'language learning',
    'language': 'language learning',
    'spanish': 'language learning',
    'french': 'language learning',
    'english': 'language learning',
    'meditate': 'meditation',
    'mindfulness': 'meditation',
    'relax': 'meditation',
    'biz': 'business',
    'marketing': 'business',
    'entrepreneurship': 'business',
    'personal': 'personal development',
    'development': 'personal development',
    'goal': 'personal development',
  };

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim();

    if (lowerMessage.match(/^(hi|hello|hey|greetings)/i)) {
      return "Hey there! Welcome to our course platform. What domain interests you? Try asking about AI, Music, Fitness, Business, or any other topic!";
    }

    if (lowerMessage.match(/help|guide|what|how/i)) {
      return "I can help you explore:\n* 8 different domains\n* Courses by duration & price\n* Video previews & instructors\n\nJust ask about any domain or click a domain box to get started!";
    }

    // Check domain aliases first
    let matchedDomain = null;
    for (const [alias, domain] of Object.entries(domainAliases)) {
      if (lowerMessage.includes(alias)) {
        matchedDomain = domain;
        break;
      }
    }

    // If no alias matched, check full domain names
    if (!matchedDomain) {
      for (const domain of Object.keys(videosByDomain)) {
        if (lowerMessage.includes(domain)) {
          matchedDomain = domain;
          break;
        }
      }
    }

    // If a domain was found, show courses
    if (matchedDomain && videosByDomain[matchedDomain]) {
      const videos = videosByDomain[matchedDomain];
      const videoList = videos.map((v, i) => `${i + 1}. ${v}`).join('\n');
      return `Great! Here are the courses in ${matchedDomain.toUpperCase()}:\n\n${videoList}\n\nEach course costs Rs 2/min after 2 min free preview. Click the ${matchedDomain} domain box to start!`;
    }

    if (lowerMessage.match(/price|cost|free|how much/i)) {
      return "Pricing:\n* First 2 minutes: FREE preview\n* After preview: Rs 2 per minute\n* Payment gate appears after free preview\n* Cancel anytime!\n\nCheck out any course - you'll get a free preview first!";
    }

    if (lowerMessage.match(/video|course|watch|play/i)) {
      return "Each domain has multiple video courses:\n* Click any domain box to explore\n* Preview for FREE (2 min)\n* Then pay Rs 2/min to continue\n* Embedded player with full controls\n\nWhich domain interests you?";
    }

    if (lowerMessage.match(/instructor|teacher|who teach/i)) {
      return "We have courses from:\n* Top universities (Stanford, MIT, UC Berkeley)\n* Expert instructors in each domain\n* Industry professionals\n* Certified educators\n\nEach course shows the instructor name and their student count!";
    }

    if (lowerMessage.match(/payment|pay|wallet|balance/i)) {
      return "Payment Process:\n* Add Rs 30 to your wallet (escrow hold)\n* First 2 min FREE\n* After: Rs 2/min auto-charged\n* Unused amount refunded\n* Secure & instant processing\n\nTrust us - we're transparent!";
    }

    if (lowerMessage.match(/popular|best|trending|recommend/i)) {
      return "Most Popular Courses:\n1. AI & Machine Learning\n2. Yoga & Fitness\n3. Guitar for Beginners\n4. Data Science with Python\n5. Business Marketing\n\nEach has 4.8+ ratings. Want to explore any?";
    }

    if (lowerMessage.match(/duration|long|how many|minutes|hours/i)) {
      return "Course Durations:\n* Preview: 2 min FREE\n* Most courses: 3-12 hours total\n* Watch at your own pace\n* Pause & resume anytime\n* No time limits!\n\nPay only for minutes you watch!";
    }

    return "I can help with:\n* Domain info (AI, Music, Fitness, etc.)\n* Pricing & payments\n* Course details\n* Video features\n* Instructors\n\nWhat would you like to know?";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: generateBotResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 500);

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-emerald-500/50 transform hover:scale-110 transition-all flex items-center justify-center group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute bottom-full right-0 mb-3 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700">
            Ask me anything!
          </span>
        </button>
      )}

      {isOpen && (
        <div className="absolute bottom-0 right-0 w-96 h-[32rem] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Course Guide AI</h3>
              <p className="text-xs opacity-90">Ask about domains & courses</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:opacity-80 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg whitespace-pre-line ${
                    message.type === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-700 p-4 flex gap-2">
            <input
              type="text"
              placeholder="Ask about courses..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
            />
            <button
              onClick={handleSendMessage}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg p-2 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
