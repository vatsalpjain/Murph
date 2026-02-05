import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

interface HeroProps {
  onFindSession: () => void;
  onResumeSession: () => void;
}

const Hero: React.FC<HeroProps> = ({ onFindSession, onResumeSession }) => {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-slate-900 to-teal-900 pt-20 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
          Pay only for what you learn.{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Learn from the best, on demand.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
          Start learning immediately without upfront commitments. Pay per minute and learn from world-class instructors whenever you want.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onFindSession}
            className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center group"
          >
            Find a Session
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onResumeSession}
            className="px-8 py-3.5 bg-gray-800 border-2 border-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Play className="w-5 h-5" />
            Resume Learning
          </button>
        </div>

        {/* Social Proof / Stats */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center mt-16 pt-12 border-t border-gray-700/50">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">50K+</div>
            <p className="text-gray-400 text-sm mt-1">Active Learners</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">1000+</div>
            <p className="text-gray-400 text-sm mt-1">Live Sessions</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">4.9★</div>
            <p className="text-gray-400 text-sm mt-1">Average Rating</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
