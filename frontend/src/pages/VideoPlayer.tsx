import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * YouTube Gated Video Player with Session-Based Payments
 * 
 * Features:
 * - Free preview (2 minutes)
 * - Payment gate at preview end
 * - ₹30 escrow lock with ₹2/min billing
 * - Live billing meter
 * - Session end with automatic refund
 */

const GatedVideoPlayer = () => {
    const navigate = useNavigate();
    
    // User state
    const userId = "ANNA_01"; // Change this to dynamic user ID in production

    // Video player state
    const playerRef = useRef<any>(null);
    const intervalRef = useRef<any>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [hasPaid, setHasPaid] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    // Configuration
    const VIDEO_ID = "dQw4w9WgXcQ"; // Replace with your YouTube video ID
    const PREVIEW_LIMIT = 120; // Free preview duration in seconds (2 minutes)
    const BACKEND_URL = "http://localhost:8000";

    // Initialize YouTube player
    useEffect(() => {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        (window as any).onYouTubeIframeAPIReady = () => {
            playerRef.current = new (window as any).YT.Player('player', {
                videoId: VIDEO_ID,
                playerVars: {
                    'controls': 1,
                    'modestbranding': 1,
                    'rel': 0,
                },
                events: {
                    'onReady': onPlayerReady,
                }
            });
        };

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const onPlayerReady = () => {
        startMonitoring();
    };

    const startMonitoring = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
                const currentTime = playerRef.current.getCurrentTime();
                setElapsed(currentTime);

                // Check for payment gate (only before authorization)
                if (!hasPaid && !isLocked && currentTime >= PREVIEW_LIMIT) {
                    playerRef.current.pauseVideo();
                    setIsLocked(true);
                    clearInterval(intervalRef.current); // Stop checking after gate appears
                }

                // Update billing if user has paid
                if (hasPaid) {
                    setTotalCost(currentTime * 0.033); // ₹2/min = ₹0.033/sec
                }
            }
        }, 1000);
    };

    const handlePayment = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/session/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });

            if (res.ok) {
                setHasPaid(true);
                setIsLocked(false);
                playerRef.current.playVideo();
                startMonitoring(); // Restart monitoring for billing
            } else {
                const error = await res.json();
                alert(error.error || 'Payment failed. Please check your balance.');
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
                body: JSON.stringify({ user_id: userId })
            });

            if (res.ok) {
                const data = await res.json();
                alert(
                    `Session ended!\n` +
                    `Duration: ${data.duration_seconds}s\n` +
                    `Charged: ₹${data.amount_charged}\n` +
                    `Refund: ₹${data.refund}\n` +
                    `Final Balance: ₹${data.final_balance}`
                );

                playerRef.current.pauseVideo();
                setHasPaid(false);
                setIsLocked(true);
                if (intervalRef.current) clearInterval(intervalRef.current);
                fetchBalance(); // Refresh balance
            }
        } catch (error) {
            console.error('End session error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-lg bg-white/80">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#B5A1D6] to-[#9B7EC4] rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-xl">🎨</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-[#1A1A1A]">Video Learning Platform</h1>
                                    <p className="text-sm text-gray-500">Pay-per-minute streaming</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="w-full max-w-6xl mx-auto">
                    {/* Video Player Container */}
                    <div className="relative w-full aspect-video rounded-[40px] overflow-hidden shadow-2xl bg-black">
                        <div id="player" className="w-full h-full"></div>

                        {/* Payment Gate Overlay */}
                        {isLocked && !hasPaid && (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/95 via-[#2A2A2A]/95 to-[#1A1A1A]/95 backdrop-blur-2xl flex items-center justify-center p-8 z-50">
                                <div className="bg-white p-12 rounded-[40px] text-center max-w-md shadow-2xl border border-white/20 transform hover:scale-[1.02] transition-transform">
                                    <div className="w-20 h-20 bg-gradient-to-br from-[#B5A1D6] to-[#9B7EC4] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#B5A1D6]/50">
                                        <span className="text-4xl">🎓</span>
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4 text-[#1A1A1A]">
                                        Ready to Master This?
                                    </h3>
                                    <p className="text-gray-600 mb-2 text-lg leading-relaxed">
                                        Your free preview has ended.
                                    </p>
                                    <p className="text-gray-600 mb-8 text-base leading-relaxed">
                                        Continue learning for{' '}
                                        <span className="font-bold text-[#B5A1D6] text-xl">₹2.00/min</span>
                                        <br />
                                        <span className="text-sm text-gray-500">(₹30 will be reserved, unused amount refunded)</span>
                                    </p>
                                    <button
                                        onClick={handlePayment}
                                        className="w-full py-5 bg-gradient-to-r from-[#B5A1D6] to-[#9B7EC4] text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-[#B5A1D6]/40 transition-all transform hover:scale-[1.05] active:scale-95"
                                    >
                                        🔐 Authorize via Finternet
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Live Billing Meter */}
                        {hasPaid && (
                            <div className="absolute bottom-6 right-6 bg-black/70 backdrop-blur-xl px-6 py-3 rounded-full text-white font-mono text-sm border border-white/20 shadow-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="font-bold">LIVE</span>
                                    <span className="text-gray-300">|</span>
                                    <span>₹{totalCost.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {/* End Session Button */}
                        {hasPaid && (
                            <div className="absolute top-6 right-6">
                                <button
                                    onClick={handleEndSession}
                                    className="px-6 py-3 bg-red-500/90 backdrop-blur-md text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg border border-white/10"
                                >
                                    End Session
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Video Info Section */}
                    <div className="mt-8 bg-white rounded-[30px] p-8 shadow-lg border border-gray-100">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Video Session</h2>
                                <p className="text-gray-600">Pay-per-minute learning</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 mb-1">Preview Duration</p>
                                <p className="text-xl font-bold text-[#B5A1D6]">{Math.floor(PREVIEW_LIMIT / 60)} min free</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="text-center p-4 bg-gray-50 rounded-2xl">
                                <p className="text-2xl font-bold text-[#B5A1D6]">{Math.floor(PREVIEW_LIMIT / 60)} min</p>
                                <p className="text-xs text-gray-600 mt-1">Free Preview</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-2xl">
                                <p className="text-2xl font-bold text-[#B5A1D6]">₹2/min</p>
                                <p className="text-xs text-gray-600 mt-1">After Preview</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-2xl">
                                <p className="text-2xl font-bold text-[#B5A1D6]">{Math.floor(elapsed)}s</p>
                                <p className="text-xs text-gray-600 mt-1">Watched</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GatedVideoPlayer;
