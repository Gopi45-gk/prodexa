import { useState } from "react";
import { useStore, CalendarEvent } from "@/contexts/StoreContext";
import { Calendar, Plus, Clock, ListTodo, X, MoreVertical, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarHub() {
  const { tasks, calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = useStore();
  const [view, setView] = useState<"Day" | "Week" | "Month">("Week");
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({ title: "", type: "Event", description: "", date: new Date().toISOString().slice(0, 10) });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    if (editingEventId) {
      updateCalendarEvent(editingEventId, {
        title: eventForm.title,
        type: eventForm.type as any,
        description: eventForm.description,
        date: eventForm.date
      });
    } else {
      addCalendarEvent({
        title: eventForm.title,
        type: eventForm.type as any,
        description: eventForm.description,
        date: eventForm.date
      });
    }

    setIsEventFormOpen(false);
    setEventForm({ title: "", type: "Event", description: "", date: new Date().toISOString().slice(0, 10) });
    setEditingEventId(null);
  };

  const openEditEvent = (e: CalendarEvent) => {
    setEditingEventId(e.id);
    setEventForm({ title: e.title, type: e.type, description: e.description || "", date: e.date });
    setIsEventFormOpen(true);
    setOpenMenuId(null);
  };

  const getUpcomingDays = () => {
    const days = [];
    const count = view === "Day" ? 1 : view === "Week" ? 7 : 28;
    for (let i = 0; i < count; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  };

  const upcomingDays = getUpcomingDays();

  return (
    <div className="animate-fade-up h-full flex flex-col" onClick={() => setOpenMenuId(null)}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" /> Calendar
          </h2>
          <p className="text-muted-foreground mt-1">Your schedule overview.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            {["Day", "Week", "Month"].map(v => (
              <button 
                key={v} 
                onClick={() => setView(v as any)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === v ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => { setEditingEventId(null); setEventForm({ title: "", type: "Event", description: "", date: new Date().toISOString().slice(0, 10) }); setIsEventFormOpen(true); }} className="gradient-primary h-10 px-4 rounded-xl text-primary-foreground font-semibold flex items-center gap-2 shadow-glow hover:scale-[1.02] transition-transform">
            <Plus className="h-4 w-4" /> Add Event
          </button>
        </div>
      </div>

      <div className={`grid gap-4 flex-1 overflow-y-auto custom-scrollbar ${view === "Day" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-7"}`}>
        {upcomingDays.map((dateStr, idx) => {
          const dateTasks = tasks.filter(t => t.dueDate === dateStr && t.status !== "Completed" && t.status !== "Archived");
          const dateEvents = calendarEvents.filter(e => e.date === dateStr);
          const dateObj = new Date(dateStr);
          const isToday = idx === 0;

          return (
            <div key={dateStr} className={`glass rounded-2xl border ${isToday ? "border-primary/50 bg-primary/5" : "border-white/5"} p-4 flex flex-col`}>
              <div className="text-center mb-4 border-b border-white/10 pb-2">
                <div className={`text-xs uppercase font-bold tracking-wider ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {isToday ? "Today" : dateObj.toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
                <div className={`text-2xl font-display font-bold ${isToday ? "text-foreground" : "text-muted-foreground"}`}>
                  {dateObj.getDate()}
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                {dateEvents.map(e => (
                  <div key={e.id} className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-xs text-foreground group relative">
                    <div className="font-semibold flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {e.title}
                      </div>
                      <div className="relative">
                        <button onClick={(ev) => { ev.stopPropagation(); setOpenMenuId(openMenuId === e.id ? null : e.id); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-3 w-3" />
                        </button>
                        {openMenuId === e.id && (
                          <div className="absolute right-0 top-4 w-28 glass border border-white/10 rounded-xl shadow-elegant z-10 py-1 overflow-hidden">
                            <button onClick={(ev) => { ev.stopPropagation(); openEditEvent(e); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 flex items-center gap-2">
                              <Edit2 className="h-3 w-3" /> Edit
                            </button>
                            <button onClick={(ev) => { ev.stopPropagation(); deleteCalendarEvent(e.id); setOpenMenuId(null); }} className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10 flex items-center gap-2">
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {e.description && <div className="text-muted-foreground line-clamp-2">{e.description}</div>}
                  </div>
                ))}
                {dateTasks.map(t => (
                  <div key={t.id} className="p-2 rounded-lg bg-white/5 border border-white/10 text-xs text-foreground">
                    <div className="font-semibold flex items-center gap-1 mb-1"><ListTodo className="h-3 w-3" /> {t.title}</div>
                  </div>
                ))}
                {dateEvents.length === 0 && dateTasks.length === 0 && (
                  <div className="text-center py-4 text-xs text-muted-foreground opacity-50">No events</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isEventFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up" onClick={() => setIsEventFormOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-3xl shadow-elegant w-full max-w-sm p-5 sm:p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">{editingEventId ? "Edit" : "New"} Event</h3>
              <button onClick={() => setIsEventFormOpen(false)} className="h-9 w-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Title</label>
                <input required value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="input w-full" placeholder="Event name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Description</label>
                <textarea value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} className="input w-full min-h-[60px]" placeholder="Optional details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Date</label>
                  <input type="date" required value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Type</label>
                  <select value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value})} className="input w-full bg-background text-foreground appearance-none">
                    <option value="Event">Event</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Reminder">Reminder</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold h-11 rounded-xl shadow-glow hover:scale-[1.02] transition-transform mt-2">
                {editingEventId ? "Save Changes" : "Add Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
