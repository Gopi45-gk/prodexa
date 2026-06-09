import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, ListChecks, CheckCircle2, Clock, Calendar, BarChart3,
  Settings, Moon, Sun, User, Search, Bell, Plus, Trash2, Pencil, Check,
  TrendingUp, Sparkles, Flame, Target, LogOut
} from "lucide-react";
import { toast } from "sonner";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, LineChart, Line, CartesianGrid
} from "recharts";

type Priority = "Low" | "Medium" | "High";
type Status = "pending" | "completed";
type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  dueDate: string;
  status: Status;
  createdAt: number;
};

const STORAGE_KEY = "stm.tasks.v1";
const ACTIVITY_KEY = "stm.activity.v1";

type Activity = { id: string; type: "added" | "updated" | "completed" | "deleted"; title: string; at: number };

const seedTasks = (): Task[] => [
  { id: crypto.randomUUID(), title: "Ship Q1 product roadmap", description: "Finalize and publish to the team", priority: "High", category: "Work", dueDate: new Date(Date.now() + 86400000).toISOString().slice(0,10), status: "pending", createdAt: Date.now() - 3600000 },
  { id: crypto.randomUUID(), title: "Design system audit", description: "Review tokens, components, spacing", priority: "Medium", category: "Design", dueDate: new Date(Date.now() + 2*86400000).toISOString().slice(0,10), status: "pending", createdAt: Date.now() - 7200000 },
  { id: crypto.randomUUID(), title: "Morning workout", description: "45-min strength training", priority: "Low", category: "Health", dueDate: new Date().toISOString().slice(0,10), status: "completed", createdAt: Date.now() - 10800000 },
  { id: crypto.randomUUID(), title: "Client kickoff prep", description: "Slides, agenda, demo", priority: "High", category: "Work", dueDate: new Date(Date.now() + 3*86400000).toISOString().slice(0,10), status: "pending", createdAt: Date.now() - 5400000 },
];

