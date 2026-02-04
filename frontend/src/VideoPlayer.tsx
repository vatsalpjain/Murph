import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play, Search, Loader } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  viewCount?: string;
}

const VideoPlayer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const domain = searchParams.get('domain') || 'Programming';
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Configuration
  const PREVIEW_LIMIT = 120; // Free preview duration in seconds (2 minutes)
  const BACKEND_URL = 'http://localhost:8000';
  const userId = 'ANNA_01';

  // Load videos for the domain (no API key needed!)
  useEffect(() => {
    setLoading(true);
    
    // Get curated videos for this domain
    const domainVideos = getDemoVideos(domain);
    setVideos(domainVideos);
    
    if (domainVideos.length > 0) {
      setSelectedVideo(domainVideos[0]);
    }
    
    setLoading(false);
  }, [domain]);

  // Initialize YouTube player when selected video changes
  useEffect(() => {
    if (!selectedVideo) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      document.body.appendChild(tag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      if (playerRef.current && playerRef.current.innerHTML === '') {
        playerRef.current = new (window as any).YT.Player('player', {
          videoId: selectedVideo.id,
          playerVars: {
            controls: 1,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: onPlayerReady,
          },
        });
      }
    };

    // Trigger if API already loaded
    if ((window as any).YT && (window as any).YT.Player) {
      (window as any).onYouTubeIframeAPIReady();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedVideo]);

  const onPlayerReady = () => {
    startMonitoring();
  };

  const startMonitoring = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        setElapsed(currentTime);

        if (!hasPaid && !isLocked && currentTime >= PREVIEW_LIMIT) {
          playerRef.current.pauseVideo();
          setIsLocked(true);
          clearInterval(intervalRef.current);
        }

        if (hasPaid) {
          setTotalCost(currentTime * 0.033);
        }
      }
    }, 1000);
  };

  const handlePayment = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (res.ok) {
        setHasPaid(true);
        setIsLocked(false);
        if (playerRef.current) {
          playerRef.current.playVideo();
        }
        startMonitoring();
      } else {
        alert('Payment failed. Please check your balance.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  const handleEndSession = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/session/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(
          `Session ended!\nDuration: ${data.duration_seconds}s\nCharged: ₹${data.amount_charged}\nRefund: ₹${data.refund}`
        );

        if (playerRef.current) {
          playerRef.current.pauseVideo();
        }
        setHasPaid(false);
        setIsLocked(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch (error) {
      console.error('End session error:', error);
    }
  };

  const handleSelectVideo = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setElapsed(0);
    setTotalCost(0);
    setIsLocked(false);
    setHasPaid(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {domain} Courses
                </h1>
                <p className="text-gray-400 text-sm">YouTube Learning Platform</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
              <div id="player" ref={playerRef} className="w-full h-full"></div>

              {/* Payment Gate Overlay */}
              {isLocked && !hasPaid && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                  <div className="bg-gray-800 p-8 rounded-lg text-center max-w-sm border border-emerald-400/30">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Continue Learning?
                    </h3>
                    <p className="text-gray-300 mb-2">
                      Free preview has ended
                    </p>
                    <p className="text-emerald-400 font-bold text-lg mb-6">
                      ₹2.00/min after {Math.floor(PREVIEW_LIMIT / 60)} min free
                    </p>
                    <button
                      onClick={handlePayment}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all"
                    >
                      Authorize & Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Live Billing Meter */}
              {hasPaid && (
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-xl px-4 py-2 rounded-full text-emerald-400 font-mono text-sm border border-emerald-400/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="font-bold">LIVE ₹{totalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* End Session Button */}
              {hasPaid && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={handleEndSession}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-all"
                  >
                    End Session
                  </button>
                </div>
              )}
            </div>

            {/* Video Info */}
            {selectedVideo && (
              <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-2">
                  {selectedVideo.title}
                </h2>
                <p className="text-gray-400">
                  by {selectedVideo.channelTitle}
                </p>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">Preview Duration</p>
                    <p className="text-emerald-400 font-bold text-lg">2 min free</p>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">Watched</p>
                    <p className="text-emerald-400 font-bold text-lg">{Math.floor(elapsed)}s</p>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">Rate</p>
                    <p className="text-emerald-400 font-bold text-lg">₹2/min</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-400" />
                Related Videos
              </h3>

              {loading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-700/50 h-24 rounded-lg animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-96 overflow-y-auto scrollbar-hide">
                  {videos.length > 0 ? (
                    videos.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => handleSelectVideo(video)}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          selectedVideo?.id === video.id
                            ? 'border-emerald-400 bg-gray-700'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-20 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="text-white text-xs font-semibold line-clamp-2">
                            {video.title}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {video.channelTitle}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      No videos found. Check your API key.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

// Curated videos for each domain (No API key needed!)
function getDemoVideos(domain: string): YouTubeVideo[] {
  const demoVideos: { [key: string]: YouTubeVideo[] } = {
    'Artificial Intelligence': [
      {
        id: 'ad79nYk2keg',
        title: 'AI Full Course - 4 Hours | AI Tutorial for Beginners',
        thumbnail: 'https://img.youtube.com/vi/ad79nYk2keg/mqdefault.jpg',
        channelTitle: 'Edureka',
      },
      {
        id: 'JMUxmLyrhSk',
        title: 'Machine Learning Course - 12 Hours',
        thumbnail: 'https://img.youtube.com/vi/JMUxmLyrhSk/mqdefault.jpg',
        channelTitle: 'freeCodeCamp',
      },
      {
        id: 'aircAruvnKk',
        title: 'Neural Networks Explained',
        thumbnail: 'https://img.youtube.com/vi/aircAruvnKk/mqdefault.jpg',
        channelTitle: '3Blue1Brown',
      },
      {
        id: 'i_McNBDP9Qs',
        title: 'AI & Deep Learning with TensorFlow',
        thumbnail: 'https://img.youtube.com/vi/i_McNBDP9Qs/mqdefault.jpg',
        channelTitle: 'Google Developers',
      },
    ],
    'Data Science': [
      {
        id: 'ua-CiDNNj30',
        title: 'Data Science Full Course - 12 Hours',
        thumbnail: 'https://img.youtube.com/vi/ua-CiDNNj30/mqdefault.jpg',
        channelTitle: 'Simplilearn',
      },
      {
        id: 'LHBE6Q9XlzI',
        title: 'Python for Data Science - Full Course',
        thumbnail: 'https://img.youtube.com/vi/LHBE6Q9XlzI/mqdefault.jpg',
        channelTitle: 'freeCodeCamp',
      },
      {
        id: 'GPVsHOlRBBI',
        title: 'Data Analysis with Pandas',
        thumbnail: 'https://img.youtube.com/vi/GPVsHOlRBBI/mqdefault.jpg',
        channelTitle: 'Data School',
      },
    ],
    'Fitness': [
      {
        id: '2tM1LFFxeKg',
        title: 'Full Body Workout - No Equipment',
        thumbnail: 'https://img.youtube.com/vi/2tM1LFFxeKg/mqdefault.jpg',
        channelTitle: 'FitnessBlender',
      },
      {
        id: 'ml6cT4AZdqI',
        title: 'Yoga For Complete Beginners - 20 Minute',
        thumbnail: 'https://img.youtube.com/vi/ml6cT4AZdqI/mqdefault.jpg',
        channelTitle: 'Yoga With Adriene',
      },
      {
        id: 'IODxDxX7oi4',
        title: 'Home Workout Course - Beginner Friendly',
        thumbnail: 'https://img.youtube.com/vi/IODxDxX7oi4/mqdefault.jpg',
        channelTitle: 'THENX',
      },
    ],
    'Music': [
      {
        id: 'Z_hv9LjsQj8',
        title: 'Guitar Lessons for Absolute Beginners',
        thumbnail: 'https://img.youtube.com/vi/Z_hv9LjsQj8/mqdefault.jpg',
        channelTitle: 'JustinGuitar',
      },
      {
        id: 'lO59TZu_jPQ',
        title: 'Piano Tutorial for Beginners - Lesson 1',
        thumbnail: 'https://img.youtube.com/vi/lO59TZu_jPQ/mqdefault.jpg',
        channelTitle: 'HDpiano',
      },
      {
        id: 'gZYq11KxhLA',
        title: 'Music Theory for Beginners',
        thumbnail: 'https://img.youtube.com/vi/gZYq11KxhLA/mqdefault.jpg',
        channelTitle: 'Music Theory',
      },
    ],
    'Language Learning': [
      {
        id: 'V0PsE2e6YKU',
        title: 'Learn Spanish in 30 Minutes',
        thumbnail: 'https://img.youtube.com/vi/V0PsE2e6YKU/mqdefault.jpg',
        channelTitle: 'Language Learning',
      },
      {
        id: '6eS3eK6FPDs',
        title: 'English Grammar Course For Beginners',
        thumbnail: 'https://img.youtube.com/vi/6eS3eK6FPDs/mqdefault.jpg',
        channelTitle: 'Learn English',
      },
      {
        id: 'lAnKG0ezFkM',
        title: 'French Course for Beginners',
        thumbnail: 'https://img.youtube.com/vi/lAnKG0ezFkM/mqdefault.jpg',
        channelTitle: 'Learn French',
      },
    ],
    'Meditation': [
      {
        id: 'inpok4MKVLM',
        title: 'Guided Meditation for Beginners - 10 Minutes',
        thumbnail: 'https://img.youtube.com/vi/inpok4MKVLM/mqdefault.jpg',
        channelTitle: 'The Mindful Movement',
      },
      {
        id: 'ssss7V1_eyA',
        title: 'Mindfulness Meditation Course',
        thumbnail: 'https://img.youtube.com/vi/ssss7V1_eyA/mqdefault.jpg',
        channelTitle: 'Headspace',
      },
      {
        id: 'ZToicYcHIOU',
        title: 'Deep Relaxation Meditation',
        thumbnail: 'https://img.youtube.com/vi/ZToicYcHIOU/mqdefault.jpg',
        channelTitle: 'Meditation Relax Music',
      },
    ],
    'Business': [
      {
        id: 'g8W2N_FkuPk',
        title: 'Business Management Course - Full',
        thumbnail: 'https://img.youtube.com/vi/g8W2N_FkuPk/mqdefault.jpg',
        channelTitle: 'Business School',
      },
      {
        id: '0qXmWn3kfWY',
        title: 'Marketing Strategy - Complete Guide',
        thumbnail: 'https://img.youtube.com/vi/0qXmWn3kfWY/mqdefault.jpg',
        channelTitle: 'HubSpot',
      },
      {
        id: 'F8Cs3Cq-ybg',
        title: 'Entrepreneurship 101',
        thumbnail: 'https://img.youtube.com/vi/F8Cs3Cq-ybg/mqdefault.jpg',
        channelTitle: 'Startup School',
      },
    ],
    'Personal Development': [
      {
        id: 'Lp7E973zozc',
        title: 'Personal Development Course - Full',
        thumbnail: 'https://img.youtube.com/vi/Lp7E973zozc/mqdefault.jpg',
        channelTitle: 'Tony Robbins',
      },
      {
        id: 'ZGuYT5PdgaM',
        title: 'Productivity & Time Management',
        thumbnail: 'https://img.youtube.com/vi/ZGuYT5PdgaM/mqdefault.jpg',
        channelTitle: 'Thomas Frank',
      },
      {
        id: 'GXfhTSaJ5gE',
        title: 'Goal Setting & Achievement',
        thumbnail: 'https://img.youtube.com/vi/GXfhTSaJ5gE/mqdefault.jpg',
        channelTitle: 'Brian Tracy',
      },
    ],
  };

  return (
    demoVideos[domain] || [
      {
        id: 'dQw4w9WgXcQ',
        title: `${domain} - Getting Started`,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        channelTitle: 'Learn Online',
      },
    ]
  );
}

export default VideoPlayer;
