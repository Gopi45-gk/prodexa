import { useStore } from "@/contexts/StoreContext";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Flame, Target, Zap } from "lucide-react";

export function AnalyticsHub() {
  const { tasks, focusSessions, habits } = useStore();

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "Completed").length;

  const dataTasks = [
    { name: "Completed", value: doneTasks },
    { name: "Pending", value: tasks.filter(t => t.status === "To Do").length },
    { name: "In Progress", value: tasks.filter(t => t.status === "In Progress" || t.status === "Review").length },
  ];
  const COLORS = ["#10b981", "#ef4444", "#3b82f6"];

  const getWeeklyProd = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
      
      // Calculate tasks completed on this day
      const completedTasks = tasks.filter(t => t.status === "Completed" && t.completedAt && new Date(t.completedAt).toISOString().slice(0, 10) === dateStr).length;
      
      // Calculate focus sessions on this day
      const focusMinutes = focusSessions.filter(f => f.date.slice(0, 10) === dateStr).reduce((acc, f) => acc + f.durationMinutes, 0);
      
      days.push({ name: dayName, tasks: completedTasks, focus: focusMinutes / 60 });
    }
    return days;
  };

  const weeklyProd = getWeeklyProd();

  const totalFocusHours = focusSessions.reduce((acc, f) => acc + f.durationMinutes, 0) / 60;
  const focusScore = Math.min(100, Math.round((totalFocusHours / 40) * 100)); // Assuming 40 hrs is 100%
  const distractionScore = 100 - focusScore;

  const focusDistractionData = [
    { name: "Focus", value: focusScore },
    { name: "Distraction", value: distractionScore }
  ];
  const FOCUS_COLORS = ["#8b5cf6", "#3f3f46"];

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold">Analytics Hub</h2>
        <p className="text-muted-foreground mt-1">Deep insights into your productivity patterns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-6 border border-white/5">
          <h3 className="font-semibold mb-6">Task Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataTasks} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {dataTasks.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {dataTasks.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-6 border border-white/5">
          <h3 className="font-semibold mb-6">Weekly Productivity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProd}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="tasks" fill="url(#colorUv)" radius={[4, 4, 0, 0]} name="Tasks Done" />
                <Bar dataKey="focus" fill="#10b981" radius={[4, 4, 0, 0]} name="Focus Hours" />
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#c084fc" stopOpacity={0.5}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="glass rounded-3xl p-6 border border-white/5">
          <h3 className="font-semibold mb-6 flex items-center gap-2"><Flame className="h-5 w-5 text-accent" /> Habit Consistency</h3>
          <div className="flex flex-col gap-4">
            {habits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No habits tracked yet.</p>
            ) : (
              habits.slice().sort((a, b) => b.streak - a.streak).slice(0, 5).map(h => (
                <div key={h.id} className="flex items-center justify-between">
                  <span className="text-sm">{h.name}</span>
                  <div className="flex items-center gap-1 text-accent font-bold text-sm bg-accent/10 px-2 py-1 rounded-lg">
                    <Flame className="h-3 w-3" /> {h.streak}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass rounded-3xl p-6 border border-white/5">
          <h3 className="font-semibold mb-6 flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Focus vs Distraction</h3>
          <div className="h-32 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={focusDistractionData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value">
                  {focusDistractionData.map((entry, index) => <Cell key={`fd-${index}`} fill={FOCUS_COLORS[index % FOCUS_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Based on an optimal 40h work week.</p>
            <div className="font-display font-bold text-3xl mt-2">{focusScore}<span className="text-lg text-muted-foreground">%</span></div>
            <p className="text-sm font-medium text-primary uppercase tracking-wider mt-1">Focus Score</p>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 border border-white/5">
          <h3 className="font-semibold mb-6 flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-500" /> Deep Work Hours</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyProd}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.1)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Line type="monotone" dataKey="focus" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} name="Hours" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
