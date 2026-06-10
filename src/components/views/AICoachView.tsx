import { useState, useEffect } from "react";
import { useStore } from "@/contexts/StoreContext";
import { BrainCircuit, Zap, AlertTriangle, Lightbulb, Loader2, RefreshCw, Trophy, Star, Target as TargetIcon, Clock, Flame } from "lucide-react";
import { generateCompletion } from "@/lib/llm";

export function AICoachView() {
  const { tasks, focusSessions, xp, level, goals, habits } = useStore();
  const [insights, setInsights] = useState<{ focus: string, burnout: string, summary: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const prompt = `You are an AI Productivity Coach.
Analyze the user's data:
${JSON.stringify({ xp, level, tasksCount: tasks.length, completedTasks: tasks.filter(t => t.status === "Completed").length, overdueTasks: tasks.filter(t => t.dueDate < new Date().toISOString().slice(0, 10)).length, focusSessionsMinutes: focusSessions.reduce((acc, f) => acc + f.durationMinutes, 0), goalsCount: goals.length, habitsCount: habits.length })}

Return a valid JSON object with EXACTLY these 3 keys:
{
  "focus": "A short, actionable 1-2 sentence recommendation for what they should focus on today.",
  "burnout": "A 1-2 sentence analysis of their burnout risk (mention if it's low/medium/high) and advice.",
  "summary": "A 1-2 sentence summary of their overall progress and level."
}
No markdown formatting, just the raw JSON string.`;

      const res = await generateCompletion([{ role: "user", content: prompt }]);
      let cleanRes = res.replace(/```json/gi, "").replace(/```/g, "").trim();
      if (!cleanRes.startsWith("{")) {
        cleanRes = cleanRes.substring(cleanRes.indexOf("{"));
      }
      if (!cleanRes.endsWith("}")) {
        cleanRes = cleanRes.substring(0, cleanRes.lastIndexOf("}") + 1);
      }
      
      const data = JSON.parse(cleanRes);
      
      setInsights({
        focus: data.focus || "Focus on your high priority tasks today.",
        burnout: data.burnout || "Your burnout risk is currently stable. Keep up a good pace.",
        summary: data.summary || "You are doing great! Keep leveling up."
      });
    } catch (e) {
      console.error(e);
      setInsights({
        focus: "Error connecting to AI Coach. Please check your network or API key.",
        burnout: "Error connecting to AI Coach.",
        summary: "Error connecting to AI Coach."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-primary" /> AI Coach
          </h2>
          <p className="text-muted-foreground mt-1">Smart recommendations powered by DeepSeek-v4-Pro.</p>
        </div>
        <button 
          onClick={fetchInsights} 
          disabled={isLoading}
          className="h-10 px-4 rounded-xl glass border border-white/10 hover:bg-white/5 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-primary" : ""}`} />
          Refresh Insights
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Today's Focus */}
        <div className="glass rounded-3xl p-6 border border-white/5 hover:border-primary/30 transition-colors relative overflow-hidden">
          {isLoading && <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-semibold">Today's Focus</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{insights ? insights.focus : "Loading insights..."}</p>
        </div>

        {/* Burnout Risk */}
        <div className="glass rounded-3xl p-6 border border-white/5 hover:border-amber-400/30 transition-colors relative overflow-hidden">
          {isLoading && <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
              <AlertTriangle className={`h-5 w-5 text-amber-400`} />
            </div>
            <h3 className="font-semibold">Burnout Risk</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{insights ? insights.burnout : "Loading insights..."}</p>
        </div>

        {/* Weekly Summary */}
        <div className="glass rounded-3xl p-6 border border-white/5 hover:border-primary/30 transition-colors relative overflow-hidden">
          {isLoading && <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Weekly Summary</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{insights ? insights.summary : "Loading insights..."}</p>
        </div>
      </div>

      {/* Gamification Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" /> Progression</h3>
            <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold font-display uppercase tracking-wider">Level {level}</div>
          </div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Experience</span>
            <span className="font-medium text-foreground">{xp} / {level * 100} XP</span>
          </div>
          <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden mb-6">
            <div className="h-full gradient-primary transition-all duration-1000" style={{ width: `${(xp / (level * 100)) * 100}%` }} />
          </div>
          <p className="text-sm text-muted-foreground">Complete tasks, goals, habits, and focus sessions to earn XP and level up your productivity.</p>
        </div>

        <div className="glass rounded-3xl p-6 border border-white/5">
          <h3 className="font-semibold mb-6 flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> Achievements</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border ${tasks.filter(t => t.status === "Completed").length >= 5 ? "border-primary/50 bg-primary/10 text-foreground" : "border-white/5 bg-white/5 text-muted-foreground opacity-50"}`}>
              <Zap className="h-5 w-5 mb-2" />
              <h4 className="font-medium text-sm">Task Master</h4>
              <p className="text-xs mt-1">Complete 5 tasks</p>
            </div>
            <div className={`p-4 rounded-2xl border ${focusSessions.length >= 3 ? "border-accent/50 bg-accent/10 text-foreground" : "border-white/5 bg-white/5 text-muted-foreground opacity-50"}`}>
              <Clock className="h-5 w-5 mb-2" />
              <h4 className="font-medium text-sm">Deep Worker</h4>
              <p className="text-xs mt-1">Log 3 focus sessions</p>
            </div>
            <div className={`p-4 rounded-2xl border ${goals.some(g => g.progress >= g.target) ? "border-yellow-500/50 bg-yellow-500/10 text-foreground" : "border-white/5 bg-white/5 text-muted-foreground opacity-50"}`}>
              <TargetIcon className="h-5 w-5 mb-2" />
              <h4 className="font-medium text-sm">Goal Getter</h4>
              <p className="text-xs mt-1">Achieve 1 goal</p>
            </div>
            <div className={`p-4 rounded-2xl border ${habits.some(h => h.streak >= 3) ? "border-green-500/50 bg-green-500/10 text-foreground" : "border-white/5 bg-white/5 text-muted-foreground opacity-50"}`}>
              <Flame className="h-5 w-5 mb-2" />
              <h4 className="font-medium text-sm">Consistency</h4>
              <p className="text-xs mt-1">Reach a 3-day habit streak</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