export function Dashboard({ user, onLogout }: { user: string; onLogout: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [dark, setDark] = useState(true);
  const [active, setActive] = useState("Dashboard");
  const [now, setNow] = useState(new Date());
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  // form
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [category, setCategory] = useState("Work");
  const [due, setDue] = useState(new Date().toISOString().slice(0,10));
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    setTasks(raw ? JSON.parse(raw) : seedTasks());
    const a = localStorage.getItem(ACTIVITY_KEY);
    setActivity(a ? JSON.parse(a) : []);
    const t = localStorage.getItem("stm.theme");
    if (t === "light") { setDark(false); document.documentElement.classList.add("light"); }
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity.slice(0,20))); }, [activity]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  const pushActivity = (type: Activity["type"], title: string) => {
    setActivity((p) => [{ id: crypto.randomUUID(), type, title, at: Date.now() }, ...p]);
  };

  const resetForm = () => {
    setTitle(""); setDesc(""); setPriority("Medium"); setCategory("Work");
    setDue(new Date().toISOString().slice(0,10)); setEditingId(null);
  };

  const submitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Task title is required"); return; }
    if (editingId) {
      setTasks((p) => p.map(t => t.id === editingId ? { ...t, title, description: desc, priority, category, dueDate: due } : t));
      pushActivity("updated", title);
      toast.success("Task updated");
    } else {
      const t: Task = { id: crypto.randomUUID(), title, description: desc, priority, category, dueDate: due, status: "pending", createdAt: Date.now() };
      setTasks((p) => [t, ...p]);
      pushActivity("added", title);
      toast.success("Task added");
    }
    resetForm();
  };

  const remove = (t: Task) => { setTasks((p) => p.filter(x => x.id !== t.id)); pushActivity("deleted", t.title); toast.error("Task deleted"); };
  const complete = (t: Task) => {
    setTasks((p) => p.map(x => x.id === t.id ? { ...x, status: x.status === "completed" ? "pending" : "completed" } : x));
    if (t.status !== "completed") { pushActivity("completed", t.title); toast.success("Task completed"); }
  };
  const edit = (t: Task) => {
    setEditingId(t.id); setTitle(t.title); setDesc(t.description); setPriority(t.priority); setCategory(t.category); setDue(t.dueDate);
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("light", !next);
    localStorage.setItem("stm.theme", next ? "dark" : "light");
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === "completed").length;
    const pending = total - done;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { total, done, pending, pct };
  }, [tasks]);

  const visibleTasks = useMemo(() =>
    tasks.filter(t => filter === "all" ? true : t.status === filter),
  [tasks, filter]);

  const pieData = [
    { name: "Completed", value: stats.done },
    { name: "Pending", value: stats.pending },
  ];
  const COLORS = ["oklch(0.72 0.19 285)", "oklch(0.78 0.17 200)"];

  const weekly = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((d, i) => ({ day: d, tasks: 3 + ((i * 7 + tasks.length) % 9) }));
  }, [tasks]);
  const monthly = useMemo(() =>
    Array.from({ length: 8 }).map((_, i) => ({ w: `W${i+1}`, score: 40 + ((i * 13 + stats.done * 5) % 55) })),
  [stats.done]);

  const menu = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: ListChecks, label: "Tasks" },
    { icon: CheckCircle2, label: "Completed" },
    { icon: Clock, label: "Pending" },
    { icon: Calendar, label: "Calendar" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Settings, label: "Settings" },
    { icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden lg:flex h-screen w-64 flex-col glass border-r">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="font-display font-bold">TaskForge</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menu.map(({ icon: Icon, label }) => {
            const isActive = active === label;
            return (
              <button
                key={label}
                onClick={() => setActive(label)}
                className={`group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive ? "gradient-primary text-primary-foreground shadow-glow" : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {isActive && <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
              </button>
            );
          })}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
          >
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {dark ? "Dark Mode" : "Light Mode"}
          </button>
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass border-b backdrop-blur-xl">
          <div className="flex items-center gap-4 px-4 md:px-8 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search tasks, projects, people…"
                className="w-full rounded-xl border border-border bg-white/5 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="hidden md:block text-xs text-muted-foreground tabular-nums">
              {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <button className="relative h-10 w-10 rounded-xl glass hover:bg-white/10 flex items-center justify-center">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent shadow-glow" />
            </button>
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center font-semibold text-primary-foreground capitalize">
              {user.slice(0,1)}
            </div>
          </div>
        </header>

        <main className="px-4 md:px-8 py-6 space-y-6 pb-24 lg:pb-6">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl glass p-6 md:p-8 shadow-elegant animate-fade-up">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -left-10 -bottom-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative grid md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-accent" /> You're on a 6-day streak
                </div>
                <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold capitalize">
                  Welcome back, {user} <span className="inline-block animate-float">👋</span>
                </h1>
                <p className="mt-2 text-muted-foreground max-w-md">
                  Stay productive and achieve your goals today. You have {stats.pending} tasks waiting.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Stat icon={Flame} label="Productivity" value={`${Math.min(99, 60 + stats.pct/3)|0}%`} />
                  <Stat icon={Target} label="Today" value={`${stats.done}/${stats.total}`} />
                </div>
              </div>
              <div className="relative">
                <div className="glass rounded-2xl p-5">
                  <div className="text-xs text-muted-foreground">Today's progress</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <div className="font-display text-4xl font-bold gradient-text tabular-nums">{stats.pct}%</div>
                    <div className="text-xs text-muted-foreground">completion</div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full gradient-primary transition-all duration-700" style={{ width: `${stats.pct}%` }} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <MiniMetric label="Done" value={stats.done} />
                    <MiniMetric label="Pending" value={stats.pending} />
                    <MiniMetric label="Total" value={stats.total} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats cards */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Tasks" value={stats.total} icon={ListChecks} delay="delay-100" />
            <StatCard label="Completed" value={stats.done} icon={CheckCircle2} delay="delay-200" />
            <StatCard label="Pending" value={stats.pending} icon={Clock} delay="delay-300" />
            <StatCard label="Completion" value={`${stats.pct}%`} icon={TrendingUp} delay="delay-500" />
          </section>

          {/* Form + Tasks */}
          <section className="grid lg:grid-cols-3 gap-6">
            <form onSubmit={submitTask} className="glass rounded-3xl p-6 shadow-elegant animate-fade-up">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">{editingId ? "Edit task" : "Create task"}</h3>
                <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                  <Plus className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <Field label="Task name">
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Design the onboarding flow" className="input" />
                </Field>
                <Field label="Description">
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Add a few notes…" rows={3} className="input resize-none" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Priority">
                    <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="input">
                      <option>Low</option><option>Medium</option><option>High</option>
                    </select>
                  </Field>
                  <Field label="Category">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                      <option>Work</option><option>Design</option><option>Personal</option><option>Health</option><option>Learning</option>
                    </select>
                  </Field>
                </div>
                <Field label="Due date">
                  <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="input" />
                </Field>
              </div>
              <button type="submit" className="mt-5 w-full rounded-xl gradient-primary py-3 font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]">
                {editingId ? "Save changes" : "Add task"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="mt-2 w-full rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:bg-white/5">
                  Cancel
                </button>
              )}
            </form>

            <div className="lg:col-span-2 glass rounded-3xl p-6 shadow-elegant animate-fade-up delay-200">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-display text-lg font-semibold">Your tasks</h3>
                <div className="flex items-center gap-1 rounded-xl glass p-1 text-sm">
                  {(["all", "pending", "completed"] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-all ${filter === f ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {visibleTasks.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                    Nothing here yet. Create your first task.
                  </div>
                )}
                {visibleTasks.map((t, i) => (
                  <div key={t.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-up group glass rounded-2xl p-4 hover-lift">
                    <div className="flex items-start gap-4">
                      <button onClick={() => complete(t)}
                        className={`mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          t.status === "completed" ? "gradient-primary border-transparent shadow-glow" : "border-border hover:border-primary"
                        }`}>
                        {t.status === "completed" && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-medium ${t.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{t.title}</h4>
                          <PriorityBadge p={t.priority} />
                          <span className="text-xs rounded-md bg-white/5 px-2 py-0.5 text-muted-foreground">{t.category}</span>
                        </div>
                        {t.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.description}</p>}
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {t.dueDate}</span>
                          <span className={`inline-flex items-center gap-1 ${t.status === "completed" ? "text-accent" : ""}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" /> {t.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => edit(t)} className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => remove(t)} className="h-8 w-8 rounded-lg hover:bg-destructive/20 hover:text-destructive flex items-center justify-center" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Analytics */}
          <section className="grid lg:grid-cols-3 gap-6">
            <ChartCard title="Task Distribution">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={4}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={tipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{background: COLORS[0]}} /> Completed</span>
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{background: COLORS[1]}} /> Pending</span>
              </div>
            </ChartCard>

            <ChartCard title="Weekly Productivity">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.08)" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="oklch(0.7 0.03 260)" fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} stroke="oklch(0.7 0.03 260)" fontSize={11} />
                  <Tooltip contentStyle={tipStyle} cursor={{ fill: "oklch(1 0 0 / 0.05)" }} />
                  <Bar dataKey="tasks" fill="oklch(0.72 0.19 285)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Monthly Progress">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.08)" />
                  <XAxis dataKey="w" tickLine={false} axisLine={false} stroke="oklch(0.7 0.03 260)" fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} stroke="oklch(0.7 0.03 260)" fontSize={11} />
                  <Tooltip contentStyle={tipStyle} />
                  <Line type="monotone" dataKey="score" stroke="oklch(0.78 0.17 200)" strokeWidth={3} dot={{ fill: "oklch(0.78 0.17 200)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>

          {/* Goal + Activity */}
          <section className="grid lg:grid-cols-3 gap-6">
            <div className="glass rounded-3xl p-6 shadow-elegant flex flex-col items-center justify-center">
              <h3 className="font-display text-lg font-semibold self-start">Goal Completion</h3>
              <div className="relative my-4">
                <svg className="h-44 w-44 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="oklch(1 0 0 / 0.08)" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="42" stroke="url(#gg)" strokeWidth="8" fill="none" strokeLinecap="round"
                    strokeDasharray={`${stats.pct * 2.64} 1000`} className="transition-all duration-1000" />
                  <defs>
                    <linearGradient id="gg" x1="0" x2="1">
                      <stop offset="0%" stopColor="oklch(0.72 0.19 285)" />
                      <stop offset="100%" stopColor="oklch(0.78 0.17 200)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="font-display text-4xl font-bold gradient-text tabular-nums">{stats.pct}%</div>
                  <div className="text-xs text-muted-foreground">of your goal</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">Keep going — you're closer than yesterday.</p>
            </div>

            <div className="lg:col-span-2 glass rounded-3xl p-6 shadow-elegant">
              <h3 className="font-display text-lg font-semibold">Activity</h3>
              <div className="mt-4 relative pl-6 space-y-4 max-h-80 overflow-y-auto">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                {activity.length === 0 && (
                  <div className="text-sm text-muted-foreground">No activity yet — create or complete a task.</div>
                )}
                {activity.map((a, i) => (
                  <div key={a.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-slide-in-right relative">
                    <span className={`absolute -left-[18px] top-1.5 h-3 w-3 rounded-full ring-4 ring-background ${
                      a.type === "completed" ? "bg-accent" : a.type === "deleted" ? "bg-destructive" : a.type === "updated" ? "bg-chart-4" : "bg-primary"
                    }`} />
                    <div className="text-sm">
                      <span className="font-medium capitalize">{a.type}</span>{" "}
                      <span className="text-muted-foreground">— {a.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-30 glass rounded-2xl px-2 py-2 flex items-center justify-around shadow-elegant">
          {[LayoutDashboard, ListChecks, Plus, BarChart3, User].map((Icon, i) => (
            <button key={i} className={`h-11 w-11 rounded-xl flex items-center justify-center ${i === 2 ? "gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"}`}>
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </nav>
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--color-border);
          background: oklch(1 0 0 / 0.05);
          padding: 0.7rem 0.9rem;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
          color: var(--color-foreground);
        }
        .input:focus {
          border-color: var(--color-primary);
          background: oklch(1 0 0 / 0.08);
          box-shadow: 0 0 0 4px oklch(0.72 0.19 285 / 0.15);
        }
      `}</style>
    </div>
  );
}

const tipStyle = {
  background: "oklch(0.21 0.035 265)",
  border: "1px solid oklch(1 0 0 / 0.1)",
  borderRadius: "0.75rem",
  fontSize: "12px",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl glass px-3 py-2">
      <Icon className="h-4 w-4 text-accent" />
      <div className="text-sm"><span className="font-semibold">{value}</span> <span className="text-muted-foreground">{label}</span></div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/5 py-2">
      <div className="font-display text-lg font-bold tabular-nums animate-count-up">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, delay }: any) {
  return (
    <div className={`glass rounded-2xl p-5 hover-lift animate-fade-up ${delay} relative overflow-hidden`}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-bold tabular-nums animate-count-up">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl p-6 shadow-elegant animate-fade-up">
      <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}

function PriorityBadge({ p }: { p: Priority }) {
  const map: Record<Priority, string> = {
    High: "bg-destructive/20 text-destructive",
    Medium: "bg-chart-4/20 text-chart-4",
    Low: "bg-accent/20 text-accent",
  };
  return <span className={`text-xs rounded-md px-2 py-0.5 font-medium ${map[p]}`}>{p}</span>;
}
