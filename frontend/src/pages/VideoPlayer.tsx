import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play, Search, Loader, MessageCircle, Send, Share2, X, CheckCircle, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  viewCount?: string;
}

interface CourseInfo {
  id: string;
  title: string;
  price_per_minute: number;
  rating: number;
  total_duration_minutes: number;
  lock_amount: number;
  teacher_id?: string;
}

interface SessionSummary {
  session_id: string;
  duration_seconds: number;
  duration_minutes: number;
  price_per_minute: number;
  amount_charged: number;
  amount_locked: number;
  refund: number;
  final_balance: number;
}

const VideoPlayer = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, session } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const domain = searchParams.get('domain') || 'Programming';
  const query = searchParams.get('q') || '';
  const videoIdParam = searchParams.get('v'); // Support deep linking with ?v=videoId
  const videoTitleParam = searchParams.get('title'); // Video title from search
  const videoChannelParam = searchParams.get('channel'); // Channel name from search
  const courseIdParam = searchParams.get('courseId'); // Course ID for pricing
  const searchTerm = (query || domain).trim();
  const apiKey = import.meta.env.VITE_YT_API_KEY as string | undefined;

  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const lastPlayTimeRef = useRef<number>(0); // Track when video started playing
  const totalWatchedSecondsRef = useRef<number>(0); // Accumulated watch time (only while playing)
  const sessionStartedRef = useRef<boolean>(false); // Track if session API was called
  const lastVideoPositionRef = useRef<number>(0); // Track last video position for seek detection
  const seekWarningShownRef = useRef<boolean>(false); // Prevent multiple warnings
  const isPlayingRef = useRef<boolean>(false); // Ref for interval to access current playing state
  const hasPaidRef = useRef<boolean>(false); // Ref for interval to access current paid state

  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [hasPaid, setHasPaid] = useState(false); // User confirmed payment, ready to watch
  const [isPlaying, setIsPlaying] = useState(false); // Track if video is actually playing
  const [elapsed, setElapsed] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [watchedSeconds, setWatchedSeconds] = useState(0); // For UI display of watched time
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showLockPopup, setShowLockPopup] = useState(false);
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [userBalance, setUserBalance] = useState<number | null>(null); // User's wallet balance
  const [videoDuration, setVideoDuration] = useState<number>(30 * 60); // Video duration in seconds
  const [comments, setComments] = useState<{ id: string; user: string; text: string; timestamp: string }[]>([
    { id: '1', user: 'Alex Kumar', text: 'Great explanation! Very helpful.', timestamp: '2 min ago' },
    { id: '2', user: 'Sarah Chen', text: 'Could you please cover more advanced topics?', timestamp: '5 min ago' },
    { id: '3', user: 'John Doe', text: 'This is exactly what I was looking for!', timestamp: '8 min ago' },
  ]);
  const [commentInput, setCommentInput] = useState('');

  // Configuration
  const PREVIEW_LIMIT = 120; // Free preview duration in seconds (2 minutes)
  const BACKEND_URL = 'http://localhost:8000';
  // Only use authenticated user ID - null if not logged in
  const userId = user?.id || null;
  // Price per minute: from course or default ₹2/min
  const pricePerMinute = courseInfo?.price_per_minute || 2.0;
  const pricePerSecond = pricePerMinute / 60;
  const lockAmount = courseInfo?.lock_amount || 30.0;

  // Get auth token for API calls
  const getAuthHeaders = () => {
    const token = session?.access_token;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Fetch course pricing (with rating-based price) if courseId is provided
  useEffect(() => {
    if (courseIdParam) {
      // First try the pricing endpoint (assigns rating on first access)
      fetch(`${BACKEND_URL}/session/pricing/${courseIdParam}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setCourseInfo({
              id: data.course_id,
              title: data.title,
              price_per_minute: data.price_per_minute,
              rating: data.rating,
              total_duration_minutes: data.total_duration_minutes,
              lock_amount: data.lock_amount
            });
            console.log('✅ Loaded course pricing:', data.price_per_minute, '₹/min, Rating:', data.rating);
          }
        })
        .catch(err => {
          console.error('Failed to load course pricing:', err);
          // Fallback to regular course endpoint
          fetch(`${BACKEND_URL}/api/courses/${courseIdParam}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data) {
                setCourseInfo({
                  id: data.id,
                  title: data.title,
                  price_per_minute: data.price_per_minute || 2.0,
                  rating: data.rating || 3.0,
                  total_duration_minutes: data.total_duration_minutes || 30,
                  lock_amount: (data.total_duration_minutes || 30) * (data.price_per_minute || 2.0) * 0.5,
                  teacher_id: data.teacher_id
                });
              }
            });
        });
    }
  }, [courseIdParam]);

  // Cleanup: End session on page exit or navigation
  useEffect(() => {
    const endSessionOnExit = () => {
      if (hasPaidRef.current && userId && sessionId) {
        // Calculate final duration including current segment if still playing
        let finalDuration = totalWatchedSecondsRef.current;
        if (isPlayingRef.current && lastPlayTimeRef.current > 0) {
          finalDuration += (Date.now() - lastPlayTimeRef.current) / 1000;
        }
        
        // Use sendBeacon for reliable delivery on page unload
        const payload = JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          duration_seconds: Math.floor(finalDuration),
          price_per_minute: pricePerMinute,
          locked_amount: lockAmount
        });
        navigator.sendBeacon(`${BACKEND_URL}/session/end-beacon`, payload);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPaidRef.current) {
        endSessionOnExit();
        // Show confirmation dialog
        e.preventDefault();
        e.returnValue = 'You have an active session. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // End session on component unmount (navigation within app)
      endSessionOnExit();
    };
  }, [hasPaid, userId, sessionId, pricePerMinute, lockAmount, isPlaying]);

  // Load videos for the domain or query
  useEffect(() => {
    let isActive = true;
    setLoading(true);

    const loadVideos = async () => {
      if (apiKey) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q=${encodeURIComponent(
              searchTerm
            )}&key=${apiKey}`
          );

          if (!response.ok) {
            throw new Error('Failed to fetch YouTube results');
          }

          const data = await response.json();
          const items = Array.isArray(data.items) ? data.items : [];
          const mapped = items
            .filter((item: any) => item.id && item.id.videoId)
            .map((item: any) => ({
              id: item.id.videoId,
              title: item.snippet.title,
              thumbnail:
                item.snippet.thumbnails?.medium?.url ||
                item.snippet.thumbnails?.default?.url ||
                '',
              channelTitle: item.snippet.channelTitle,
            }));

          if (isActive) {
            setVideos(mapped);
            setSelectedVideo(mapped[0] || null);
          }
        } catch (error) {
          console.error('YouTube search failed:', error);
          const fallbackVideos = getDemoVideos(searchTerm || domain);
          if (isActive) {
            setVideos(fallbackVideos);
            setSelectedVideo(fallbackVideos[0] || null);
          }
        }
      } else {
        const fallbackVideos = getDemoVideos(searchTerm || domain);
        if (isActive) {
          setVideos(fallbackVideos);
          setSelectedVideo(fallbackVideos[0] || null);
        }
      }

      if (isActive) {
        setLoading(false);
      }
    };

    loadVideos();

    return () => {
      isActive = false;
    };
  }, [apiKey, domain, searchTerm]);

  // Handle deep linking - if ?v=videoId is provided, select that video
  useEffect(() => {
    if (videoIdParam) {
      // First check if video exists in current list
      const linkedVideo = videos.find(v => v.id === videoIdParam);
      if (linkedVideo) {
        setSelectedVideo(linkedVideo);
      } else {
        // Video not in list - create from URL params (for AI search results)
        const directVideo: YouTubeVideo = {
          id: videoIdParam,
          title: videoTitleParam || 'Video',
          thumbnail: `https://img.youtube.com/vi/${videoIdParam}/mqdefault.jpg`,
          channelTitle: videoChannelParam || 'YouTube'
        };
        setSelectedVideo(directVideo);
        // Add to videos list so it appears in sidebar
        setVideos(prev => {
          if (!prev.find(v => v.id === videoIdParam)) {
            return [directVideo, ...prev];
          }
          return prev;
        });
      }
    }
  }, [videoIdParam, videoTitleParam, videoChannelParam, videos.length]); // Only depend on videos.length to avoid infinite loop

  // Update URL when video is selected (for sharing)
  const updateUrlWithVideo = (videoId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('v', videoId);
    setSearchParams(newParams, { replace: true });
  };

  // Share current video URL
  const handleShare = async () => {
    if (!selectedVideo) return;
    
    const shareUrl = `${window.location.origin}/video-player?v=${selectedVideo.id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: selectedVideo.title,
          text: `Check out this video: ${selectedVideo.title}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  // Initialize YouTube player when selected video changes
  useEffect(() => {
    if (!selectedVideo) return;

    const initializePlayer = () => {
      // If player already exists, just load the new video
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById(selectedVideo.id);
        startMonitoring();
        return;
      }

      // Otherwise, create new player
      const playerElement = document.getElementById('player');
      if (playerElement) {
        playerElement.innerHTML = ''; // Clear existing content
      }

      playerRef.current = new (window as any).YT.Player('player', {
        videoId: selectedVideo.id,
        playerVars: {
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

    // Load YouTube IFrame API if not already loaded
    if (!(window as any).YT || !(window as any).YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existingScript) {
        document.body.appendChild(tag);
      }

      (window as any).onYouTubeIframeAPIReady = initializePlayer;
    } else {
      // API already loaded, initialize player directly
      initializePlayer();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedVideo]);

  const onPlayerReady = (event: any) => {
    // Get video duration from YouTube API
    const duration = event.target.getDuration(); // Returns seconds
    if (duration > 0) {
      setVideoDuration(duration);
      
      // If no course info, treat YouTube video as a course
      // Calculate pricing based on video duration
      if (!courseIdParam) {
        const durationMinutes = Math.ceil(duration / 60);
        const defaultPricePerMin = 2.0; // Default ₹2/min
        const totalVideoCost = durationMinutes * defaultPricePerMin;
        const calculatedLock = Math.round(totalVideoCost * 0.5 * 100) / 100; // 50% lock
        
        setCourseInfo({
          id: selectedVideo?.id || 'youtube',
          title: selectedVideo?.title || 'YouTube Video',
          price_per_minute: defaultPricePerMin,
          rating: 3.0, // Default rating
          total_duration_minutes: durationMinutes,
          lock_amount: calculatedLock
        });
        
        console.log(`✅ YouTube video duration: ${durationMinutes} min, Lock: ₹${calculatedLock}`);
      }
    }
    startMonitoring();
  };

  // Handle YouTube player state changes (play/pause)
  const onPlayerStateChange = async (event: any) => {
    const YT = (window as any).YT;
    
    if (event.data === YT.PlayerState.PLAYING) {
      console.log('▶️ Video PLAYING detected, hasPaidRef:', hasPaidRef.current);
      setIsPlaying(true);
      isPlayingRef.current = true; // CRITICAL: Sync ref for interval to read
      lastPlayTimeRef.current = Date.now();
      
      // Start session on FIRST play after user confirmed payment
      if (hasPaidRef.current && !sessionStartedRef.current && userId) {
        sessionStartedRef.current = true;
        console.log('▶️ Video started playing - Starting billing session...');
        
        try {
          const res = await fetch(`${BACKEND_URL}/session/start`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
              user_id: userId,
              video_id: selectedVideo?.id,
              course_id: courseIdParam || null,
              lock_amount: lockAmount,
              price_per_minute: pricePerMinute
            }),
          });

          if (res.ok) {
            const data = await res.json();
            setSessionId(data.session_id);
            console.log('✅ Session started:', data.session_id);
          } else {
            const error = await res.json().catch(() => ({ detail: 'Session start failed' }));
            console.error('Session start failed:', error);
            // Revert state if session failed
            sessionStartedRef.current = false;
            setHasPaid(false);
            setIsLocked(true);
            playerRef.current?.pauseVideo();
            alert(error.detail || 'Failed to start session. Please check your balance.');
          }
        } catch (error) {
          console.error('Session start error:', error);
          sessionStartedRef.current = false;
          setHasPaid(false);
          setIsLocked(true);
          playerRef.current?.pauseVideo();
          alert('Failed to start session. Please try again.');
        }
      }
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
      console.log('⏸️ Video PAUSED/ENDED detected');
      if (isPlayingRef.current && hasPaidRef.current) {
        // Accumulate time watched before pause
        const watchedThisSegment = (Date.now() - lastPlayTimeRef.current) / 1000;
        totalWatchedSecondsRef.current += watchedThisSegment;
        console.log(`⏱️ Accumulated ${watchedThisSegment.toFixed(1)}s, Total: ${totalWatchedSecondsRef.current.toFixed(1)}s`);
      }
      setIsPlaying(false);
      isPlayingRef.current = false; // Sync ref
    }
  };

  const startMonitoring = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        setElapsed(currentTime);
        
        // Seek/Skip detection during paid session
        if (hasPaidRef.current && lastVideoPositionRef.current > 0) {
          const timeDiff = currentTime - lastVideoPositionRef.current;
          
          // If user skipped forward more than 5 seconds
          if (timeDiff > 5 && !seekWarningShownRef.current) {
            seekWarningShownRef.current = true;
            const skippedSeconds = Math.floor(timeDiff);
            
            // Show warning toast/alert
            const continueWatching = window.confirm(
              `⚠️ You skipped ${skippedSeconds} seconds!\n\n` +
              `Note: You're only charged for actual watch time, not skipped content.\n\n` +
              `Current billing: ₹${totalWatchedSecondsRef.current * pricePerSecond}\n` +
              `Rate: ₹${pricePerMinute.toFixed(2)}/min\n\n` +
              `Continue watching?`
            );
            
            if (!continueWatching) {
              playerRef.current?.pauseVideo();
            }
            
            // Reset warning flag after 3 seconds to allow new warnings
            setTimeout(() => {
              seekWarningShownRef.current = false;
            }, 3000);
          }
        }
        
        // Update last position
        lastVideoPositionRef.current = currentTime;

        if (!hasPaidRef.current && !isLocked && currentTime >= PREVIEW_LIMIT) {
          playerRef.current.pauseVideo();
          setIsLocked(true);
          setShowLockPopup(true); // Show lock confirmation popup
          clearInterval(intervalRef.current);
        }

        // BILLING: Update cost display using refs for current values
        if (hasPaidRef.current) {
          let displayTime = totalWatchedSecondsRef.current;
          
          // If currently playing, add the current segment time
          if (isPlayingRef.current && lastPlayTimeRef.current > 0) {
            const currentSegmentTime = (Date.now() - lastPlayTimeRef.current) / 1000;
            displayTime += currentSegmentTime;
          }
          
          // Calculate cost - use 2.0/min as default if courseInfo not loaded
          const ratePerMin = 2.0; // Default rate
          const ratePerSec = ratePerMin / 60;
          const currentCost = displayTime * ratePerSec;
          
          // Debug log ALWAYS for first 20 seconds to diagnose
          console.log(`💰 BILLING TICK: hasPaid=${hasPaidRef.current}, isPlaying=${isPlayingRef.current}, lastPlayTime=${lastPlayTimeRef.current}, totalWatched=${totalWatchedSecondsRef.current.toFixed(1)}s, displayTime=${displayTime.toFixed(1)}s, cost=₹${currentCost.toFixed(2)}`);
          
          setTotalCost(currentCost);
          setWatchedSeconds(displayTime);
        } else {
          console.log(`💰 BILLING TICK: hasPaidRef.current is FALSE`);
        }
      }
    }, 500); // Update every 500ms for smoother display
  };

  // Show lock confirmation popup - check balance first
  const handleShowPaymentPopup = async () => {
    if (!isAuthenticated || !userId) {
      alert('Please log in to continue watching');
      navigate('/login');
      return;
    }
    
    // Fetch and check user balance before showing popup
    try {
      const res = await fetch(`${BACKEND_URL}/api/wallet/balance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId })
      });
      
      if (res.ok) {
        const data = await res.json();
        setUserBalance(data.balance);
        
        // Check if user has enough balance for the lock
        if (data.balance < lockAmount) {
          const proceed = window.confirm(
            `Insufficient balance!\n\nRequired: ₹${lockAmount.toFixed(2)}\nAvailable: ₹${data.balance.toFixed(2)}\n\nWould you like to add money to your wallet?`
          );
          if (proceed) {
            navigate('/payment');
          }
          return;
        }
      } else {
        // If balance check fails, still show popup - backend will validate on start
        console.warn('Balance check failed, proceeding anyway');
      }
    } catch (err) {
      console.error('Failed to check balance:', err);
      // Continue anyway - backend will validate
    }
    
    setShowLockPopup(true);
  };

  // User confirmed payment - enable playback, session starts when video plays
  const handlePayment = async () => {
    if (!isAuthenticated || !userId) {
      alert('Please log in to continue watching');
      navigate('/login');
      return;
    }

    // Reset tracking for new session
    totalWatchedSecondsRef.current = 0;
    setWatchedSeconds(0);
    setTotalCost(0);
    sessionStartedRef.current = false; // Will be set true when video actually plays
    lastVideoPositionRef.current = 0; // Reset seek detection
    seekWarningShownRef.current = false;
    lastPlayTimeRef.current = 0; // Reset play time tracking
    
    // Enable paid mode and start video - session API called when video plays
    setHasPaid(true);
    hasPaidRef.current = true; // CRITICAL: Sync ref immediately
    setIsLocked(false);
    setShowLockPopup(false);
    
    console.log('🔓 Payment confirmed - hasPaidRef set to true, starting video');
    
    if (playerRef.current) {
      playerRef.current.playVideo(); // This triggers onPlayerStateChange -> PLAYING -> session start
    }
    startMonitoring();
  };

  const handleEndSession = async () => {
    if (!hasPaidRef.current || !userId) return;
    
    // Stop tracking
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // If video is still playing, add the current segment time
    if (isPlayingRef.current && lastPlayTimeRef.current > 0) {
      const currentSegmentTime = (Date.now() - lastPlayTimeRef.current) / 1000;
      totalWatchedSecondsRef.current += currentSegmentTime;
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
    
    // Calculate final watch time
    const finalDurationSeconds = Math.floor(totalWatchedSecondsRef.current);
    console.log(`🛑 Ending session - Final duration: ${finalDurationSeconds}s`);
    
    try {
      const res = await fetch(`${BACKEND_URL}/session/end`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          user_id: userId,
          session_id: sessionId,
          duration_seconds: finalDurationSeconds,
          price_per_minute: pricePerMinute,
          locked_amount: lockAmount
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Show session summary popup
        setSessionSummary({
          session_id: data.session_id,
          duration_seconds: data.duration_seconds,
          duration_minutes: data.duration_minutes,
          price_per_minute: data.price_per_minute,
          amount_charged: data.amount_charged,
          amount_locked: data.amount_locked,
          refund: data.refund,
          final_balance: data.final_balance
        });
        setShowSummaryPopup(true);

        if (playerRef.current) {
          playerRef.current.pauseVideo();
        }
        setHasPaid(false);
        hasPaidRef.current = false; // Sync ref
        setIsLocked(true);
        setSessionId(null);
        sessionStartedRef.current = false; // Reset for next session
        totalWatchedSecondsRef.current = 0;
        setWatchedSeconds(0); // Reset UI display
      }
    } catch (error) {
      console.error('End session error:', error);
      alert('Failed to end session. Please try again.');
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleSelectVideo = async (video: YouTubeVideo) => {
    // If user has an active paid session, end it first before switching
    if (hasPaid && userId) {
      await handleEndSession();
    }
    
    setSelectedVideo(video);
    updateUrlWithVideo(video.id); // Update URL for deep linking
    setElapsed(0);
    setTotalCost(0);
    setIsLocked(false);
    // Reset refs and state
    if (!hasPaidRef.current) {
      setHasPaid(false);
      hasPaidRef.current = false;
    }
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
                onClick={() => navigate('/home')}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {query ? `Results for "${searchTerm}"` : `${domain} Courses`}
                </h1>
                <p className="text-gray-400 text-sm">YouTube Learning Platform</p>
              </div>
            </div>
            {/* Share Button */}
            {selectedVideo && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}
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
              {isLocked && !hasPaid && !showLockPopup && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                  <div className="bg-gray-800 p-8 rounded-lg text-center max-w-sm border border-emerald-400/30">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Continue Learning?
                    </h3>
                    <p className="text-gray-300 mb-2">
                      Free preview has ended
                    </p>
                    <div className="text-emerald-400 font-bold text-lg mb-2">
                      ₹{pricePerMinute.toFixed(2)}/min
                    </div>
                    {courseInfo?.rating && (
                      <p className="text-yellow-400 text-sm mb-4">
                        ⭐ Rating: {courseInfo.rating.toFixed(1)}/5.0
                      </p>
                    )}
                    <button
                      onClick={handleShowPaymentPopup}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all"
                    >
                      Continue Watching
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
                
                {/* Live billing status bar when paid */}
                {hasPaid ? (
                  <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-emerald-400/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                        <span className="text-white font-semibold">
                          {isPlaying ? '● BILLING ACTIVE' : '⏸ PAUSED'}
                        </span>
                        <span className="text-gray-400 text-sm ml-2">
                          @ ₹{pricePerMinute.toFixed(2)}/min
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-mono font-bold text-xl">
                          ₹{totalCost.toFixed(2)}
                        </span>
                        <p className="text-gray-400 text-xs">
                          {Math.floor(watchedSeconds / 60)}m {Math.floor(watchedSeconds % 60)}s watched
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((totalCost / lockAmount) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>₹0</span>
                      <span>Lock: ₹{lockAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  /* Preview info before payment */
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Rate</p>
                      <p className="text-emerald-400 font-bold text-lg">₹{pricePerMinute.toFixed(2)}/min</p>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Preview</p>
                      <p className="text-emerald-400 font-bold text-lg">
                        {Math.floor(elapsed)}s / {PREVIEW_LIMIT}s
                      </p>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Rating</p>
                      <p className="text-yellow-400 font-bold text-lg">
                        ⭐ {(courseInfo?.rating || 3.0).toFixed(1)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Live Comments Section */}
            <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                Live Comments
              </h3>

              {/* Comments List */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto scrollbar-hide">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                          {comment.user.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{comment.user}</p>
                          <p className="text-gray-500 text-xs">{comment.timestamp}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm ml-10">{comment.text}</p>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div className="flex gap-2 mt-6 pt-4 border-t border-gray-700">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && commentInput.trim()) {
                      const newComment = {
                        id: String(comments.length + 1),
                        user: 'You',
                        text: commentInput,
                        timestamp: 'just now',
                      };
                      setComments([newComment, ...comments]);
                      setCommentInput('');
                    }
                  }}
                  className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                />
                <button
                  onClick={() => {
                    if (commentInput.trim()) {
                      const newComment = {
                        id: String(comments.length + 1),
                        user: 'You',
                        text: commentInput,
                        timestamp: 'just now',
                      };
                      setComments([newComment, ...comments]);
                      setCommentInput('');
                    }
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg p-2 transition-colors"
                  aria-label="Send comment"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Video Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-400" />
                {query ? 'Search Results' : 'Related Videos'}
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
                <div className="flex flex-col gap-3 max-h-screen overflow-y-auto scrollbar-hide">
                  {videos.length > 0 ? (
                    videos.slice(0, 6).map((video) => (
                      <div
                        key={video.id}
                        onClick={() => handleSelectVideo(video)}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          selectedVideo?.id === video.id
                            ? 'border-emerald-400 bg-gray-700'
                            : 'border-gray-700 hover:border-gray-600 hover:border-emerald-400/50'
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
                      No videos found.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Lock Confirmation Popup */}
      {showLockPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-emerald-500/30 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Confirm Payment Hold</h3>
              <button
                onClick={() => setShowLockPopup(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Amount to Hold</span>
                  <span className="text-2xl font-bold text-emerald-400">₹{lockAmount.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-400">
                  This is 50% of the video cost. You'll only be charged for what you watch.
                </p>
              </div>
              
              <div className="bg-gray-700/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Rate</span>
                  <span className="text-white">₹{pricePerMinute.toFixed(2)}/min</span>
                </div>
                {courseInfo?.rating && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Video Rating</span>
                    <span className="text-yellow-400">⭐ {courseInfo.rating.toFixed(1)}/5.0</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Duration</span>
                  <span className="text-white">{courseInfo?.total_duration_minutes || 30} min</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLockPopup(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Hold & Watch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Summary Popup */}
      {showSummaryPopup && sessionSummary && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-emerald-500/30 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Session Complete</h3>
              <p className="text-gray-400 mt-1">Here's your session summary</p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400">Watch Time</span>
                  <span className="text-xl font-bold text-white">{formatTime(sessionSummary.duration_seconds)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Rate</span>
                  <span className="text-white">₹{sessionSummary.price_per_minute.toFixed(2)}/min</span>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount Held</span>
                  <span className="text-white">₹{sessionSummary.amount_locked.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount Charged</span>
                  <span className="text-red-400 font-semibold">-₹{sessionSummary.amount_charged.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-600 pt-3">
                  <span className="text-gray-400">Refunded</span>
                  <span className="text-emerald-400 font-semibold">+₹{sessionSummary.refund.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400">New Balance</span>
                  <span className="text-2xl font-bold text-emerald-400">₹{sessionSummary.final_balance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSummaryPopup(false)}
              className="w-full mt-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}

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
