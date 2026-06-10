import { useState } from "react";
import { useStore, Habit } from "@/contexts/StoreContext";
import { Plus, Check, Flame, X, MoreVertical, Edit2, Trash2 } from "lucide-react";

export function HabitsView() {
  const { habits, addHabit, updateHabit, deleteHabit, toggleHabit } = useStore();
  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [habitName, setHabitName] = useState("");

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    
    if (editingHabitId) {
      updateHabit(editingHabitId, habitName);
    } else {
      addHabit(habitName);
    }
    
    setIsHabitFormOpen(false);
    setHabitName("");
    setEditingHabitId(null);
  };

  const openEditHabit = (h: Habit) => {
    setEditingHabitId(h.id);
    setHabitName(h.name);
    setIsHabitFormOpen(true);
    setOpenMenuId(null);
  };

  // Generate last 7 days
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  return (
    <div className="animate-fade-up h-full flex flex-col" onClick={() => setOpenMenuId(null)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-display font-bold">Habits Tracker</h2>
          <p className="text-muted-foreground mt-1">Build consistency and track your streaks.</p>
        </div>
        <button onClick={() => { setEditingHabitId(null); setHabitName(""); setIsHabitFormOpen(true); }} className="gradient-primary h-10 px-4 rounded-xl text-primary-foreground font-semibold flex items-center gap-2 shadow-glow hover:scale-[1.02] transition-transform">
          <Plus className="h-4 w-4" /> New Habit
        </button>
      </div>

      <div className="glass rounded-3xl p-6 border border-white/5 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="pb-4 font-medium text-muted-foreground pl-2">Habit</th>
              <th className="pb-4 font-medium text-muted-foreground text-center">Streak</th>
              {days.map(d => (
                <th key={d} className="pb-4 font-medium text-muted-foreground text-center text-xs">
                  {new Date(d).toLocaleDateString(undefined, { weekday: 'short' })}<br/>
                  <span className="text-foreground">{d.slice(8, 10)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map(h => (
              <tr key={h.id} className="border-t border-white/5 group">
                <td className="py-4 pl-2 font-medium relative flex items-center gap-2">
                  <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === h.id ? null : h.id); }} className="text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenuId === h.id && (
                      <div className="absolute left-0 top-5 w-32 glass border border-white/10 rounded-xl shadow-elegant z-10 py-1 overflow-hidden">
                        <button onClick={(e) => { e.stopPropagation(); openEditHabit(h); }} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2">
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteHabit(h.id); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2">
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {h.name}
                </td>
                <td className="py-4 text-center">
                  <div className="inline-flex items-center gap-1 bg-accent/10 text-accent px-2 py-1 rounded-md text-xs font-bold">
                    <Flame className="h-3 w-3" /> {h.streak}
                  </div>
                </td>
                {days.map(d => {
                  const isDone = h.completions.includes(d);
                  return (
                    <td key={d} className="py-4 text-center">
                      <button 
                        onClick={() => toggleHabit(h.id, d)}
                        className={`h-8 w-8 rounded-lg inline-flex items-center justify-center transition-all ${isDone ? "gradient-primary text-primary-foreground shadow-glow scale-110" : "bg-white/5 text-transparent hover:bg-white/10"}`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isHabitFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up" onClick={() => setIsHabitFormOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-3xl shadow-elegant w-full max-w-sm p-5 sm:p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">{editingHabitId ? "Edit" : "New"} Habit</h3>
              <button onClick={() => setIsHabitFormOpen(false)} className="h-9 w-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Habit Name</label>
                <input required value={habitName} onChange={e => setHabitName(e.target.value)} className="input w-full" placeholder="e.g., Read for 30 minutes" />
              </div>
              <button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold h-11 rounded-xl shadow-glow hover:scale-[1.02] transition-transform mt-2">
                {editingHabitId ? "Save Changes" : "Create Habit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
