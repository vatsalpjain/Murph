import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Custom styles for animations
const customStyles = `
  @keyframes float1 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    20% { transform: translate(100px, 50px) rotate(5deg); }
    40% { transform: translate(50px, -80px) rotate(-3deg); }
    60% { transform: translate(-60px, -40px) rotate(4deg); }
    80% { transform: translate(-80px, 60px) rotate(-2deg); }
  }
  @keyframes float2 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    20% { transform: translate(-80px, -60px) rotate(-4deg); }
    40% { transform: translate(60px, 100px) rotate(3deg); }
    60% { transform: translate(100px, -30px) rotate(-5deg); }
    80% { transform: translate(-40px, 70px) rotate(2deg); }
  }
  @keyframes float3 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(70px, -90px) rotate(3deg); }
    50% { transform: translate(-100px, 40px) rotate(-4deg); }
    75% { transform: translate(80px, 80px) rotate(5deg); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.7; filter: blur(100px); }
    50% { opacity: 0.9; filter: blur(120px); }
  }
  @keyframes fadeInScale {
    0% { opacity: 0; transform: scale(0.92) translateY(20px); filter: blur(8px); }
    40% { opacity: 0.6; filter: blur(2px); }
    100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
  }
  .animate-float1 { animation: float1 8s ease-in-out infinite, pulse-glow 4s ease-in-out infinite; }
  .animate-float2 { animation: float2 10s ease-in-out infinite, pulse-glow 5s ease-in-out infinite 1s; }
  .animate-float3 { animation: float3 9s ease-in-out infinite, pulse-glow 6s ease-in-out infinite 0.5s; }
  .animate-logo { animation: fadeInScale 2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .font-bebas { font-family: 'Bebas Neue', sans-serif; }
`;

