import { useStore } from "@/contexts/StoreContext";
import { Sparkles, CheckCircle2, Clock, ListTodo, AlertCircle, Target, TrendingUp, Brain, CalendarDays } from "lucide-react";

export function DashboardHome({ userDisplayName }: { userDisplayName: string }) {
  const { xp, level, tasks, goals, habits, focusSessions, aiReports } = useStore();
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const pendingTasks = tasks.filter(t => t.status !== "Completed" && t.status !== "Archived").length;
  
  const now = new Date();
  const overdueTasks = tasks.filter(t => t.status !== "Completed" && t.dueDate && new Date(t.dueDate) < now).length;
  
  const focusTime = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const focusHours = (focusTime / 60).toFixed(1);
  
  const goalCompletion = goals.filter(g => g.progress >= g.target).length;
  
  // Calculate today's habit completion
  const todayStr = new Date().toISOString().slice(0, 10);
  const habitsDoneToday = habits.filter(h => h.completions.includes(todayStr)).length;
  
  const prodScore = Math.min(100, Math.round((completedTasks * 5) + (goalCompletion * 20) + (habitsDoneToday * 10) + (focusTime / 10)));
  
  const latestAiReport = aiReports.length > 0 ? aiReports[aiReports.length - 1].content.slice(0, 150) + "..." : "No recent insights. Visit the AI Coach to generate your daily report!";

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="glass rounded-3xl p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Sparkles className="h-32 w-32 text-primary" />
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-4xl font-bold mb-2">Good Morning, {userDisplayName} 👋</h1>
          <p className="text-muted-foreground italic mb-6">"Small progress every day leads to massive results."</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Productivity Score" value={`${prodScore}/100`} sub={prodScore > 50 ? "Excellent" : "Needs Improvement"} icon={TrendingUp} color="text-primary" />
            <StatCard label="Total Tasks" value={totalTasks.toString()} sub="All time" icon={ListTodo} />
            <StatCard label="Completed Tasks" value={completedTasks.toString()} sub="Awesome work" icon={CheckCircle2} color="text-accent" />
            <StatCard label="Pending Tasks" value={pendingTasks.toString()} sub="To do" icon={Clock} />
            
            <StatCard label="Overdue Tasks" value={overdueTasks.toString()} sub="Needs attention" icon={AlertCircle} color={overdueTasks > 0 ? "text-destructive" : "text-muted-foreground"} />
            <StatCard label="Focus Time" value={`${focusHours}h`} sub={`${focusTime} mins total`} icon={Clock} color="text-purple-400" />
            <StatCard label="Goal Completion" value={`${goalCompletion}/${goals.length}`} sub="Goals achieved" icon={Target} color="text-amber-400" />
            <StatCard label="Habit Completion" value={`${habitsDoneToday}/${habits.length}`} sub="Done today" icon={CalendarDays} color="text-blue-400" />
          </div>
          
          <div className="bg-white/5 p-5 rounded-2xl border border-white/5 shadow-sm flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 mt-1">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-foreground">AI Insight</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{latestAiReport}</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color = "text-foreground" }: any) {
  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-sm hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span>{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}
