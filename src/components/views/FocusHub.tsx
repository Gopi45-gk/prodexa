import { useState, useEffect, useRef } from "react";
import { useStore } from "@/contexts/StoreContext";
import { Play, Pause, Square, Volume2, Maximize2, SkipForward } from "lucide-react";

export function FocusHub() {
  const { logFocusSession } = useStore();
  const [mode, setMode] = useState<"25/5" | "50/10" | "90/15" | "Custom">("25/5");
  const [customMins, setCustomMins] = useState(25);
  const [phase, setPhase] = useState<"Focus" | "Break">("Focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sound, setSound] = useState<"None" | "Rain" | "Forest" | "Ocean" | "White Noise">("None");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (mode === "Custom") {
      setTimeLeft(customMins * 60);
    } else {
      setTimeLeft(parseInt(mode.split("/")[0]) * 60);
    }
    setPhase("Focus");
    setIsActive(false);
  }, [mode, customMins]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      
      try {
        const notifyAudio = new Audio("https://cdn.freesound.org/previews/320/320655_527080-lq.mp3");
        notifyAudio.play().catch(() => {});
      } catch (e) {}
      
      if (phase === "Focus") {
        const focusMins = mode === "Custom" ? customMins : parseInt(mode.split("/")[0]);
        logFocusSession(focusMins);
        setPhase("Break");
        const breakMins = mode === "Custom" ? 5 : parseInt(mode.split("/")[1]);
        setTimeLeft(breakMins * 60);
      } else {
        setPhase("Focus");
        const focusMins = mode === "Custom" ? customMins : parseInt(mode.split("/")[0]);
        setTimeLeft(focusMins * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, phase, customMins, logFocusSession]);

  useEffect(() => {
    const audioMap: Record<string, string> = {
      "Rain": "https://cdn.freesound.org/previews/183/18382_18765-lq.mp3",
      "Forest": "https://cdn.freesound.org/previews/339/339324_5121236-lq.mp3",
      "Ocean": "https://cdn.freesound.org/previews/400/400632_5121236-lq.mp3",
      "White Noise": "https://cdn.freesound.org/previews/23/23018_20412-lq.mp3"
    };

    if (sound !== "None" && audioMap[sound]) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.loop = true;
      }
      audioRef.current.src = audioMap[sound];
      audioRef.current.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [sound]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setPhase("Focus");
    const focusMins = mode === "Custom" ? customMins : parseInt(mode.split("/")[0]);
    setTimeLeft(focusMins * 60);
  };
  const skip = () => {
    setTimeLeft(0);
    setIsActive(true);
  };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="animate-fade-up h-full flex flex-col items-center justify-center relative">
      <div className="absolute top-0 right-0 p-4">
        <button className="h-10 w-10 glass rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Maximize2 className="h-5 w-5" />
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold mb-2">Focus Hub</h2>
        <p className="text-muted-foreground max-w-md mx-auto">Eliminate distractions and get deep work done.</p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <div className={`h-2 w-2 rounded-full ${phase === "Focus" ? "bg-primary animate-pulse" : "bg-accent animate-pulse"}`} />
          <span className="text-sm font-medium">{phase} Phase</span>
        </div>
      </div>

      <div className="flex gap-2 p-1 glass rounded-2xl mb-6 border border-white/5 overflow-x-auto max-w-full">
        {["25/5", "50/10", "90/15", "Custom"].map(m => (
          <button 
            key={m} 
            onClick={() => setMode(m as any)}
            className={`whitespace-nowrap px-6 py-2 rounded-xl text-sm font-medium transition-all ${mode === m ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "Custom" && (
        <div className="flex items-center gap-2 mb-6 animate-fade-in">
          <span className="text-sm text-muted-foreground">Focus Mins:</span>
          <input 
            type="number" 
            min="1"
            value={customMins} 
            onChange={e => setCustomMins(Number(e.target.value))} 
            className="input w-20 h-8 text-center text-sm bg-white/5" 
          />
        </div>
      )}

      <div className="relative w-72 h-72 rounded-full glass border border-white/10 flex items-center justify-center mb-12 shadow-glow">
        <div className="absolute inset-2 rounded-full border-4 border-white/5" />
        <div className="font-display font-bold text-7xl tabular-nums tracking-tighter">{mins}:{secs}</div>
      </div>

      <div className="flex gap-4 mb-16">
        <button onClick={toggle} className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground shadow-glow hover:scale-[1.05] transition-transform">
          {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
        </button>
        <button onClick={skip} className="h-16 w-16 rounded-2xl glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors border border-white/5">
          <SkipForward className="h-5 w-5" />
        </button>
        <button onClick={reset} className="h-16 w-16 rounded-2xl glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors border border-white/5">
          <Square className="h-5 w-5" />
        </button>
      </div>

      <div className="glass rounded-2xl p-4 flex items-center gap-4 w-full max-w-md border border-white/5">
        <Volume2 className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1 flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          {["None", "Rain", "Forest", "Ocean", "White Noise"].map(s => (
            <button 
              key={s} 
              onClick={() => setSound(s as any)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-xs transition-colors ${sound === s ? "bg-accent/20 text-accent font-medium border border-accent/20" : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