const courseShowcase = [
    {
        id: 1,
        university: 'Stanford School of Engineering',
        instructor: 'Dr. Anika Shah',
        title: 'Human-Centered Interface Design',
        about: 'Design intuitive systems with modern UI patterns and research-backed decisions.',
        images: [
            'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop',
        ],
    },
    {
        id: 2,
        university: 'MIT Media Lab',
        instructor: 'Prof. Lucas Chen',
        title: 'Interaction Motion & Micro-UX',
        about: 'Build motion-first experiences that feel responsive, alive, and delightful.',
        images: [
            'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop',
        ],
    },
    {
        id: 3,
        university: 'UC Berkeley',
        instructor: 'Avery Martinez',
        title: 'Product Design Systems',
        about: 'Design scalable, consistent component systems for modern products.',
        images: [
            'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1600&auto=format&fit=crop',
        ],
    },
];

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, setShowAuthModal, setAuthModalMode, logout } = useAuth();
    const blobsRef = useRef<HTMLDivElement[]>([]);
    const [scrolled, setScrolled] = useState(false);
    const [slideIndex, setSlideIndex] = useState<Record<number, number>>({});
    const [activeCourseIndex, setActiveCourseIndex] = useState(0);

    const courseImagesCount = useMemo(() => {
        return courseShowcase.reduce<Record<number, number>>((acc, course) => {
            acc[course.id] = course.images.length;
            return acc;
        }, {});
    }, []);

    // Mouse parallax effect
    useEffect(() => {
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        let animationFrameId: number;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        const animate = () => {
            currentX += (mouseX - currentX) * 0.05;
            currentY += (mouseY - currentY) * 0.05;

            blobsRef.current.forEach((blob, index) => {
                if (blob) {
                    const depth = (index + 1) * 15;
                    const rotateIntensity = (index + 1) * 2;
                    const moveX = currentX * depth;
                    const moveY = currentY * depth;
                    const rotate = currentX * rotateIntensity;
                    blob.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotate}deg)`;
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        document.addEventListener('mousemove', handleMouseMove);
        animate();

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 80);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setSlideIndex((prev) => {
                const next: Record<number, number> = { ...prev };
                const course = courseShowcase[activeCourseIndex % courseShowcase.length];
                const total = courseImagesCount[course.id] ?? course.images.length;
                const current = prev[course.id] ?? 0;
                next[course.id] = (current + 1) % total;
                return next;
            });
            setActiveCourseIndex((prev) => (prev + 1) % courseShowcase.length);
        }, 3000);

        return () => window.clearInterval(interval);
    }, [activeCourseIndex, courseImagesCount]);

    const setBlobRef = (index: number) => (el: HTMLDivElement | null) => {
        if (el) blobsRef.current[index] = el;
    };

    return (
        <>
            <style>{customStyles}</style>
            <div className="min-h-screen w-full bg-black relative font-bebas text-white overflow-x-hidden">

                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-[1000] px-8 md:px-12 py-5 flex items-center justify-between bg-black border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div
                            className={`transition-all duration-500 ease-out ${scrolled ? 'scale-100 opacity-100' : 'scale-75 opacity-0 -translate-y-2'
                                }`}
                        >
                            <span className="font-bebas text-3xl tracking-[0.3em] cursor-pointer" onClick={() => navigate('/')}>MURPH</span>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="font-sans text-sm md:text-base font-medium px-6 md:px-10 py-3 md:py-4 rounded-xl cursor-pointer transition-all duration-300 ease-out bg-transparent border border-white/30 text-white hover:border-teal-400 hover:text-teal-400 hover:shadow-[0_0_20px_rgba(0,200,180,0.4),0_0_40px_rgba(0,200,180,0.2),inset_0_0_20px_rgba(0,200,180,0.05)] hover:-translate-y-0.5">
                                    Dashboard
                                </button>
                                <div className="flex items-center gap-3">
                                    <span className="text-white/80 text-sm hidden md:block">
                                        {user?.name}
                                    </span>
                                    <button
                                        onClick={logout}
                                        className="font-sans text-sm md:text-base font-medium px-6 md:px-10 py-3 md:py-4 rounded-xl cursor-pointer transition-all duration-300 ease-out bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:-translate-y-0.5"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => { setAuthModalMode('login'); setShowAuthModal(true); }}
                                    className="font-sans text-sm md:text-base font-medium px-6 md:px-10 py-3 md:py-4 rounded-xl cursor-pointer transition-all duration-300 ease-out bg-transparent border border-white/30 text-white hover:border-teal-400 hover:text-teal-400 hover:shadow-[0_0_20px_rgba(0,200,180,0.4),0_0_40px_rgba(0,200,180,0.2),inset_0_0_20px_rgba(0,200,180,0.05)] hover:-translate-y-0.5">
                                    Log In
                                </button>
                                <button
                                    onClick={() => { setAuthModalMode('signup'); setShowAuthModal(true); }}
                                    className="font-sans text-sm md:text-base font-medium px-6 md:px-10 py-3 md:py-4 rounded-xl cursor-pointer transition-all duration-300 ease-out bg-gradient-to-br from-teal-500 to-blue-600 border-transparent text-white hover:from-teal-400 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(0,200,180,0.6),0_0_60px_rgba(0,180,160,0.4),0_0_90px_rgba(0,150,200,0.2)] hover:-translate-y-0.5">
                                    Join for Free
                                </button>
                            </>
                        )}
                    </div>
                </nav>


                {/* Animated Background Blobs */}
                <div className="fixed inset-0 z-[1] overflow-hidden pointer-events-none">
                    <div
                        ref={setBlobRef(0)}
                        className="absolute w-[700px] h-[700px] rounded-full blur-[100px] opacity-80 mix-blend-screen animate-float1"
                        style={{ background: 'radial-gradient(circle, rgba(0,120,200,0.9) 0%, rgba(0,80,150,0.5) 40%, transparent 70%)', top: '15%', left: '5%' }}
                    />
                    <div
                        ref={setBlobRef(1)}
                        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-80 mix-blend-screen animate-float2"
                        style={{ background: 'radial-gradient(circle, rgba(0,200,170,0.85) 0%, rgba(0,130,120,0.4) 40%, transparent 70%)', top: '40%', right: '0%' }}
                    />
                    <div
                        ref={setBlobRef(2)}
                        className="absolute w-[550px] h-[550px] rounded-full blur-[100px] opacity-80 mix-blend-screen animate-float3"
                        style={{ background: 'radial-gradient(circle, rgba(40,100,180,0.75) 0%, rgba(20,60,130,0.4) 40%, transparent 70%)', bottom: '5%', left: '25%' }}
                    />
                    <div
                        ref={setBlobRef(3)}
                        className="absolute w-[450px] h-[450px] rounded-full blur-[100px] opacity-70 mix-blend-screen animate-float1"
                        style={{ background: 'radial-gradient(circle, rgba(0,170,150,0.7) 0%, rgba(0,100,100,0.3) 40%, transparent 70%)', top: '5%', right: '20%', animationDelay: '2s' }}
                    />
                    <div
                        ref={setBlobRef(4)}
                        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-60 mix-blend-screen animate-float2"
                        style={{ background: 'radial-gradient(circle, rgba(80,60,180,0.6) 0%, rgba(40,30,120,0.3) 40%, transparent 70%)', bottom: '30%', right: '35%', animationDelay: '1s' }}
                    />
                    <div
                        ref={setBlobRef(5)}
                        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-65 mix-blend-screen animate-float3"
                        style={{ background: 'radial-gradient(circle, rgba(0,160,180,0.65) 0%, rgba(0,90,100,0.3) 40%, transparent 70%)', top: '60%', left: '-5%', animationDelay: '0.5s' }}
                    />
                </div>

                {/* Hero Section */}
                <main className="relative z-10 h-screen flex flex-col justify-center items-center text-center px-6">
                    <h1
                        className={`font-bebas text-[clamp(140px,26vw,360px)] font-normal tracking-wider select-none animate-logo transition-transform duration-700 ease-out ${scrolled ? 'scale-75 opacity-70' : 'scale-100'
                            }`}
                        style={{
                            textShadow: '0 0 40px rgba(255,255,255,0.1), 0 0 80px rgba(0,150,180,0.15)',
                        }}
                    >
                        MURPH
                    </h1>
                    <p className="font-sans text-base md:text-lg text-white/70 max-w-2xl -mt-4">
                        Learn fast with ultra-short lessons. Scroll down to explore your courses and video shorts.
                    </p>
                    <div className="mt-8 flex items-center gap-3 text-white/70">
                        <span className="font-sans text-xs uppercase tracking-[0.4em]">Scroll</span>
                        <span className="h-10 w-px bg-white/30" />
                        <span className="font-sans text-xs">↓</span>
                    </div>
                </main>

                {/* Course Showcase */}
                <section className="relative z-10 px-6 md:px-16 pb-24">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-normal">Featured Courses</h2>
                                <p className="font-sans text-white/70 mt-3 max-w-2xl">
                                    Explore standout programs from top universities. Covers rotate in a gentle slideshow.
                                </p>
                            </div>
                            <button className="font-sans text-sm font-medium px-6 py-3 rounded-full border border-white/30 text-white/80 hover:text-white hover:border-white/60 transition">
                                Browse catalog
                            </button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {courseShowcase.map((course) => {
                                const activeIndex = slideIndex[course.id] ?? 0;
                                const activeImage = course.images[activeIndex];

                                return (
                                    <div
                                        key={course.id}
                                        className="relative rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-[0_0_35px_rgba(0,0,0,0.45)] h-[420px]"
                                    >
                                        <div className="absolute inset-0">
                                            <img
                                                src={activeImage}
                                                alt={course.title}
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        </div>

                                        <div className="relative z-10 h-full flex flex-col justify-end p-6">
                                            <div className="font-sans text-xs uppercase tracking-[0.3em] text-white/70">
                                                {course.university}
                                            </div>
                                            <h3 className="text-2xl mt-2">{course.title}</h3>
                                            <p className="font-sans text-sm text-white/70 mt-2">{course.about}</p>
                                            <div className="font-sans text-xs text-white/60 mt-4">
                                                Instructor: {course.instructor}
                                            </div>
                                        </div>

                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            {course.images.map((_, index) => (
                                                <span
                                                    key={index}
                                                    className={`h-2 w-2 rounded-full transition ${index === activeIndex ? 'bg-white' : 'bg-white/40'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative z-10 px-6 md:px-16 pb-16">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white/60">
                        <p className="font-sans text-sm">© 2026 Murph. All rights reserved.</p>
                        <div className="flex gap-6 font-sans text-sm">
                            <span className="hover:text-white transition">Privacy</span>
                            <span className="hover:text-white transition">Terms</span>
                            <span className="hover:text-white transition">Support</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default LandingPage;
