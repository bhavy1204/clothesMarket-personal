import { useEffect, useState } from "react";

// Standalone "Coming Soon" page. No external deps beyond a Google Font
// loaded via <link> — drop this in as a route component.
//
// Usage: <Route path="/coming-soon" element={<ComingSoonPage />} />
export default function ComingSoon({
  title = "Something great is brewing",
  subtitle = "We're putting the final touches on it. Stay tuned!",
  onNotifySubmit, // optional (email) => void
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Load the handwritten font once
  useEffect(() => {
    const id = "coming-soon-font";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    onNotifySubmit?.(email.trim());
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex items-center justify-center px-4 sm:px-6">
      {/* Floating blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 sm:w-96 sm:h-96 bg-purple-500/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -right-20 w-64 h-64 sm:w-80 sm:h-80 bg-indigo-400/20 rounded-full blur-3xl animate-float-slower" />
        <div className="absolute bottom-0 left-1/4 w-56 h-56 sm:w-72 sm:h-72 bg-pink-400/20 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Twinkling stars */}
      <div className="pointer-events-none absolute inset-0">
        {STAR_POSITIONS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">
        <span className="text-xs sm:text-sm tracking-[0.3em] uppercase text-purple-300/80 mb-3 animate-fade-in">
          Under construction
        </span>

        {/* Handwritten "Coming soon" */}
        <h1
          className="select-none text-white leading-none animate-write-in"
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "clamp(3.5rem, 12vw, 7rem)",
          }}
        >
          Coming soon
          <Squiggle className="mx-auto -mt-2 w-40 sm:w-56 animate-draw-line" />
        </h1>

        <h2 className="mt-6 text-lg sm:text-2xl font-semibold text-white/90 animate-fade-in-delay">
          {title}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-purple-200/70 animate-fade-in-delay">
          {subtitle}
        </p>

      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -30px); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-25px, 20px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.9; }
        }
        @keyframes write-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes draw-line {
          from { stroke-dashoffset: 300; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float-slow { animation: float-slow 9s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 12s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-write-in { animation: write-in 0.8s ease-out both; }
        .animate-draw-line { animation: draw-line 1.4s 0.6s ease-out both; }
        .animate-fade-in { animation: fade-in 0.7s ease-out both; }
        .animate-fade-in-delay { animation: fade-in 0.7s 0.3s ease-out both; }
        .animate-fade-in-delay-2 { animation: fade-in 0.7s 0.55s ease-out both; }
      `}</style>
    </div>
  );
}

// A little hand-drawn underline squiggle beneath the heading
function Squiggle({ className }) {
  return (
    <svg
      viewBox="0 0 200 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <path
        d="M2 12 C 40 2, 70 18, 100 10 C 130 2, 160 18, 198 8"
        className="text-purple-400"
        pathLength="300"
        strokeDasharray="300"
      />
    </svg>
  );
}

const STAR_POSITIONS = [
  { top: "10%", left: "15%", size: "3px", delay: "0s" },
  { top: "20%", left: "80%", size: "2px", delay: "0.5s" },
  { top: "35%", left: "45%", size: "2px", delay: "1s" },
  { top: "60%", left: "10%", size: "3px", delay: "1.5s" },
  { top: "70%", left: "85%", size: "2px", delay: "0.8s" },
  { top: "85%", left: "55%", size: "3px", delay: "1.2s" },
  { top: "15%", left: "60%", size: "2px", delay: "2s" },
  { top: "50%", left: "90%", size: "2px", delay: "0.3s" },
];