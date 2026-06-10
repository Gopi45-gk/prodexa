import { useStore } from "@/contexts/StoreContext";
import { Trophy, Star, Shield, Zap, Medal } from "lucide-react";

export function AchievementsView() {
  const { xp, level, tasks, habits, focusSessions } = useStore();

  const achievements = [
    { id: 1, title: "First Task", desc: "Complete your first task", icon: Star, done: tasks.some(t => t.status === "Completed") },
    { id: 2, title: "Focus Champion", desc: "Log 100 focus minutes", icon: Zap, done: focusSessions.reduce((a,b)=>a+b.durationMinutes,0) >= 100 },
    { id: 3, title: "Habit Master", desc: "Reach a 7-day streak", icon: Shield, done: habits.some(h => h.streak >= 7) },
    { id: 4, title: "Productivity Hero", desc: "Reach Level 5", icon: Medal, done: level >= 5 },
  ];

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold flex items-center gap-3">
          <Trophy className="h-8 w-8 text-accent" /> Achievements
        </h2>
        <p className="text-muted-foreground mt-1">Unlock badges and level up your productivity.</p>
      </div>

      <div className="glass rounded-3xl p-6 border border-white/5 mb-8 flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Current Level</div>
          <div className="text-4xl font-display font-bold text-primary">Level {level}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Total Experience</div>
          <div className="text-2xl font-bold">{xp} XP</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map(a => (
          <div key={a.id} className={`glass rounded-2xl p-6 border transition-all ${a.done ? "border-accent/30 bg-accent/5" : "border-white/5 opacity-60 grayscale"}`}>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${a.done ? "bg-accent/20 text-accent shadow-glow" : "bg-white/10 text-muted-foreground"}`}>
              <a.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">{a.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
