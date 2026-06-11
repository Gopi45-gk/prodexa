import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, ListChecks, Calendar, BarChart3,
  Settings, Moon, Sun, User as UserIcon, Search, Bell, Target, BookOpen, Clock, BrainCircuit, Trophy, GraduationCap, Briefcase, LogOut, X, Menu
} from "lucide-react";
import { toast } from "sonner";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useStore, View } from "@/contexts/StoreContext";

// Modular Views
import { DashboardHome } from "./views/DashboardHome";
import { TaskWorkspace } from "./views/TaskWorkspace";
import { GoalsView } from "./views/GoalsView";
import { HabitsView } from "./views/HabitsView";
import { FocusHub } from "./views/FocusHub";
import { CalendarHub } from "./views/CalendarHub";
import { AnalyticsHub } from "./views/AnalyticsHub";
import { AICoachView } from "./views/AICoachView";
import { AchievementsView } from "./views/AchievementsView";
import { StudentCareerView } from "./views/StudentCareerView";
import { Chatbot } from "./Chatbot";
function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function Dashboard({ user }: { user: FirebaseUser }) {
  const { view, setView, dark, toggleTheme, activity, clearData, level } = useStore();
  const [now, setNow] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [modal, setModal] = useState<null | "Settings" | "Profile">(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const userDisplayName = user.displayName || user.email?.split("@")[0] || "User";
  const userInitials = userDisplayName.slice(0, 1).toUpperCase();

  const onLogout = async () => {
    try {
      await auth.signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setNotifOpen(false); setModal(null); setSearch(""); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const searchResults = search.trim() ? [
    ...tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase())).map(t => ({ type: "Task" as const, title: t.title, view: "Tasks" as View })),
    ...useStore().goals.filter(g => g.title.toLowerCase().includes(search.toLowerCase())).map(g => ({ type: "Goal" as const, title: g.title, view: "Goals" as View })),
    ...useStore().calendarEvents.filter(e => e.title.toLowerCase().includes(search.toLowerCase())).map(e => ({ type: "Event" as const, title: e.title, view: "Calendar" as View })),
    ...useStore().studentAssignments.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).map(a => ({ type: "Assignment" as const, title: a.title, view: "Student Mode" as View }))
  ].slice(0, 5) : [];

  const handleNav = (label: View) => {
    setView(label);
    setSidebarOpen(false);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const menu: { icon: any; label: View }[] = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: ListChecks, label: "Tasks" },
    { icon: Target, label: "Goals" },
    { icon: BookOpen, label: "Habits" },
    { icon: Clock, label: "Focus Hub" },
    { icon: Calendar, label: "Calendar" },
    { icon: BarChart3, label: "Analytics" },
    { icon: BrainCircuit, label: "AI Coach" },
    { icon: Trophy, label: "Achievements" },
    { icon: GraduationCap, label: "Student Mode" },
    { icon: Briefcase, label: "Career Tracker" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div ref={topRef} className="min-h-screen">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 h-screen w-64 flex flex-col glass border-r border-white/10 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-bold">P</span>
          </div>
          <div className="font-display font-bold">PRODEXA</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menu.map(({ icon: Icon, label }) => {
            const isActive = view === label;
            return (
              <button
                key={label}
                onClick={() => handleNav(label)}
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
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
          >
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {dark ? "Dark Mode" : "Light Mode"}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground mt-1"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass border-b backdrop-blur-xl">
          <div className="flex items-center gap-4 px-4 md:px-8 py-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value.slice(0, 80))}
                placeholder="Global search…"
                className="w-full rounded-xl border border-border bg-white/5 pl-10 pr-9 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md hover:bg-white/10 flex items-center justify-center z-10">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {search && (
                <div className="absolute top-full mt-2 w-full glass rounded-xl shadow-elegant z-40 p-2 border border-white/10 animate-fade-up">
                  {searchResults.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">No results found.</div>
                  ) : (
                    searchResults.map((res, i) => (
                      <button key={i} onClick={() => { handleNav(res.view); setSearch(""); }} className="w-full text-left p-2.5 rounded-lg hover:bg-white/10 flex items-center justify-between transition-colors">
                        <span className="text-sm font-medium">{res.title}</span>
                        <span className="text-[10px] uppercase text-muted-foreground bg-white/5 px-2 py-0.5 rounded">{res.type}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="hidden md:block text-xs text-muted-foreground tabular-nums">
              {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            
            <div className="relative">
              <button onClick={() => setNotifOpen(o => !o)} className="relative h-10 w-10 rounded-xl glass hover:bg-white/10 flex items-center justify-center transition-colors">
                <Bell className="h-4 w-4" />
                {activity.length > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent shadow-glow animate-pulse" />}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 glass rounded-2xl shadow-elegant z-40 p-4 animate-fade-up border border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-semibold">Activity Feed</h4>
                    </div>
                    <div className="mt-3 max-h-72 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                      {activity.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">You're all caught up.</p>}
                      {activity.slice(0, 10).map(a => (
                        <div key={a.id} className="rounded-lg bg-white/5 p-2.5 text-sm border border-white/5">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${a.type === "completed" ? "bg-accent" : a.type === "deleted" ? "bg-destructive" : a.type === "updated" ? "bg-chart-4" : a.type === "goal" ? "bg-amber-400" : "bg-primary"}`} />
                            <span className="capitalize font-medium text-foreground">{a.type}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{timeAgo(a.at)}</span>
                          </div>
                          <div className="mt-1 text-muted-foreground line-clamp-1">{a.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button onClick={() => setModal("Profile")} className="relative h-10 w-10 rounded-xl gradient-primary flex items-center justify-center font-semibold text-primary-foreground capitalize shadow-glow hover:scale-[1.05] transition-transform">
              {userInitials}
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background flex items-center justify-center text-[8px] font-bold border border-border">
                {level}
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 pb-24 lg:pb-6 relative overflow-x-hidden">
          {view === "Dashboard" && <DashboardHome userDisplayName={userDisplayName} />}
          {view === "Tasks" && <TaskWorkspace />}
          {view === "Goals" && <GoalsView />}
          {view === "Habits" && <HabitsView />}
          {view === "Focus Hub" && <FocusHub />}
          {view === "Calendar" && <CalendarHub />}
          {view === "Analytics" && <AnalyticsHub />}
          {view === "AI Coach" && <AICoachView />}
          {view === "Achievements" && <AchievementsView />}
          {view === "Student Mode" && <StudentCareerView mode="student" />}
          {view === "Career Tracker" && <StudentCareerView mode="career" />}
          {view === "Settings" && <div className="text-center mt-20 text-muted-foreground">Settings view is rendering in modal.</div>}
          {view === "Profile" && <div className="text-center mt-20 text-muted-foreground">Profile view is rendering in modal.</div>}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-30 glass rounded-2xl px-2 py-2 flex items-center justify-around shadow-elegant border border-white/10">
          <MobileNavBtn icon={LayoutDashboard} active={view === "Dashboard"} onClick={() => handleNav("Dashboard")} />
          <MobileNavBtn icon={ListChecks} active={view === "Tasks"} onClick={() => handleNav("Tasks")} />
          <MobileNavBtn icon={Target} active={view === "Goals"} onClick={() => handleNav("Goals")} />
          <MobileNavBtn icon={BookOpen} active={view === "Habits"} onClick={() => handleNav("Habits")} />
          <MobileNavBtn icon={Clock} active={view === "Focus Hub"} onClick={() => handleNav("Focus Hub")} />
        </nav>
      </div>

      {/* Modals for Settings & Profile (or if view is explicitly set to them) */}
      {(modal === "Profile" || view === "Profile") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up" onClick={() => { setModal(null); if(view === "Profile") setView("Dashboard"); }}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-3xl shadow-elegant w-full max-w-lg p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">Profile</h3>
              <button onClick={() => { setModal(null); if(view === "Profile") setView("Dashboard"); }} className="h-9 w-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ProfilePanel user={user} onLogout={onLogout} />
          </div>
        </div>
      )}

      {(modal === "Settings" || view === "Settings") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up" onClick={() => { setModal(null); if(view === "Settings") setView("Dashboard"); }}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-3xl shadow-elegant w-full max-w-lg p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">Settings</h3>
              <button onClick={() => { setModal(null); if(view === "Settings") setView("Dashboard"); }} className="h-9 w-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <SettingsPanel dark={dark} toggleTheme={toggleTheme} onClearTasks={clearData} />
          </div>
        </div>
      )}
      
      <Chatbot />
      
      {/* Global generic styles */}
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: oklch(1 0 0 / 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: oklch(1 0 0 / 0.2);
        }
      `}</style>
    </div>
  );
}

function MobileNavBtn({ icon: Icon, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`h-11 w-11 rounded-xl flex items-center justify-center transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
      <Icon className="h-5 w-5" />
    </button>
  );
}

function ProfilePanel({ user, onLogout }: { user: FirebaseUser; onLogout: () => void }) {
  const { xp, level, tasks, goals } = useStore();
  const userDisplayName = user.displayName || user.email?.split("@")[0] || "User";
  const userInitials = userDisplayName.slice(0, 1).toUpperCase();
  
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "Completed").length;
  
  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground capitalize shadow-glow">
          {userInitials}
        </div>
        <div>
          <div className="font-display text-lg font-semibold capitalize">{userDisplayName}</div>
          <div className="text-sm text-muted-foreground">{user.email || "No email available"}</div>
        </div>
      </div>
      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5">
        <div className="flex justify-between text-sm mb-1">
          <span>Level {level}</span>
          <span className="text-muted-foreground">{xp} / {level * 100} XP</span>
        </div>
        <div className="h-2 w-full bg-background rounded-full overflow-hidden">
          <div className="h-full gradient-primary" style={{ width: `${(xp / (level * 100)) * 100}%` }} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/5 py-3 text-center border border-white/5">
          <div className="font-display text-xl font-bold">{doneTasks}</div>
          <div className="text-[10px] uppercase text-muted-foreground">Tasks Done</div>
        </div>
        <div className="rounded-xl bg-white/5 py-3 text-center border border-white/5">
          <div className="font-display text-xl font-bold">{goals.filter(g => g.progress >= g.target).length}</div>
          <div className="text-[10px] uppercase text-muted-foreground">Goals Met</div>
        </div>
      </div>
      <button onClick={onLogout} className="mt-6 w-full rounded-xl border border-border py-2.5 text-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 inline-flex items-center justify-center gap-2 transition-colors">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}

function SettingsPanel({ dark, toggleTheme, onClearTasks }: { dark: boolean; toggleTheme: () => void; onClearTasks: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl glass p-4 border border-white/5">
        <div>
          <div className="font-medium">Appearance</div>
          <div className="text-xs text-muted-foreground">Toggle dark or light theme</div>
        </div>
        <button onClick={toggleTheme} className="rounded-xl gradient-primary px-4 py-2 text-sm text-primary-foreground shadow-glow inline-flex items-center gap-2 hover:scale-[1.02] transition-transform">
          {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {dark ? "Dark" : "Light"}
        </button>
      </div>
      <div className="flex items-center justify-between rounded-xl glass p-4 border border-white/5">
        <div>
          <div className="font-medium">Notifications</div>
          <div className="text-xs text-muted-foreground">Smart activity alerts</div>
        </div>
        <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-md">Enabled</span>
      </div>
      <div className="flex items-center justify-between rounded-xl glass p-4 border border-destructive/20 bg-destructive/5">
        <div>
          <div className="font-medium text-destructive">Factory Reset</div>
          <div className="text-xs text-muted-foreground text-destructive/80">Erase all data and progress</div>
        </div>
        <button onClick={() => { if(confirm("Are you sure? This cannot be undone.")) onClearTasks(); }} className="rounded-xl border border-destructive/30 px-4 py-2 text-sm text-destructive hover:bg-destructive/20 transition-colors">
          Clear All
        </button>
      </div>
    </div>
  );
}
