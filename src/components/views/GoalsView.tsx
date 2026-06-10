import { useState } from "react";
import { useStore, Goal } from "@/contexts/StoreContext";
import { Plus, Target, CheckCircle2, X, MoreVertical, Edit2, Trash2 } from "lucide-react";

export function GoalsView() {
  const { goals, addGoal, updateGoal, deleteGoal, updateGoalProgress } = useStore();
  const [tab, setTab] = useState<"Daily" | "Weekly" | "Monthly" | "Yearly">("Weekly");
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState({ title: "", target: 100 });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.title.trim()) return;
    
    if (editingGoalId) {
      updateGoal(editingGoalId, { title: goalForm.title, target: Number(goalForm.target) });
    } else {
      addGoal({ title: goalForm.title, type: tab, progress: 0, target: Number(goalForm.target), deadline: new Date().toISOString() });
    }
    
    setIsGoalFormOpen(false);
    setGoalForm({ title: "", target: 100 });
    setEditingGoalId(null);
  };

  const openEditGoal = (g: Goal) => {
    setEditingGoalId(g.id);
    setGoalForm({ title: g.title, target: g.target });
    setIsGoalFormOpen(true);
    setOpenMenuId(null);
  };

  const filtered = goals.filter(g => g.type === tab);

  return (
    <div className="animate-fade-up h-full flex flex-col" onClick={() => setOpenMenuId(null)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-display font-bold">Goals</h2>
          <p className="text-muted-foreground mt-1">Set, track, and crush your milestones.</p>
        </div>
        <button onClick={() => { setEditingGoalId(null); setGoalForm({ title: "", target: 100 }); setIsGoalFormOpen(true); }} className="gradient-primary h-10 px-4 rounded-xl text-primary-foreground font-semibold flex items-center gap-2 shadow-glow hover:scale-[1.02] transition-transform">
          <Plus className="h-4 w-4" /> New Goal
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-6">
        {["Daily", "Weekly", "Monthly", "Yearly"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-all ${tab === t ? "bg-white/10 font-semibold border border-white/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground glass rounded-2xl border border-white/5">
            No {tab.toLowerCase()} goals set yet.
          </div>
        ) : filtered.map(g => {
          const pct = Math.min(100, Math.round((g.progress / g.target) * 100));
          return (
            <div key={g.id} className="glass rounded-2xl p-5 border border-white/5 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
              {pct >= 100 && <div className="absolute inset-0 bg-accent/10 z-0 pointer-events-none" />}
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    {pct >= 100 ? <CheckCircle2 className="h-5 w-5 text-accent" /> : <Target className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === g.id ? null : g.id); }} className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenuId === g.id && (
                        <div className="absolute right-0 top-5 w-32 glass border border-white/10 rounded-xl shadow-elegant z-10 py-1 overflow-hidden">
                          <button onClick={(e) => { e.stopPropagation(); openEditGoal(g); }} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2">
                            <Edit2 className="h-3 w-3" /> Edit
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteGoal(g.id); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2">
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="font-display font-bold text-2xl">{pct}%</div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-1 pr-8">{g.title}</h3>
                <div className="text-xs text-muted-foreground mb-4">Target: {g.target}</div>
                
                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden mb-4">
                  <div className={`h-full transition-all duration-1000 ${pct >= 100 ? "bg-accent" : "gradient-primary"}`} style={{ width: `${pct}%` }} />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => updateGoalProgress(g.id, Math.max(0, g.progress - 10))} className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs transition-colors">-10</button>
                  <button onClick={() => updateGoalProgress(g.id, Math.min(g.target, g.progress + 10))} className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs transition-colors">+10</button>
                  {pct < 100 && <button onClick={() => updateGoalProgress(g.id, g.target)} className="flex-1 py-1.5 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 text-xs transition-colors font-medium">Complete</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isGoalFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up" onClick={() => setIsGoalFormOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-3xl shadow-elegant w-full max-w-sm p-5 sm:p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">{editingGoalId ? "Edit" : "New"} {tab} Goal</h3>
              <button onClick={() => setIsGoalFormOpen(false)} className="h-9 w-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Title</label>
                <input required value={goalForm.title} onChange={e => setGoalForm({...goalForm, title: e.target.value})} className="input w-full" placeholder="What do you want to achieve?" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Target (Number)</label>
                <input type="number" required min={1} value={goalForm.target} onChange={e => setGoalForm({...goalForm, target: Number(e.target.value)})} className="input w-full" />
              </div>
              <button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold h-11 rounded-xl shadow-glow hover:scale-[1.02] transition-transform mt-2">
                {editingGoalId ? "Save Changes" : "Create Goal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
