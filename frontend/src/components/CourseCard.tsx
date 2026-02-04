import React from 'react';
import { Star, Clock } from 'lucide-react';

interface CourseCardProps {
  title: string;
  instructor: string;
  duration: number; // in minutes
  pricePerMinute: number;
  rating: number;
  reviewCount: number;
  thumbnail?: string;
  badge?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  instructor,
  duration,
  pricePerMinute,
  rating,
  reviewCount,
  thumbnail,
  badge,
}) => {
  const totalPrice = (duration * pricePerMinute).toFixed(2);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-4xl">📚</div>
        )}
        {badge && (
          <div className="absolute top-3 right-3 bg-emerald-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-white mb-2 line-clamp-2 text-sm">
          {title}
        </h3>

        {/* Instructor */}
        <p className="text-xs text-gray-400 mb-3">by {instructor}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-1">
            {rating} ({reviewCount})
          </span>
        </div>

        {/* Duration & Price Row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">{durationText}</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">from</div>
            <div className="font-bold text-emerald-400 text-sm">
              ${totalPrice}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button className="w-full mt-3 py-2 bg-emerald-500/20 text-emerald-400 rounded font-semibold hover:bg-emerald-500/30 transition-colors text-sm border border-emerald-500/30">
          View Session
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
