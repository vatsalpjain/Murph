import { useRef, useState } from 'react';

export interface Short {
    id: string;
    title: string;
    courseTitle: string;
    instructor?: string;
    videoPath: string;
    courseUrl: string;
    thumbnail?: string;
}

interface CourseShortsPreviewProps {
    shorts: Short[];
}

const CourseShortsPreview = ({ shorts }: CourseShortsPreviewProps) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

    const handleMouseEnter = (shortId: string) => {
        setHoveredId(shortId);
        const video = videoRefs.current[shortId];
        if (video) {
            video.play().catch((err) => {
                console.warn('Video play failed:', err);
            });
        }
    };

    const handleMouseLeave = (shortId: string) => {
        setHoveredId(null);
        const video = videoRefs.current[shortId];
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    };

    const handleClick = (courseUrl: string) => {
        window.open(courseUrl, '_blank');
    };

    return (
        <section className="bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-2">Quick Course Previews</h2>
                <p className="text-gray-400 mb-8">Hover to watch bite-sized course highlights</p>

                {/* Horizontal Scroll Container */}
                <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-6 min-w-min">
                        {shorts.map((short) => (
                            <div
                                key={short.id}
                                className="relative flex-shrink-0 group cursor-pointer"
                                onMouseEnter={() => handleMouseEnter(short.id)}
                                onMouseLeave={() => handleMouseLeave(short.id)}
                                onClick={() => handleClick(short.courseUrl)}
                            >
                                {/* Video Card */}
                                <div
                                    className="relative rounded-lg overflow-hidden bg-gray-800 border border-gray-700 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1"
                                    style={{ aspectRatio: '9 / 16', width: '220px' }}
                                >
                                    {/* Video */}
                                    <video
                                        ref={(el) => {
                                            if (el) videoRefs.current[short.id] = el;
                                        }}
                                        src={short.videoPath}
                                        className="absolute inset-0 h-full w-full object-cover"
                                        muted
                                        playsInline
                                    />

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />

                                    {/* Content Overlay */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
                                        <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                                            {short.courseTitle}
                                        </div>
                                        <h3 className="text-base font-semibold mt-2 leading-tight text-white line-clamp-2">
                                            {short.title}
                                        </h3>
                                        {short.instructor && (
                                            <p className="text-xs text-gray-300 mt-2">{short.instructor}</p>
                                        )}
                                    </div>

                                    {/* Play Button Indicator (shown when not playing) */}
                                    {hoveredId !== short.id && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition">
                                            <div className="w-12 h-12 rounded-full border-2 border-white/70 flex items-center justify-center group-hover:border-white group-hover:scale-110 transition">
                                                <div className="w-0 h-0 border-l-[6px] border-l-white/70 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1 group-hover:border-l-white transition" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Click Indicator */}
                                    <div className="absolute bottom-4 right-4 text-xs uppercase tracking-wider text-white/60 font-semibold group-hover:text-white/90 transition">
                                        Watch
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CourseShortsPreview;
