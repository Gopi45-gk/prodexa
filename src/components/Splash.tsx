import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function Splash({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 3200;
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / duration) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setTimeout(onDone, 300);
      }
    }, 30);
    return () => clearInterval(id);
  }, [onDone]);

  const particles = Array.from({ length: 40 });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/3 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-pulse-glow" />
        <div className="absolute right-1/4 bottom-1/3 h-96 w-96 rounded-full bg-accent/30 blur-3xl animate-pulse-glow delay-500" />
      </div>
      {/* particles */}
      <div className="pointer-events-none absolute inset-0">
        {particles.map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white/40 animate-float-slow"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="relative mb-8 animate-logo-in">
          <div className="absolute inset-0 rounded-3xl bg-primary/40 blur-2xl animate-pulse-glow" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl gradient-primary shadow-glow">
            <CheckCircle2 className="h-14 w-14 text-primary-foreground" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight animate-fade-up delay-300">
          <span className="gradient-text">SMART TASK MANAGER</span>
        </h1>
        <p className="mt-4 text-muted-foreground tracking-[0.3em] text-sm md:text-base animate-fade-up delay-500">
          ORGANIZE • PRIORITIZE • ACHIEVE
        </p>

        {/* Circular loader */}
        <div className="mt-12 relative animate-fade-up delay-700">
          <svg className="h-16 w-16 animate-spin-slow" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" stroke="oklch(1 0 0 / 0.1)" strokeWidth="3" fill="none" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke="url(#g)" strokeWidth="3" strokeLinecap="round"
              strokeDasharray="80 200"
            />
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0%" stopColor="oklch(0.72 0.19 285)" />
                <stop offset="100%" stopColor="oklch(0.78 0.17 200)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Progress bar */}
        <div className="mt-10 w-72 animate-fade-up delay-1000">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full gradient-primary transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-center text-xs text-muted-foreground tabular-nums">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
}
