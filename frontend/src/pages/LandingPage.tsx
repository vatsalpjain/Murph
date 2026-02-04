import { useEffect, useRef } from 'react';

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

// Landing page component with animated background and hero section
const LandingPage = () => {
    const blobsRef = useRef<HTMLDivElement[]>([]);

    // Mouse parallax effect - creates interactive movement based on cursor position
    useEffect(() => {
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        let animationFrameId: number;

        const handleMouseMove = (e: MouseEvent) => {
            // Normalize mouse position to -1 to 1 range
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        const animate = () => {
            // Smooth interpolation for fluid movement
            currentX += (mouseX - currentX) * 0.05;
            currentY += (mouseY - currentY) * 0.05;

            // Apply parallax effect to each blob with varying depth
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

    const setBlobRef = (index: number) => (el: HTMLDivElement | null) => {
        if (el) blobsRef.current[index] = el;
    };

    return (
        <>
            <style>{customStyles}</style>
            <div className="min-h-screen w-full bg-black overflow-hidden relative font-bebas">

                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-[1000] px-12 py-8 flex justify-end items-center">
                    <div className="flex gap-5">
                        <button className="font-sans text-base font-medium px-10 py-4 rounded-xl cursor-pointer transition-all duration-300 ease-out bg-transparent border border-white/30 text-white hover:border-teal-400 hover:text-teal-400 hover:shadow-[0_0_20px_rgba(0,200,180,0.4),0_0_40px_rgba(0,200,180,0.2),inset_0_0_20px_rgba(0,200,180,0.05)] hover:-translate-y-0.5">
                            Login
                        </button>
                        <button className="font-sans text-base font-medium px-10 py-4 rounded-xl cursor-pointer transition-all duration-300 ease-out bg-gradient-to-br from-teal-500 to-blue-600 border-transparent text-white hover:from-teal-400 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(0,200,180,0.6),0_0_60px_rgba(0,180,160,0.4),0_0_90px_rgba(0,150,200,0.2)] hover:-translate-y-0.5">
                            Sign Up
                        </button>
                    </div>
                </nav>


                {/* Animated Background Blobs */}
                <div className="fixed inset-0 z-[1] overflow-hidden pointer-events-none">
                    {/* Primary blue blob - top left */}
                    <div
                        ref={setBlobRef(0)}
                        className="absolute w-[700px] h-[700px] rounded-full blur-[100px] opacity-80 mix-blend-screen animate-float1"
                        style={{ background: 'radial-gradient(circle, rgba(0,120,200,0.9) 0%, rgba(0,80,150,0.5) 40%, transparent 70%)', top: '15%', left: '5%' }}
                    />
                    {/* Teal blob - right side */}
                    <div
                        ref={setBlobRef(1)}
                        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-80 mix-blend-screen animate-float2"
                        style={{ background: 'radial-gradient(circle, rgba(0,200,170,0.85) 0%, rgba(0,130,120,0.4) 40%, transparent 70%)', top: '40%', right: '0%' }}
                    />
                    {/* Blue blob - bottom center */}
                    <div
                        ref={setBlobRef(2)}
                        className="absolute w-[550px] h-[550px] rounded-full blur-[100px] opacity-80 mix-blend-screen animate-float3"
                        style={{ background: 'radial-gradient(circle, rgba(40,100,180,0.75) 0%, rgba(20,60,130,0.4) 40%, transparent 70%)', bottom: '5%', left: '25%' }}
                    />
                    {/* Teal accent blob - top right */}
                    <div
                        ref={setBlobRef(3)}
                        className="absolute w-[450px] h-[450px] rounded-full blur-[100px] opacity-70 mix-blend-screen animate-float1"
                        style={{ background: 'radial-gradient(circle, rgba(0,170,150,0.7) 0%, rgba(0,100,100,0.3) 40%, transparent 70%)', top: '5%', right: '20%', animationDelay: '2s' }}
                    />
                    {/* Purple accent blob - right center */}
                    <div
                        ref={setBlobRef(4)}
                        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-60 mix-blend-screen animate-float2"
                        style={{ background: 'radial-gradient(circle, rgba(80,60,180,0.6) 0%, rgba(40,30,120,0.3) 40%, transparent 70%)', bottom: '30%', right: '35%', animationDelay: '1s' }}
                    />
                    {/* Cyan accent blob - left side */}
                    <div
                        ref={setBlobRef(5)}
                        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-65 mix-blend-screen animate-float3"
                        style={{ background: 'radial-gradient(circle, rgba(0,160,180,0.65) 0%, rgba(0,90,100,0.3) 40%, transparent 70%)', top: '60%', left: '-5%', animationDelay: '0.5s' }}
                    />
                </div>

                {/* Hero Section */}
                <main className="relative z-10 h-screen flex justify-center items-center">
                    <h1
                        className="font-bebas text-[clamp(150px,28vw,400px)] font-normal text-white tracking-wider select-none animate-logo"
                        style={{
                            textShadow: '0 0 40px rgba(255,255,255,0.1), 0 0 80px rgba(0,150,180,0.15)',
                        }}
                    >
                        MURPH
                    </h1>
                </main>
            </div>
        </>
    );
};

export default LandingPage;
