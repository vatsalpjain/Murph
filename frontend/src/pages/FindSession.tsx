import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import Navbar from '../components/Navbar';

interface Domain {
  id: number;
  name: string;
  sessionCount: number;
  icon: string;
  description: string;
}

const FindSession: React.FC = () => {
  const navigate = useNavigate();
  const [walletBalance] = React.useState<number>(125.50);

  const domains: Domain[] = [
    {
      id: 1,
      name: 'Artificial Intelligence',
      sessionCount: 342,
      icon: '🤖',
      description: 'From machine learning to deep learning and beyond',
    },
    {
      id: 2,
      name: 'Data Science',
      sessionCount: 289,
      icon: '📊',
      description: 'Analytics, visualization, and data-driven decisions',
    },
    {
      id: 3,
      name: 'Fitness & Wellness',
      sessionCount: 456,
      icon: '💪',
      description: 'Exercise routines, nutrition, and personal training',
    },
    {
      id: 4,
      name: 'Music & Arts',
      sessionCount: 198,
      icon: '🎵',
      description: 'Learn instruments, production, and creative skills',
    },
    {
      id: 5,
      name: 'Language Learning',
      sessionCount: 521,
      icon: '🗣️',
      description: 'Master new languages with native speakers',
    },
    {
      id: 6,
      name: 'Meditation & Mindfulness',
      sessionCount: 134,
      icon: '🧘',
      description: 'Mental wellness and meditation practices',
    },
    {
      id: 7,
      name: 'Business & Entrepreneurship',
      sessionCount: 412,
      icon: '💼',
      description: 'Leadership, marketing, and business strategy',
    },
    {
      id: 8,
      name: 'Personal Development',
      sessionCount: 567,
      icon: '🌱',
      description: 'Self-improvement, productivity, and growth hacks',
    },
  ];

  const handleDomainClick = (domainName: string) => {
    navigate(`/video-player?domain=${encodeURIComponent(domainName)}`);
  };

  const handleBackClick = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <Navbar />

      {/* Header Section */}
      <section className="bg-gradient-to-br from-gray-800 via-slate-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Find a Session
          </h1>
          <p className="text-gray-300 text-lg">
            Explore learning across 8 domains. Pick your interest and start learning with world-class instructors.
          </p>
        </div>
      </section>

      {/* Domains Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {domains.map((domain) => (
              <div
                key={domain.id}
                onClick={() => handleDomainClick(domain.name)}
                className="group cursor-pointer"
              >
                <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all duration-300 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 transform hover:scale-105 hover:-translate-y-1">
                  {/* Icon */}
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {domain.icon}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {domain.name}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-300 transition-colors">
                    {domain.description}
                  </p>

                  {/* Session Count & Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-semibold text-sm">
                      {domain.sessionCount.toLocaleString()} sessions
                    </span>
                    <div className="bg-emerald-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Don't know where to start?
          </h2>
          <p className="text-gray-300 mb-6">
            Explore trending sessions, check instructors with the best ratings, or search for a specific topic using the search bar at the top.
          </p>
          <button
            onClick={handleBackClick}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
          >
            Browse with Search
          </button>
        </div>
      </section>
    </div>
  );
};

export default FindSession;
